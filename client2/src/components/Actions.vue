<template>
  <!-- Configure "view" prop for QLayout -->
  <q-layout>
    <q-toolbar slot="header">
      <q-toolbar-title>
        Lumenaid Actions
      </q-toolbar-title>
    </q-toolbar>

    <div class="layout-padding">
      <q-card square style="margin: auto; width: 80%;" v-if="action">
        <q-card-title>
          {{ actionTitle }}
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <q-field label="Created">
            <span>{{ action.timestamp | moment('calendar') }} ({{ action.timestamp | moment('from') }})</span>
          </q-field>
          <q-field label="Status">
            <span v-if="action.status === 'pending'">
              Pending
            </span>
            <span class="text-positive" v-if="action.status === 'accepted'">
              Accepted
            </span>
            <span class="text-negative" v-if="action.status === 'rejected'">
              Rejected
            </span>
            <span class="text-grey" v-if="action.status === 'ignored'">
              Ignored
            </span>
          </q-field>

          <template v-if="action.type === 'error'">

            <q-field label="Orginal action created">
              <span>{{ action.data.originalAction.timestamp | moment('calendar') }} ({{ action.data.originalAction.timestamp | moment('from') }})</span>
            </q-field>

            <q-field label="Orginal action type">
              <span>{{ action.data.originalAction.type }}</span>
            </q-field>

            <q-field label="Orginal action data">
              <span>{{ action.data.originalAction.data }}</span>
            </q-field>

            <q-field label="Error message">
              <span>{{ action.data.message }}</span>
            </q-field>

          </template>

          <template v-if="action.type === 'validate_email'">

            <p class="caption" v-if="action.status === 'pending' || action.status === 'ignored'">
              Please validate your email <b>{{ action.data.email }}</b> for your organization <b>{{ action.data.organizationName }}</b>.<br>
              Click on accept to confirm your email and participate with the votings.
              Click on reject to remove your registration.
              Click on ignore to decide on another time.
            </p>
            <p class="caption" v-if="action.status === 'accepted'">
              Your email has been validated!
            </p>
            <p class="caption" v-if="action.status === 'rejected'">
              Your registration was canceled!
            </p>

          </template>

          <template v-if="action.type === 'authorize_organization'">

            <q-field label="Name">
              <q-input v-model="action.data.organization.name"/>
            </q-field>

            <q-field label="Description">
              <q-input v-model="action.data.organization.description"/>
              <p class="caption" v-html="action.data.organization.description"></p>
            </q-field>

            <q-field label="Image">
              <q-input v-model="action.data.organization.image"/>
              <img :src="action.data.organization.image" style="width: 50%;"/>
            </q-field>

            <q-field label="Link">
              <q-input v-model="action.data.organization.link"/>
            </q-field>

            <q-field label="Email">
              <q-input v-model="action.data.organization.email" disable/>
            </q-field>

            <q-field label="Account">
              <q-input v-model="action.data.organization.account" disable/>
            </q-field>

            <q-field label="Feedback">
              <q-input v-model="action.comments"/>
            </q-field>

          </template>

          <template v-if="action.type === 'update_organization' || action.type === 'verify_update_organization'">

            <h5>Organization</h5>

            <q-field label="Name">
              <q-input v-model="action.data.organization.name" disable/>
            </q-field>

            <q-field label="Description">
              <q-input v-model="action.data.organization.description"/>
              <p class="caption" v-html="action.data.organization.description"></p>
            </q-field>

            <q-field label="Image">
              <q-input v-model="action.data.organization.image"/>
              <img :src="action.data.organization.image" style="width: 50%;"/>
            </q-field>

            <q-field label="Link">
              <q-input v-model="action.data.organization.link"/>
            </q-field>

            <q-field label="Email">
              <q-input v-model="action.data.organization.email" disable/>
            </q-field>

            <q-field label="Account">
              <q-input v-model="action.data.organization.account"/>
            </q-field>

            <template v-if="action.data.round">
              <h5>Round Info</h5>

              <q-field label="Description">
                <q-input v-model="action.data.round.description"/>
                <p class="caption" v-html="action.data.round.description"></p>
              </q-field>

              <q-field label="Image">
                <q-input v-model="action.data.round.image"/>
                <img :src="action.data.round.image" style="width: 50%;"/>
              </q-field>
            </template>

            <p class="caption" v-if="action.data.comments">
              Feedback: {{ action.data.comments }}
            </p>

            <q-field label="Feedback" :helper="action.type === 'update_organization' ? 'Provide any additional requests here' : ''">
              <q-input v-model="action.comments"/>
            </q-field>

          </template>

          <template v-if="action.type === 'post_round_check'">

            <h5>Organization</h5>

            <q-field label="Name">
              <span>{{ action.data.round.organization.name }}</span>
            </q-field>

            <q-field label="Description">
              <p class="caption" v-html="action.data.round.organization.description"></p>
            </q-field>

            <q-field label="Image">
              <img :src="action.data.round.organization.image" style="width: 50%;"/>
            </q-field>

            <q-field label="Link">
              <span>{{ action.data.round.organization.link }}</span>
            </q-field>

            <q-field label="Email">
              <span>{{ action.data.round.organization.email }}</span>
            </q-field>

            <q-field label="Account">
               <span>{{ action.data.round.organization.account }}</span>
            </q-field>

            <h5>Round Info</h5>

            <q-field label="Description">
              <p class="caption" v-html="action.data.round.description"></p>
            </q-field>

            <q-field label="Image">
              <img :src="action.data.round.image" style="width: 50%;"/>
            </q-field>

            <h5>Statistics</h5>

            <q-field label="Donations">
              <span>{{ action.data.round.statistics.donationCount }}</span>
            </q-field>

            <q-field label="Amount">
              <span>{{ action.data.round.statistics.donationAmount }}</span>
            </q-field>

            <q-field label="Votes">
              <div v-for="vote in action.data.round.statistics.votes">
                <span>{{ vote.count }}: {{ vote.organizationId }}</span>
              </div>
            </q-field>

            <q-field label="Feedback">
              <q-input v-model="action.comments"/>
            </q-field>

          </template>

          <template v-if="action.type === 'post_round_review'">

              <h5>Organization</h5>

              <q-field label="Name">
                <span>{{ action.data.round.organization.name }}</span>
              </q-field>

              <q-field label="Account">
                <q-input v-model="action.data.round.organization.account"/>
              </q-field>

              <h5>Statistics</h5>

              <q-field label="Donations">
                <span>{{ action.data.round.statistics.donationCount }}</span>
              </q-field>

              <q-field label="Amount">
                <span>{{ action.data.round.statistics.donationAmount }}</span>
              </q-field>

              <q-field label="Feedback" helper="Provide any additional requests here">
                <q-input v-model="action.comments"/>
              </q-field>

            </template>

            <template v-if="action.type === 'post_round_send'">

              <h5>Organization</h5>

              <q-field label="Name">
                <span>{{ action.data.round.organization.name }}</span>
              </q-field>

              <q-field label="Account">
                <q-input v-model="action.data.round.organization.account"/>
              </q-field>

              <h5>Statistics</h5>

              <q-field label="Donations">
                <span>{{ action.data.round.statistics.donationCount }}</span>
              </q-field>

              <q-field label="Amount">
                <span>{{ action.data.round.statistics.donationAmount }}</span>
              </q-field>

              <q-field label="Feedback">
                <q-input v-model="action.comments"/>
              </q-field>

            </template>

        </q-card-main>

        <q-card-actions v-if="action.status === 'pending' || action.status === 'ignored'">
          <q-btn flat color="positive" icon="done" @click="updateAction('accepted')">Accept</q-btn>
          <q-btn flat color="negative" icon="clear" @click="updateAction('rejected')">Reject</q-btn>
          <q-btn flat color="grey" @click="updateAction('ignored')">Ignore</q-btn>
        </q-card-actions>
      </q-card>
      <div v-if="error">
        Error: {{ error }}
      </div>
    </div>
  </q-layout>
