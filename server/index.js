const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const stellar = require('./stellar')(io)

stellar.startReceivePayments()
if (process.env.NODE_ENV !== 'production') {
  app.set('json spaces', 2)
}

const api = require('./api')

app.use(express.static('public'))

app.use(bodyParser.json())

app.use('/api', api)

app.use('*', express.static('public'))

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  console.error(err)
  console.error(err.message)
  res.send({ error: err.message })
})

io.on('connection', socket => {
  io.emit('custom', { for: 'ever yone' })
})

http.listen(8000, () => {
  console.log('Server listening on port 8000')
})
