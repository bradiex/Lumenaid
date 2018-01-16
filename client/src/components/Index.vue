<template>
  <!-- Configure "view" prop for QLayout -->
  <q-layout>

    <div id="container" class="row">
      <div id="control" class="col-3 text-grey-1" style="background: rgb(33, 37, 39);">

        <div v-if="round" style="padding: 10px;">
          <h5><i>Shine some light on...</i></h5>

          <img :src="round.organization.image" style="width: 50%; cursor: pointer;" @click="$refs.roundInfo.open(round)"/>

          <!--
          <div style="overflow: auto; max-height: 300px;">
            <q-btn icon="info" flat @click="$refs.roundInfo.open(round)">Expand info</q-btn>
          </div>
          -->

          <h5 style="color: rgb(144, 180, 255);"><i>{{ stats.donationAmount }} XLM donated</i></h5>
          <small>From {{ stats.donationCount }} donations</small>

          <br><br>
          Most recent donations:
          <table class="q-table compact full-width donations-view">
            <thead>
              <tr>
                <th>amount</th>
                <th>message</th>
                <th class="text-right">when</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="donation in donations.slice(0, 5)">
                <td>{{ donation.amount }}</td>
                <td>{{ donation.message }}</td>
                <td class="text-right">{{ donation.timestamp | moment('from') }}</td>
              </tr>
            </tbody>
          </table>
          Most notable donations:
          <table class="q-table compact full-width donations-view">
            <thead>
              <tr>
                <th>amount</th>
                <th>message</th>
                <th class="text-right">when</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="donation in notableDonations">
                <td>{{ donation.amount }}</td>
                <td>{{ donation.message }}</td>
                <td class="text-right">{{ donation.timestamp | moment('calendar') }}</td>
              </tr>
            </tbody>
          </table>

          <br>
          <qr-code :value="donationAddress" :options="{ size: 75 }"></qr-code>
          <br>
          <span style="font-size: 10px;">{{ donationAddress }}</span>
          <br>

          <template v-if="!donation.status">
            <p class="caption" style="margin-top: 4px;">
              Optionally attach a message and a vote to your donation by filling in the form below:
            </p>
            <q-field dark icon="label" helper="Supply some message" :count="40">
              <q-input dark v-model="donation.message" max-length="40"/>
            </q-field>
            <q-field dark icon="bookmark border" helper="Vote for the next round">
              <q-btn @click="$refs.organizations.open()" color="green-7">
                <span v-if="donation.vote">
                  voting for {{ donation.voteName }}
                </span>
                <span v-else>
                  view organizations
                </span>
              </q-btn>
              <!--<q-select v-model="donation.vote" :options="organizationOptions"></q-select>-->
            </q-field>
            <q-btn color="blue-8" @click="sendDonation" key="send-donation">Request memo id</q-btn>
          </template>
          <template v-if="donation.status === 'sending'">
            Sending donation....
          </template>
          <template v-if="donation.status === 'done'">
            Please send a donation with following memo text:<br>
            <q-input id="tttt" :value="donation.memoId" disable dark :after="[{icon: 'content copy', content: true, handler () { copyMemoId() }}]"></q-input>
            <q-btn color="blue-8" @click="resetDonation()" key="reset-donation">Reset</q-btn>
            <q-btn color="yellow-9" @click="testDonation()" key="test-donation">Send with test account</q-btn>
          </template>
          <template v-if="donation.status === 'received'">
            Thank you for your donation!<br>
            <q-btn color="blue-8" @click="resetDonation()" key="reset-donation">Reset</q-btn>
          </template>
        </div>

        <div class="self-end" style="height: 20px;">
          <q-btn @click="$refs.about.open()">about</q-btn>
        </div>
      </div>

      <div class="col space">
        <space ref="space"/>
      </div>

      <round-info ref="roundInfo"/>
      <organizations ref="organizations" @selected="donation.vote = arguments[0], donation.voteName = arguments[1]"/>
      <about ref="about"/>
      <splash ref="splash"/>

    </div>


  </q-layout>
</template>

