const htmlToText = require('html-to-text')

const MailTemplates = {
  main (subject, content) {
    content = `
      Hello,<br>
      <br>
      ${content}<br>
      <br>
      Sincerely,<br>
      <br>
      Lumenaid - A Stellar donation platform<br>
      info@lumenaid.org<br>
      <a href="https://www.lumenaid.org">www.lumenaid.org</a>
    `
    return {
      subject: subject,
      html: content,
      plain: htmlToText.fromString(content)
    }
  },

  error (action) {
    let subject = `Lumenaid ERROR`
    let content = `
      Something went wrong while creating an ${action.data.originalAction.type} action:<br>
      ${action.data.message}<br>
      <br>
      ${action.getLink()}
    `
    return this.main(subject, content)
  },

  validate_email (action) {
    let subject = `Lumenaid: Please validate your email`
    let content = `
      Thank you for registering your organization <b>${action.data.organizationName}</b> at Lumenaid!<br>
      Please validate your email address in order to participate in the voting by using the following link:<br>
      ${action.getLink()}<br>
      <br>
      <i>Please ignore this email if you did not register your organization at Lumenaid.</i>
    `
    return this.main(subject, content)
  },

  authorize_organization (action) {
    let subject = ''
    let content = ''
    if (action.done) {
      // Mail to organization
      if (action.status === 'accepted') {
        subject = `Lumenaid: Registration approved for ${action.data.organization.name}`
        content = `
          Congratulations, your request to join the Lumenaid platform has been approved!<br>
          From now on donators can start voting for your organization and hopefully you will be selected once.<br>
          You will be notified on this email address when you have been selected.<br>
          ${action.comments}
        `
      } else if (action.status === 'rejected') {
        subject = `Lumenaid: Registration denied for ${action.data.organization.name}`
        content = `
          Your request to join the Lumenaid platform has been denied for the following reason:<br>
          ${action.comments}
        `
      }
    } else {
      // Mail to lumenaid
      subject = `Lumenaid: Authorization request for ${action.data.organization.name}`
      content = `
        Authorization request for <b>${action.data.organization.name}</b>:<br>
        ${action.getLink()}
      `
    }
    return this.main(subject, content)
  },

  start_round (action) {
    let subject = `Lumenaid: New round started`
    let content = `
      New round started for <b>${action.data.round.organization.name}</b>.<br>
      Votes: ${action.data.votes}
    `
    return this.main(subject, content)
  }
}

module.exports = MailTemplates
