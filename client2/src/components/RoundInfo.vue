<template>

  <q-modal ref="modal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn flat @click="$refs.modal.close()">
          <q-icon name="keyboard_arrow_left"></q-icon>
        </q-btn>
        <div class="q-toolbar-title">
          Round info
        </div>
      </q-toolbar>

      <div class="layout-padding">
        <template v-if="round">
          <img :src="round.organization.image" style="width: 50%;"/>
          <p><a :href="round.organization.link" target="_blank">{{ round.organization.link }}</a></p>
          <p class="caption" v-html="round.organization.description"></p>
          <p class="caption" v-html="round.description"></p>
        </template>
        <template v-else>
          No round
        </template>
      </div>

    </q-modal-layout>

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
    return {
      round: null
    }
  },

  methods: {
    open (round) {
      this.round = round
      this.$refs.modal.open()
    }
  }
}
</script>

<style>
</style>
