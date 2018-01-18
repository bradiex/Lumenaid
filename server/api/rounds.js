const express = require('express')
const router = express.Router()
const uuid4 = require('uuid/v4')


import { Round, Organization } from './models'

/*
r = new Round({ organizationId: '5a48eb0c38eccb282c9824ef' })
// r = new Round({ _id: '5a48eb0c38eccb282c9824ef' })
r.save().then(
  result => {
    console.log('RESULT', result)
  },
  error => {
    console.error('ERROR', error)
  }
)
*/

function getActiveRound () {
  return new Promise((resolve, reject) => {
    Round.findOne({ stop: null })
      .select({ organizationId: 1, description: 1, start: 1, stop: 1, duration: 1, amount: 1, donationCount: 1 })
      .then(
        round => {
          if (round) {
            Organization.findOne({ _id: round.organizationId })
              .select({ name: 1, description: 1, link: 1, image: 1 })
              .then(
                organization => {
                  round = JSON.parse(JSON.stringify(round))
                  round.organization = organization
                  resolve(round)
                },
                error => {
                  console.error(error.message)
                  reject(new Error('Could not fetch organization of active round'))
                }
              )
          } else {
            resolve(null)
          }
        },
        error => {
          console.error(error.message)
          reject(new Error('Could not fetch active round'))
        }
      )
  })
}

router.get('/', (req, res, next) => {
  Promise.all([
    getActiveRound(),
    Round.find()
      .select({ organizationId: 1, description: 1, start: 1, stop: 1, duration: 1, amount: 1, donationCount: 1 })
  ]).then(result => {
    res.send({
      activeRound: result[0],
      rounds: result[1]
    })
  }).catch(error => {
    console.error(error.message)
    next(new Error('Could not fetch rounds'))
  })

})

router.get('/active', (req, res, next) => {
  getActiveRound().then(
    round => {
      res.send({ round: round })
    },
    error => {
      console.log(error.message)
      next(new Error('Could not fetch active round'))
    }
  )
})

module.exports = {
  router: router,
  getActiveRound: getActiveRound
}
