<template>

  <q-modal ref="modal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn flat @click="$refs.modal.close()">
          <q-icon name="keyboard_arrow_left"></q-icon>
        </q-btn>
        <div class="q-toolbar-title">
          Organizations overview
        </div>
      </q-toolbar>

      <div class="layout-padding">
        <p class="caption">
          Please select an organization from the list below.<br>
          Organizations can participate on this platform by submitting the following <a @click="$refs.organizationForm.open()">form</a>.<br>
        </p>

        <div class="organization-select" v-for="organization in organizations"
            @click="select(organization)"
            :style="{ background: selectedOrganization === organization._id ? '#ccc' : '' }">
          <h5>{{ organization.name }}</h5>
          <img style="width: 200px;" :src="organization.image"/><br>
          <a :href="organization.link" target="_blank">{{ organization.link }}</a>
          <p class="caption" v-html="organization.description"></p>
        </div>
      </div>

    </q-modal-layout>

    <organization-form ref="organizationForm"></organization-form>

  </q-modal>

</template>

<script>
import { QModal, QModalLayout, QToolbar, QBtn, QIcon } from 'quasar-framework'
import OrganizationForm from './OrganizationForm'
import { Organization } from './api'

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
      selectedOrganization: null,
      organizations: []
    }
  },

  methods: {
    open () {
      this.fetchOrganizations()
      this.$refs.modal.open()
    },

    fetchOrganizations () {
      Organization.get().then(
        response => {
          this.organizations = response.data.organizations
        },
        error => {
          console.error('Could not fetch organizations', error)
        }
      )
    },

    select (organization) {
      if (organization._id === this.selectedOrganization) {
        this.selectedOrganization = null
        this.$emit('selected', '', '')
      } else {
        this.selectedOrganization = organization._id
        this.$emit('selected', organization._id, organization.name)
      }
    },

    reset () {
      this.selectedOrganization = null
      this.$emit('selected', '', '')
    }
  }
}
</script>

<style>
  .organization-select {
    cursor: pointer;
  }
  .organization-select:hover {
    background: #eee;
  }
</style>
