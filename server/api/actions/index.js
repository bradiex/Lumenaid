
const mailer = require('../../mailer')
const templates = mailer.templates

const getActiveRound = require('../rounds').getActiveRound

import { Organization, Action } from '../models'

function sendMail (action, receiver) {
  const defaultReceiver = '***'
  let mailBody = {
    subject: `Lumenaid: Request for action ${action.type}`,
    html: `${action.getLink()}`,
    text: ''
  }
  if (typeof(templates[action.type]) === 'function') {
    mailBody = templates[action.type](action)
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
  },

  startRound (force) {
    console.log('--START ROUND ACTION--')
    return new Promise((resolve, reject) => {
      if (force) {
        this.stopRound().then(
          result => {
            start()
          },
          error => {
            reject(new Error(`Unable to stop round: ${error.message}`))
          }
        )
      } else {
        getActiveRound().then(
          round => {
            if (round) {
              reject(new Error(`Round already running: ${round._id}`))
            } else {
              start()
            }
          },
          error => {
            reject(new Error(`Unable to check active round: ${error.message}`))
          }
        )
      }

      function start() {
        console.log('Pre-checks succeeded.. starting new round..')
        resolve()
      }
    })
  },

  stopRound () {
    console.log('--STOP ROUND ACTION--')
    return new Promise((resolve, reject) => {
      getActiveRound().then(
        round => {
          if (round) {
            stop()
          } else {
            resolve()
          }
        },
        error => {
          console.log('ACTIVE ROUND??', error)
          console.error(error.message)
          this.error(error.message)
          reject(error)
        }
      )

      function stop () {
        console.log('Pre-checks succeeded.. stopping round..')
        resolve()
      }
    })
  }
}


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


module.exports = {
  ActionCreate: ActionCreate,
  ActionHandler: ActionHandler
}