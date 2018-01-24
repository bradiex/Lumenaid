
const databaseUrl = 'mongodb://localhost/stellar'
const mongoose = require('mongoose')
mongoose.connect(databaseUrl)

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log(`Connected to ${databaseUrl}`)
})

const ActionCreate = require('./api/actions/index').ActionCreate

let command = process.argv[2]

switch (command) {
  case 'start-round':
    console.log('Starting new round...')
    let force = process.argv[3] === 'force'
    ActionCreate.startRound(force).then(
      result => {
        console.log('Done')
      },
      error => {
        console.error(`Could not start new round: ${error.message}`)
      }
    ).finally(() => { mongoose.disconnect() })
    break
  case 'stop-round':
    console.log('Stopping round...')
    ActionCreate.stopRound().then(
      round => {
        console.log('Done')
      },
      error => {
        console.error(`Could not stop round: ${error.message}`)
      }
    ).finally(() => { mongoose.disconnect() })
    break
  default:
    console.error('Unknown command')
    mongoose.disconnect()
}
