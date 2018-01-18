const templates = require('./templates')

const transporter = require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: '***',
    pass: '***'
  }
})



function send (options) {
  return new Promise((resolve, reject) => {
    options.from = 'Lumenaid <lumenaid.test@gmail.com>'
    transporter.sendMail(options, (error, info) => {
      if (error) {
        reject(error)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports = {
  send: send,
  templates: templates
}