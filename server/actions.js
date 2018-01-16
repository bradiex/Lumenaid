const express = require('express')
const router = express.Router()
const uuid4 = require('uuid/v4')

const mongoose = require('mongoose')

const mailer = require('./mailer')
const MailTemplates = require('./mail_templates')

const actionSchema = mongoose.Schema({
  type: {
    type: String,
    enum: [
      'error',
      'validate_email',
      'authorize_organization',
      'start_round',
      'update_organization',
      'verify_update_organization',
      'stop_round',
      'post_round_init',
      'post_round_review',
      'post_round_send',
      'post_round_check'
    ]
  },
  key: { type: String, default: uuid4 },
  timestamp: { type: Date, default: Date.now },
  done: { type: Boolean, default: false },
  data: { type: Object, default: null },
  status: {
    type: String,
    enum: [ 'pending', 'accepted', 'rejected', 'ignored' ],
    default: 'pending'
  },
  comments: { type: Object, default: null }
})
actionSchema.methods.getLink = function () {
  return process.env.NODE_ENV === 'production'
    ? `https://www.lumenaid.org/actions/${this.key}`
    : `http://localhost:8000/actions/${this.key}`
}
const Action = mongoose.model('actions', actionSchema)

router.get('/', (req, res, next) => {
  Action.find()
    .select({ type: 1, timestamp: 1, data: 1, status: 1, comments: 1 })
    .sort({ timestamp: -1 })
    .then(
      actions => {
        res.send({ actions: actions })
      },
      error => {
        console.error(error.message)
        next(new Error('Could not get action'))
      }
    )
})

router.get('/:actionId', (req, res, next) => {
  Action.findOne({
      key: req.params.actionId,
      $or: [ { done: 0 }, { status: 'ignored' } ]
    })
    .select({ type: 1, key: 1, timestamp: 1, data: 1, status: 1 })
    .then(
      action => {
        if (!action) {
          let error = new Error('Action not found')
          error.status = 404
          next(error)
        } else {
          res.send({ action: action })
        }
      },
      error => {
        console.error(error.message)
        next(new Error('Could not get action'))
      }
    )
})

router.patch('/:actionId', (req, res, next) => {
  let status = req.body.status
  let fields = req.body.fields
  let comments = req.body.comments
  Action.findOne({
      key: req.params.actionId,
      $or: [ { done: 0 }, { status: 'ignored' } ]
    })
    .select({ roundId: 1, type: 1, data: 1, status: 1, done: 1 })
    .then(
      action => {
        if (!action) {
          let error = new Error('Action not found')
          error.status = 404
          next(error)
        } else {
          action.status = status
          action.done = true
          ActionHandler.handle(action, fields).then(
            action => {
              action.save().then(
                action => {
                  res.send({ id: action._id })
                },
                error => {
                  console.log(error.message)
                  next(new Error('Could not save action'))
                }
              )
            },
            error => {
              console.log(error.message)
              next(new Error('Could not handle action'))
            }
          )
        }
      },
      error => {
        console.error(error.message)
        next(new Error('Could not get action'))
      }
    )
})

function sendMail (action, receiver) {
  const defaultReceiver = '***'
  let mailBody = {
    subject: `Lumenaid: Request for action ${action.type}`,
    html: `${action.getLink()}`,
    text: ''
  }
  if (typeof(MailTemplates[action.type]) === 'function') {
    mailBody = MailTemplates[action.type](action)
  } else {
    console.log(action.type, 'has no function')
  }
  mailer.send({
    to: receiver || defaultReceiver,
    subject: mailBody.subject,
    html: mailBody.html,
    text: mailBody.plain
  }).then(
    info => {
      console.log('mail sent', info)
    },
    error => {
      console.log(error.message)
      if (action.type !== 'error') {
        ActionCreate.error(action, `Could not send mail to ${receiver}`)
      }
    }
  )
}

const ActionCreate = {
  error (originalAction, message) {
    console.log('--ERROR ACTION--')
    let action = new Action({ type: 'error' })
    action.data = {
      originalAction: originalAction,
      message: message
    }
    action.save().then(
      action => {
        // send email
        sendMail(action)
      },
      error => {
        console.error(error.message)
      }
    )
  },
  validateEmail (organization) {
    console.log('--VALIDATE EMAIL ACTION--')
    let action = new Action({ type: 'validate_email' })
    action.data = {
      organizationId: organization._id,
      organizationName: organization.name,
      email: organization.email
    }
    action.save().then(
      action => {
        sendMail(action, organization.email)
      },
      error => {
        console.log(error.message)
        this.error(action, `Could not save validate_email action: ${error.message}`)
      }
    )
  },
  authorizeOrganization (organization) {
    console.log('--AUTHORIZE ORGANIZATION ACTION--')
    let action = new Action({ type: 'authorize_organization' })
    action.data = {
      organization: organization
    }
    action.save().then(
      action => {
        sendMail(action)
      },
      error => {
        console.log(error.message)
        this.error(action, `Could not save authorize_organization action: ${error.message}`)
      }
    )
  }
}

module.exports = {
  router: router,
  ActionCreate: ActionCreate
}

const Organization = require('./organizations').Organization

/* Handle action responses */
const ActionHandler = {

  // Main handle which calls the appropriate handler based on action type
  handle (action, fields) {
    return new Promise((resolve, reject) => {
      // First check if handler is implemented
      if (typeof(this[action.type]) === 'function') {
        resolve(() => this[action.type](action, fields))
      } else {
        reject(new Error('Action type not supported'))
      }
    }).then(method => method())
  },

  error (action, fields) {
    return Promise.resolve(action)
  },

  validate_email (action, fields) {
    return new Promise((resolve, reject) => {
      Organization.findOne({ _id: action.data.organizationId }).then(
        organization => {
          if (organization) {
            switch (action.status) {
              case 'accepted':
                // Validate organization
                organization.validated = true
                organization.save().then(
                  organization => {
                    // Request authorization
                    ActionCreate.authorizeOrganization(organization)
                    resolve(action)
                  },
                  error => {
                    reject(new Error('Could not update organization'))
                  }
                )
                break
              case 'rejected':
                // Remove organization
                organization.remove().then(
                  organization => {
                    resolve(action)
                  },
                  error => {
                    reject(new Error('Could not remove organization'))
                  }
                )
              default:
                resolve(action)
                break
            }
          } else {
            reject(new Error('Organization not found'))
          }
        },
        error => {
          reject(new Error('Could not fetch organization'))
        }
      )
    })
  },

  authorize_organization (action, fields) {
    return new Promise((resolve, reject) => {
      Organization.findOne({ _id: action.data.organization._id }).then(
        organization => {
          if (organization) {
            switch (action.status) {
              case 'accepted':
                // Authorize organization
                organization.authorized = true
                // Update moderated fields
                organization.description = fields.description
                organization.image = fields.image
                organization.link = fields.link
                // Update comments
                action.comments = fields.comments
                organization.save().then(
                  organization => {
                    // Send confirmation to organization
                    sendMail(action, organization.email)
                    resolve(action)
                  },
                  error => {
                    reject(new Error('Could not update organization'))
                  }
                )
                break
              case 'rejected':
                // Update comments
                action.comments = fields.comments
                organization.remove().then(
                  organization => {
                    // Send confirmation to organization
                    sendMail(action, organization.email)
                    resolve(action)
                  },
                  error => {
                    reject(new Error('Could not remove organization'))
                  }
                )
              default:
                resolve(action)
                break
            }
          } else {
            reject(new Error('Organization not found'))
          }
        },
        error => {
          reject(new Error('Could not fetch organization'))
        }
      )
    })
  }
}
