<template>

  <q-modal ref="modal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn flat @click="$refs.modal.close()">
          <q-icon name="keyboard_arrow_left"></q-icon>
        </q-btn>
        <div class="q-toolbar-title">
          Submit your organization
        </div>
      </q-toolbar>

      <div class="layout-padding">
        <p class="caption">
          Submit your organization here.
        </p>

        <q-field label="Name of your organization">
          <q-input v-model="organization.name"/>
        </q-field>
        <q-field label="Description" helper="Short description, preferably one sentence" :count="200">
          <q-input v-model="organization.description" max-length="200"/>
        </q-field>
        <q-field label="Website" helper="Link to the organization's website" >
          <q-input v-model="organization.link"/>
        </q-field>
        <q-field label="Image" helper="Link to a logo or other image that is related to the organization">
          <q-input v-model="organization.image"/>
        </q-field>
        <q-field label="E-mail" helper="Your email will be used to verify authenticity of this submission">
          <q-input v-model="organization.email" :suffix="'@' + getHostName(organization.link)"/>
        </q-field>
        <q-field label="Stellar account" helper="Public address to which donations should be sent, can be sent later">
          <q-input v-model="organization.account"/>
        </q-field>

        <q-btn color="primary" @click="submit">Submit</q-btn>

      </div>

    </q-modal-layout>

  </q-modal>

</template>

<script>
import { QModal, QModalLayout, QToolbar, QBtn, QIcon, QField, QInput } from 'quasar-framework'
import { Organization } from './api'

export default {
  components: {
    QModal,
    QModalLayout,
    QToolbar,
    QBtn,
    QIcon,
    QField,
    QInput
  },

  data () {
    return {
      organization: {
        name: '',
        description: '',
        link: '',
        image: '',
        email: '',
        account: ''
      }
    }
  },

  methods: {
    open () {
      this.$refs.modal.open()
    },

    submit () {
      Organization.create(this.organization).then(
        response => {
          console.log('RESPONSE:', response)
          this.reset()
        },
        error => {
          console.log('ERROR:', error.response)
        }
      )
    },

    reset () {
      this.organization = {
        name: '',
        description: '',
        link: '',
        image: '',
        email: '',
        account: ''
      }
    },

    getHostName (link) {
      let matches = link.match(/^(https?:\/\/)?(www.)?([^/:?#]+)(?:[/:?#]|$)/i)
      let domain = matches && matches[3]
      return domain || 'invalid host'
    }
  }
}
</script>

<style>
</style>