</template>

<script>
import { QLayout, QToolbar, QToolbarTitle, QBtn, QCard, QCardTitle, QCardSeparator, QCardMain, QCardActions, QField, QInput } from 'quasar-framework'
import { Action } from './api'

export default {
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QCard,
    QCardTitle,
    QCardSeparator,
    QCardMain,
    QCardActions,
    QField,
    QInput
  },
  data () {
    return {
      action: null,
      error: null
    }
  },

  computed: {
    actionTitle () {
      if (!this.action) {
        return ''
      }
      switch (this.action.type) {
        case 'error':
          return `ERROR: ${this.action.data.message}`
        case 'validate_email':
          return 'Email Validation'
        case 'authorize_organization':
          return 'Organization Authorization'
        case 'update_organization':
          return 'Organization Info Update'
        case 'post_round_check':
          return 'Post round check'
        case 'post_round_review':
          return 'Post round review'
        case 'post_round_send':
          return 'Post round send'
        default:
          return ''
      }
    }
  },

  methods: {
    updateAction (type) {
      Action.update(this.action.key, {
        status: type,
        fields: { ...this.action.data, comments: this.action.comments }
      }).then(
        response => {
          this.action.status = type
        },
        error => {
          console.error('Something went wrong', error.message)
        }
      )
    },

    fetchAction (key) {
      Action.get(key).then(
        response => {
          this.action = response.data.action
          this.action.comments = ''
        },
        error => {
          console.error(error.message)
          this.error = error.response.data.error
        }
      )
    }
  },

  created () {
    this.fetchAction(this.$route.params.key)
  }
}
</script>

<style>
</style>
