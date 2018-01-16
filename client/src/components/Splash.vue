<template>

  <q-modal ref="modal">
    <div class="layout-padding">
      <h4>Welcom to Lumenaid!</h4>

      <p class="caption">
        Please be aware that this platform is still in development and that all payments run on Stellar's test network!<br>
        <br>
        You can test this platform by sending lumens to the donation address listed on the left.<br>
        If you want to attach a message to your donation or if you want to add a vote, please use the form on the left.<br>
        After submitting you will receive a memo id that you need to attach to your transaction.<br>
        It is also possible to test this by clicking on 'SEND WITH TEST ACCOUNT' where a transaction will be send from a test account on the server.
      </p>

      <q-btn color="primary" @click="$refs.modal.close()">Ok</q-btn>
    </div>

  </q-modal>

</template>

<script>
import { QModal, QModalLayout, QToolbar, QBtn, QIcon } from 'quasar-framework'

export default {
  components: {
    QModal,
    QModalLayout,
    QToolbar,
    QBtn,
    QIcon
  },

  data () {
    return {}
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
