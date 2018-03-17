<template>

  <q-modal ref="modal" :content-css="{minWidth: '100vw', minHeight: '100vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn flat @click="$refs.modal.close()">
          <q-icon name="keyboard_arrow_left"></q-icon>
        </q-btn>
        <div class="q-toolbar-title">
          About
        </div>
      </q-toolbar>

      <div class="layout-padding">

        <h5>About Lumenaid</h5>
        <p class="caption">
          Lumenaid is a donation platform built on the <a href="https://www.stellar.org" target="_blank">Stellar network</a>.
          The network's native asset <a href="https://www.stellar.org/lumens/" target="_blank">Lumens</a> are used as an intermediate asset and for anti-spamming measurements.
          On this donation platform you can send these Lumens to 'shine some light' on a non-profit organization that deserves to be in the 'spotlight'.
          There's only 1 organization in the spotlight at once which is called a round. A donator can vote for the organization that should be in the next round.
          Organizations have to submit themselve where they acknowledge that the donations will be send to their stellar account.<br>
          <br>
          Organizations can participate on this platform by submitting the following <a @click="$refs.organizationForm.open()">form</a>.<br>
          The full policy document can be found __here__.

          <h5>FAQs</h5>

          <div v-for="faq in faqs">
            <h6>{{ faq.q }}</h6>
            <p class="caption" v-html="faq.a"></p>
          </div>
        </p>
      </div>

    </q-modal-layout>

    <organization-form ref="organizationForm"></organization-form>

  </q-modal>

</template>

<script>
import { QModal, QModalLayout, QToolbar, QBtn, QIcon } from 'quasar-framework'
import OrganizationForm from './OrganizationForm'
import { faqs } from './faqs'

export default {
  components: {
    QModal,
    QModalLayout,
    QToolbar,
    QBtn,
    QIcon,
    OrganizationForm
  },

  data () {
    return {
      faqs: faqs
    }
  },

  methods: {
    open () {
      this.$refs.modal.open()
    }
  }
}
</script>

<style>
</style>
