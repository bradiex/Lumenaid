const StellarSdk = require('stellar-sdk')
const request = require('request')
if (process.env.NODE_ENV !== 'production') {
  StellarSdk.Network.useTestNetwork()
}
let server = new StellarSdk.Server('https://horizon-testnet.stellar.org')

let donationKeys = StellarSdk.Keypair.fromSecret('SA3KVGMRW5GROBAXE2SVQHX5XDXPY7D3I2LHJ7I7N4QLEYUX6ETSDRII')
// public: GC6OR5Y2Q2TKPBKCC3YIJQEAIMXXE6N3SGSFZLEJKRO5ZQK2YGCXTY6U
let maintenanceKeys = StellarSdk.Keypair.fromSecret('SCGALYNTRIJVL5TW7GK5ORQFHFQV54ZRRSXIXNV72CS3TZI5A4B666OE')
// public: GDVQT54QDQO43QQ2MPJBAW3NKRHHG6IOBEF47J6E2R7SCRQBZGM7G4O3
let testKeys = StellarSdk.Keypair.fromSecret('SCGKDPYHXGEAWLGJSBWWPMTFQUBZKH3YNSRPF3VE6WXM7DH525OW3QZY')
// public: GAPR3K7ZSIU3PEVEPQH6UZ3RKYVPCC7DYAPELEZ2S6XLMRH5NDJHKEJH

let io = null

/*
module.exports = {
  startReceivePayments: startReceivePayments,
  testTransaction: testTransaction
}*/
module.exports = io_ => {
  if (io_) {
    io = io_
  }
  return {
    startReceivePayments: startReceivePayments,
    testTransaction: testTransaction
  }
}

import { Donation } from './api/models'

function createTestAccount (cb) {
  let pair = StellarSdk.Keypair.random()

  let req = request.get({
    url: 'https://horizon-testnet.stellar.org/friendbot',
    qs: { addr: pair.publicKey() },
    json: true
  }, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('ERROR', error || body)
      cb(error)
    } else {
      console.log('Success!\n', body)
      if (typeof(cb) === 'function') {
        cb(null, pair.publicKey(), pair.secret())
      }
    }
  })
}

// Cursor
const mongoose = require('mongoose')

const paymentsCursorSchema = mongoose.Schema({
  cursor: { type: String, default: '' }
})
const PaymentsCursor = mongoose.model('payments_cursor', paymentsCursorSchema)


function startReceivePayments () {
  // Start payments stream
  fetchCursor().then(
    cursor => {
      receivePayments(cursor)
    },
    error => {
      console.error(error.message)
      console.error('Could not load cursor!')
      process.exit(1)
    }
  )
}

// Fetch cursor
function fetchCursor () {
  // add lock
  return new Promise((resolve, reject) => {
    PaymentsCursor.findOne().then(
      cursor => {
        resolve(cursor)
      },
      error => {
        console.error('Could not get cursor', error)
        reject(error)
      }
    )
  })
}

function saveCursor (token) {
  // add lock
  return new Promise((resolve, reject) => {

    fetchCursor().then(
      cursor => {
        if (cursor) {
          cursor.cursor = token
        } else {
          cursor = new PaymentsCursor({ cursor: token })
        }
        console.log('Saving...')
        cursor.save().then(
          cursor => {
            resolve(cursor)
          },
          error => {
            reject(error)
          }
        )
      },
      error => {
        console.error('Could not save cursor', error)
        reject(error)
      }
    )

  })
}

function receivePayments (cursor) {
  let donationId = donationKeys.publicKey()
  let payments = server.payments().forAccount(donationId)

  if (cursor) {
    payments.cursor(cursor.cursor)
  }

  console.log('Start receiving payments...')
  payments.stream({
    onmessage: payment => {
      if (payment.to !== donationId) {
        return
      }

      if (payment.asset_type !== 'native') {
        return
      }

      console.log(`PAYMENT: ${payment.amount} XLM from ${payment.from}`)
      let memoId = ''
      console.log('fetching transaction memo...')
      payment.transaction().then(
        transaction => {
          if (transaction.memo_type === 'text') {
            memoId = transaction.memo
          }
          console.log('got transaction memo:', memoId)
        },
        error => {
          console.error('unable to find transaction')
        }
      ).finally(() => {
        console.log('saving donation')

        Donation.findOne({ memoId: memoId, account: { $eq: null } }).then(
          donation => {
            if (donation) {
              // update donation
              donation.amount = Number(payment.amount)
              donation.account = payment.from
              donation.timestamp = Date.now()
            } else {
              // create new donation
              donation = new Donation({
                roundId: 'currentroundid',
                timestamp: Date.now(),
                amount: Number(payment.amount),
                account: payment.from,
                message: memoId
              })
            }
            donation.updateDisplay()
            return donation.save()
          },
          error => {
            console.error('Could not fetch donations')
          }
        ).then(
          donation => {
            console.log('donation saved!')
            // send donation over ws
            if (io) {
              io.emit('donation', {
                timestamp: donation.timestamp,
                amount: donation.amount,
                message: donation.message,
                _id: donation._id
              })
              io.emit('donation_display', {
                amount: donation.amount,
                message: donation.message,
                display: donation.display
              })
            }

            saveCursor(payment.paging_token).then(
              cursor => {
                console.log('Cursor updated')
              },
              error => {
                console.error('Could not update cursor... exiting')
                process.exit(1)
              }
            )
          },
          error => {
            console.error('Could not fetch donation...', error.message)
          }
        )
      })
    },

    onerror: error => {
      console.error('Error in payment stream')
      console.error(error)
    }
  })
}

// testTransaction()

function testTransaction (memo) {
  return server.loadAccount(donationKeys.publicKey())
    .catch(StellarSdk.NotFoundError, error => {
        throw new Error('Destination account does not exist')
    })
    .then(account => {
        console.log('account exists')
        return server.loadAccount(testKeys.publicKey())
    })
    .then(source => {
        let transaction = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.payment({
                destination: donationKeys.publicKey(),
                asset: StellarSdk.Asset.native(),
                amount: String(Math.round((2 * Math.random() + 0.1)*10000000)/10000000)
            }))
            .addMemo(StellarSdk.Memo.text(memo || 'Test Transaction'))
            .build()
        transaction.sign(testKeys)

        return server.submitTransaction(transaction)
    })
}

function getBalance (keys) {
  server.loadAccount(keys.publicKey()).then(account => {
      // console.log(account)
      console.log(`Balances for account: ${keys.publicKey()}`)
      account.balances.forEach(balance => {
          if (balance.asset_type === 'native') {
              console.log(`${balance.balance} lumens`)
          } else {
              console.log(`${balance.balance} ${balance.asset_code}`)
          }
      })
  })
}

// getBalance(donationKeys)

/*
createTestAccount((error, publicKey, seed) => {
  if (error) {
    console.log('Could not create account..')
  } else {
    console.log('Account created:', publicKey, seed)
  }
})
*/
