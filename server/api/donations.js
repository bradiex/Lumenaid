const express = require('express')
const router = express.Router()
const uuid4 = require('uuid/v4')

const stellar = require('../stellar')()

import { Donation } from './models'

router.get('/', (req, res, next) => {
  Donation.find({ account: { $ne: null } })
    .select({ timestamp: 1, amount: 1, message: 1, display: 1 })
    .then(
      donations => {
        res.send({ donations: donations })
      },
      error => {
        console.error(error.message)
        next(new Error('Could not fetch donations'))
      }
    )
})

// const displayTest = require('./image')
router.get('/display', (req, res, next) => {
  /*
  displayTest().then(pos => {
    let result = pos.map(p => {
      return {
        amount: Math.random(),
        message: 'message',
        display: {
          pos: {
            x: p.x / 1140,
            y: p.y / 550
          },
          size: Math.random(),
          color: Math.pow(Math.sin(Math.PI * Math.random()), 2)
        }
      }
    })
    res.send({ donations: result })
    // res.send(pos)
  })
  */
  Donation.find({ account: { $ne: null } })
    .select({ amount: 1, message: 1, display: 1 })
    .then(
      donations => {
        res.send({ donations: donations })
      },
      error => {
        console.error(error.message)
        next(new Error('Could not fetch donations'))
      }
    )
})

router.get('/votes', (req, res, next) => {
  Donation.aggregate([
    {
      $match: {
        roundId: 'currentroundid'
      }
    },
    {
      $group: {
        _id: '$vote',
        votes: { $sum: 1 }
      }
    }
  ]).then(
    result => {
      res.send(result)
    }
  )
})

router.get('/stats', (req, res, next) => {
  Promise.all([
    Donation.count({ account: { $ne: null } }),
    Donation.aggregate([
      {
        $match: {
          roundId: 'currentroundid'
        }
      },
      {
        $group: {
          _id: '$roundId',
          sum: { $sum: '$amount' }
        }
      }
    ]),
    Donation.find({ account: { $ne: null } })
            .select({ timestamp: 1, amount: 1, message: 1})
            .limit(5)
            .sort({ timestamp: -1 }),
    Donation.find({ account: { $ne: null } })
            .select({ timestamp: 1, amount: 1, message: 1})
            .limit(5)
            .sort({ amount: -1 })
  ]).then(result => {
    res.send({
      roundId: 'currentroundid',
      donationCount: result[0],
      donationAmount: result[1].length ? Math.round(result[1][0].sum * 100000000) / 100000000 : null,
      recentDonations: result[2],
      notableDonations: result[3]
    })
  }).catch(error => {
    console.error('Could not fetch stats', error)
    next(new Error('Could not fetch stats'))
  })
})

router.post('/', (req, res, next) => {
  req.body.memoId = uuid4().replace(/-/g, '').slice(0, 28)
  let donation = new Donation(req.body)
  donation.roundId = 'currentroundid'
  donation.save().then(
    donation => {
      res.send({ id: donation._id, memoId: donation.memoId })
    },
    error => {
      console.error(error.message)
      next(new Error('Could not save donation'))
    }
  )
})

// Test donation
router.post('/test', (req, res, next) => {
  let memoId = req.body.memoId
  Donation.findOne({ memoId: memoId }).then(
    donation => {
      if (donation) {
        console.log('donation found')
        // submit transaction
        stellar.testTransaction(memoId).then(result => {
          res.send({ message: 'success'})
        })
        .catch(error => {
          console.error(error)
          next(new Error('Could not submit transaction'))
        })
      } else {
        console.log('could not find donation...')
        next(new Error('Donation not found'))
      }
    },
    error => {
      console.error(error.message)
      next(new Error('Could not fetch donation'))
    }
  )
})

module.exports = {
  router: router
}
