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
  },

  post_round_check (action) {
    let subject = ''
    let content = ''
    if (action.done) {
      // Mail to organization
      if (action.status === 'accepted') {
        subject = `Lumenaid: Round payout accepted ${action.data.round.organization.name}`
        content = `
          The round payout for your account has been accepted <b>${action.data.round.organization.account}</b>.<br>
          ${action.comments}
        `
      } else if (action.status === 'rejected') {
        subject = `Lumenaid: Donation send rejected ${action.data.round.organization.name}`
        content = `
          Round payout has been denied for the following reason:<br>
          ${action.comments}<br>
          Donations will be recycled for next rounds.
        `
      }
    } else {
      // Mail to lumenaid
      subject = `Lumenaid: Post round check`
      content = `
        Round check for <b>${action.data.round.organization.name}</b>:<br>
        ${action.getLink()}
      `
    }
    return this.main(subject, content)
  },

  post_round_review (action) {
    let subject = ''
    let content = ''
    if (action.done) {
      // Mail to lumenaid
      subject = `Lumenaid: Round payout ${action.status} ${action.data.round.organization.name}`
      content = `
        Round payout has been ${action.status} by ${action.data.round.organization.name} for the following reason:<br>
        ${action.comments}
      `
    } else {
      // Mail to organization
      subject = `Lumenaid: Round review`
      content = `
        The donation round for your organization <b>${action.data.round.organization.name}</b> has ended<br>
        and has gathered a total of <b>${action.data.round.statistics.donationAmount} XLM</b> from ${action.data.round.statistics.donationCount} donations.<br>
        The donations will be sent to your account <b>${action.data.round.organization.account}</b>.<br>
        Please verify if this information is still correct with the following link:<br>
        ${action.getLink()}
      `
    }
    return this.main(subject, content)
  },

  post_round_send (action) {
    let subject = ''
    let content = ''
    if (action.done) {
      // Mail to organization
      if (action.status === 'accepted') {
        subject = `Lumenaid: Donations send ${action.data.round.organization.name}`
        content = `
          The donations have been send to your account <b>${action.data.round.organization.account}</b>.<br>
          ${action.comments}
        `
      } else if (action.status === 'rejected') {
        subject = `Lumenaid: Donation send rejected ${action.data.round.organization.name}`
        content = `
          Round payout has been denied for the following reason:<br>
          ${action.comments}<br>
          Donations will be recycled for next rounds.
        `
      }
    } else {
      // Mail to lumenaid
      subject = `Lumenaid: Donation send request for ${action.data.round.organization.name}`
      content = `
        Donation send request for <b>${action.data.round.organization.name}</b>:<br>
        ${action.getLink()}
      `
    }
    return this.main(subject, content)
  },

  update_organization (action) {
    let subject = ''
    let content = ''
    if (action.data.newRound) {
      subject = `Lumenaid: Your organization has been chosen for the next round!`
      content = `
        Congratulations, your organization <b>${action.data.organization.name}</b> has been chosen for the next round!<br>
        Please update your organization's description and give some more detail about the current work of your organization using the following link:<br>
        ${action.getLink()}
      `
    } else {
      subject = `Lumenaid: Request for changing organization info`
      content = `
        Please use following link to update your organization <b>${action.data.organization.name}</b> details:<br>
        ${action.getLink()}
      `
    }
    return this.main(subject, content)
  },

  verify_update_organization (action) {
    let subject = ''
    let content = ''
    if (action.done) {
      // Mail to organization
      if (action.status === 'accepted') {
        subject = `Lumenaid: Organization update approved for ${action.data.organization.name}`
        content = `
          Your updates to your organization info have been approved.<br>
          ${action.comments}
        `
      } else if (action.status === 'rejected') {
        subject = `Lumenaid: Organization update rejected for ${action.data.organization.name}`
        content = `
          Your updates to organization info have been rejected for the following reason:<br>
          ${action.comments}
        `
      }
    } else {
      // Mail to lumenaid
      subject = `Lumenaid: Verify organization update for ${action.data.organization.name}`
      content = `
      Verify organization update for <b>${action.data.organization.name}</b>${action.data.newRound ? ' NEW ROUND' : ''}:<br>
      ${action.getLink()}
      `
    }
    return this.main(subject, content)
  },
}

module.exports = MailTemplates
