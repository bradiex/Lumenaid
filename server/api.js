const express = require('express')
const router = express.Router()

const databaseUrl = 'mongodb://localhost/stellar'
const mongoose = require('mongoose')
mongoose.connect(databaseUrl)

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`Connected to ${databaseUrl}`)
});

router.use('/actions', require('./actions').router)
router.use('/organizations', require('./organizations').router)
router.use('/donations', require('./donations').router)
router.use('/rounds', require('./rounds').router)

module.exports = router
