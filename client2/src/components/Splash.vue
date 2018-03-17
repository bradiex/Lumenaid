<template>

  <q-modal ref="modal" :content-css="{minWidth: '100vw', minHeight: '100vh'}">
    <div class="layout-padding" style="background: rgb(51, 51, 60); height: 100vh; text-align: center; overflow: auto;">

      <img :src="logos[logo]" style="height: 55vh;" @click="toggleLogo"/>

      <!--<p class="caption" style="color: #b8bbdb; font-family: Merienda-Regular; font-style: italic;">
        After wandering through space and stardust<br>
        ... lost the ability ...<br>
        Though ... once heard about a Stellar network powered by a new light force.<br>
        It wasn't long before ... stumbled upon the earth<br>
        and found that Lumens reenabled his strength<br>
        to shine some light on those who need it.<br>
        <br>
        --
      </p>
      -->

      <p class="caption" style="color: #b8bbdb; margin: 60px 0px;">
        Lumenaid is a Stellar donation platform with the objective to bring attention to lesser-known charity organizations.<br>
        Every week a new organization is chosen and their work is put in the spotlight.<br>
      </p>

      <p class="caption text-yellow-3" style="margin: 20px 0px; font-style: italic;">
        This platform is in alpha stage and is running on Stellar's test network!<br>
      </p>

      <q-btn flat color="primary" @click="$refs.modal.close()" icon-right="keyboard return">Continue</q-btn>

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
    return {
      logo: 0,
      logos: [
        '/statics/logos/logo_light.png',
        '/statics/logos/logo_light_on.png'
      ]
    }
  },

  methods: {
    open () {
      this.$refs.modal.open()
    },
    toggleLogo () {
      this.logo = (this.logo + 1) % this.logos.length
    }
  }
}
</script>

<style>
@font-face {
  font-family: Merienda-Regular;
  src: url('/statics/Merienda-Regular.ttf');
}
</style>
