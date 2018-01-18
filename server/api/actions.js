const express = require('express')
const router = express.Router()

const ActionHandler = require('./actions/index').ActionHandler

import { Action } from './models'

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


module.exports = {
  router: router
}