<script>
import { QLayout, QBtn, QIcon, QField, QSelect, QInput } from 'quasar-framework'
import RoundInfo from './RoundInfo'
import Organizations from './Organizations'
import About from './About'
import Space from './Space'
import Splash from './Splash'
import { Donation, Round } from './api'
import { donationAddress } from './config'

export default {
  components: {
    QLayout,
    QBtn,
    QIcon,
    QField,
    QSelect,
    QInput,
    RoundInfo,
    Organizations,
    About,
    Space,
    Splash
  },
  data () {
    return {
      stats: {
        count: 0,
        amount: 0
      },
      donationAddress: donationAddress,

      round: null,

      donations: [],

      notableDonations: [],

      organizations: [],

      donation: {
        message: '',
        vote: null,
        voteName: '',
        sending: '',
        id: null,
        memoId: null,
        status: ''
      }
    }
  },

  computed: {
    organizationOptions () {
      return this.organizations.map(org => {
        return { label: org.name, value: org.name }
      })
    }
  },

  methods: {
    recomputeNotableDonations () {
      let donations = this.donations.concat().sort((a, b) => {
        return a.amount < b.amount ? 1 : (a.amount > b.amount ? -1 : 0)
      })
      this.notableDonations = donations.slice(0, 5)
    },

    sendDonation () {
      this.donation.status = 'sending'
      Donation.create({
        message: this.donation.message,
        vote: this.donation.vote
      }).then(
        response => {
          this.resetDonation()
          this.donation.status = 'done'
          this.donation.id = response.data.id
          this.donation.memoId = response.data.memoId
        },
        error => {
          this.donation.status = ''
          console.error('Could not send donation', error.response.data)
        }
      )
    },

    testDonation () {
      Donation.test({ memoId: this.donation.memoId }).then(
        response => {
          console.log('Testdonation:', response.data)
        },
        error => {
          console.error('Could not send test donation', error.response.data)
        }
      )
    },

    resetDonation () {
      this.donation = {
        message: '',
        vote: null,
        voteName: '',
        sending: '',
        memoId: null
      }
      this.$refs.organizations.reset()
    },

    copyMemoId () {
      /*
      console.log('copying...')
      var copyText = document.createElement("tttt");
      copyText.select();
      console.log(copyText)
      document.execCommand("Copy");
      alert("Copied the text: " + copyText.value);
      */
    },

    fetchActiveRound () {
      Round.active().then(
        response => {
          this.round = response.data.round
        },
        error => {
          console.error('Could not fetch active round:', error.message)
        }
      )
    },

    fetchStats () {
      Donation.stats().then(
        response => {
          let stats = response.data
          this.stats.donationCount = stats.donationCount
          this.stats.donationAmount = stats.donationAmount
          this.donations = stats.recentDonations
          this.notableDonations = stats.notableDonations
        },
        error => {
          console.error('Could not fetch stats:', error.message)
        }
      )
    }
  },

  created () {
    // this.recomputeNotableDonations()
    this.fetchStats()
    this.fetchActiveRound()
  },

  mounted () {
    // this.$refs.splash.open()
  },

  sockets: {
    connect () {
      console.log('socket connected')
    },
    donation (data) {
      console.log('got new donation!')
      this.stats.donationCount++
      this.stats.donationAmount = Math.round((this.stats.donationAmount + data.amount) * 10000000) / 10000000
      this.donations.splice(0, 0, data)

      if (this.notableDonations.length < 5 || data.amount > this.notableDonations[this.notableDonations.length - 1].amount) {
        // recompute notable donations
        this.notableDonations.push(data)
        this.notableDonations = this.notableDonations.sort((a, b) => {
          return a.amount < b.amount ? 1 : (a.amount > b.amount ? -1 : 0)
        }).slice(0, 5)
      }

      if (this.donation.status === 'done' && data._id === this.donation.id) {
        this.donation.status = 'received'
      }
    }
  }
}
</script>

<style>
  #container {
    height: 100vh;
  }
  #control {
    min-width: 300px;
    overflow: auto;
  }
  .space {
    background: black;
  }
  .donations-view {
    background: rgb(57, 62, 65);
    font-size: 10px;
  }
</style>
