const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')

const ActionCreate = require('./actions').ActionCreate

const organizationSchema = mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  image: { type: String, default: '' },
  email: { type: String, default: '' },
  validated: { type: Boolean, default: false },
  authorized: { type: Boolean, default: false },
  account: { type: String, default: '' },
  rounds: Array
})
const Organization = mongoose.model('organizations', organizationSchema)

router.get('/', (req, res, next) => {
  Organization.find({ validated: true })
    .select({ name: 1, description: 1, link: 1, image: 1 })
    .then(
      organizations => {
        res.send({ organizations: organizations })
      },
      error => {
        console.error(error.message)
        next(new Error('Could not fetch organizations'))
      }
    )
})

router.post('/', (req, res, next) => {
  let org = new Organization(req.body)
  org.save().then(
    org => {
      ActionCreate.validateEmail(org)
      res.send({ id: org._id })
    },
    error => {
      console.error(error.message)
      next(new Error('Could not save organization'))
    }
  )
})


module.exports = {
  router: router,
  Organization: Organization
}
