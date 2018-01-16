<template>

  <canvas id="space"></canvas>

</template>

<script>
import { Donation } from './api'
import Space from './spacelib'

export default {
  data () {
    return {
      space: null
    }
  },

  mounted () {
    this.space = new Space()
    Donation.display().then(
      response => {
        this.space.setStars(response.data.donations)
        console.log(this.space.getClosestStars(0, 0))
      },
      error => {
        console.error('Could not get donation display', error.response.data)
      }
    )
  },

  sockets: {
    donation_display (data) {
      console.log('adding', data)
      this.space.addStar(data)
    }
  }
}
</script>

<style>
</style>
