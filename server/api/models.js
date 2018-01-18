const mongoose = require('mongoose')

const uuid4 = require('uuid/v4')

/* Actions */

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

/* Donations */

const donationSchema = mongoose.Schema({
  roundId: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  amount: { type: Number, default: 0 },
  message: { type: String, default: '' },
  vote: { type: String, default: null },
  memoId: { type: String, default: null },
  display: { type: Object, default: { pos: { x: 0, y: 0 }, size: 0, color: 0 } },
  account: { type: String, default: null }
})

donationSchema.methods.updateDisplay = function () {
  this.display = {
    pos: {
      x: 0.01 + Math.random() * 0.98,
      y: 0.01 + Math.random() * 0.98
    },
    size: 1 + Math.log(this.amount) / Math.log(20),
    color: Math.pow(Math.sin(Math.PI * Math.random()), 2)
  }
}

const Donation = mongoose.model('donations', donationSchema)


/* Organizations */

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

/* Rounds */

const roundSchema = mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  description: { type: String, default: null },
  start: { type: Date, default: Date.now },
  stop: { type: Date, default: null },
  duration: { type: Number, default: 7 },
  amount: { type: Number, default: 0 },
  donationCount: { type: Number, default: 0 }
})

const Round = mongoose.model('rounds', roundSchema)

export {
  Action,
  Donation,
  Organization,
  Round
}
