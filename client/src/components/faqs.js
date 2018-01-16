
import { donationAddress, maintenanceAddress } from './config'

const faqs = [
  {
    q: 'What is Stellar?',
    a: 'Stellar is a decentralized payment network.<br>More info can be found here: <a href="https://www.stellar.org" target="_blank">www.stellar.org</a>.'
  },
  {
    q: 'What are Lumens?',
    a: 'Lumens are the native asset on the Stellar network.<br>More info can be found here: <a href="https://www.stellar.org/lumens/" target="_blank">www.stellar.org</a>.'
  },
  {
    q: 'What are these stars for?',
    a: 'Each star is a donation. The higher the donation, the brighter the star. When hovering the stars you can also view the donation\'s message.<br>The reason we display donations with stars is because it\'s a metaphor with the Stellar network and the Lumens asset.'
  },
  {
    q: 'How can I donate?',
    a: `Donating is possible by sending lumens to ${donationAddress}.<br>Once we receive your donation a new star will appear in our 'space view'.`
  },
  {
    q: 'How can I add a message to my donation?',
    a: 'In order to attach a message to your donation you first need to enter a message in the form and click \'Request\'. You will receive an id that you need to fill in as MEMO TEXT in your Stellar transaction.<br>More information on how to set a MEMO TEXT can be found __here__.'
  },
  {
    q: 'How can I vote for the next round?',
    a: 'Similar to adding a message, you can also select an organization from the list.<br>Voting is limited to 1 vote per account per round and votes are equally weighted. If multiple votes are send only the last one will count.'
  },
  {
    q: 'Is there anything else I can do for Lumenaid?',
    a: `You are free to set your inflation destination to our donation address: ${donationAddress}.<br>You can also support us by keeping our servers up and running by donating on ${maintenanceAddress}.`
  }
]

export {
  faqs
}
