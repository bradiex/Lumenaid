const express = require('express')
const router = express.Router()

const ActionCreate = require('./actions/index').ActionCreate

import { Organization } from './models'

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
  router: router
}
