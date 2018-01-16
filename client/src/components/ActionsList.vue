<template>
  <!-- Configure "view" prop for QLayout -->
  <q-layout>
    <q-toolbar slot="header">
      <q-toolbar-title>
        Lumenaid Actions
      </q-toolbar-title>
    </q-toolbar>

    <div class="layout-padding">
      <table class="q-table">
        <thead>
          <tr>
            <th class="text-left">Timestamp</th>
            <th class="text-left">Type</th>
            <th class="text-left">Data</th>
            <th class="text-left">Comments</th>
            <th class="text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in actions">
            <td class="text-left">{{ action.timestamp | moment('calendar') }}</td>
            <td class="text-left">{{ action.type }}</td>
            <td class="text-left">{{ action.data.name }}</td>
            <td class="text-left">{{ action.comments }}</td>
            <td class="text-right" :class="{
              'text-positive': action.status === 'accepted',
              'text-negative': action.status === 'rejected',
              'text-grey': action.status === 'pending' || action.status === 'ignored' }">{{ action.status }}</td>
          </tr>
        </tbody>
      </table>

    </div>
  </q-layout>
</template>

<script>
import { QLayout, QToolbar, QToolbarTitle } from 'quasar-framework'
import { Action } from './api'

export default {
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle
  },
  data () {
    return {
      actions: null,
      error: null
    }
  },

  methods: {
    updateAction (type) {
      Action.update(this.action.key, {
        status: type,
        fields: this.action
      }).then(
        response => {
          this.action.status = type
        },
        error => {
          console.error('Something went wrong', error.message)
        }
      )
    },

    fetchActions (key) {
      Action.get().then(
        response => {
          this.actions = response.data.actions
        },
        error => {
          console.error(error.message)
          this.error = error.response.data.error
        }
      )
    }
  },

  created () {
    this.fetchActions()
  }
}
</script>

<style>
</style>
