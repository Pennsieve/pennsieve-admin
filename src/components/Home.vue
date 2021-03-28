<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Organizations</h5>
            <p class="card-text">Total: {{ orgsCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Inactive Organizations</h5>
            <p class="card-text">Total: {{ inactiveOrgsCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">Where's My Package?</h5>
            <p class="card-text">Package Finder</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data: function () {
    return {
      orgsCount: 0,
      inactiveOrgsCount: 0
    }
  },
  computed: {
    getOrgsCount() {
      return this.$store.getters.getOrgsCount
    },
    getInactiveOrgsCount() {
      return this.$store.getters.getInactiveOrgsCount
    },
  },
  mounted: function() {
    if (this.$store.state.organizations) {
      this.updateOrgsCount()
    }
    if (this.$store.state.inactiveOrganizations) {
      this.updateInactiveOrgsCount()
    }
    this.$store.watch(this.getOrgsCount, this.updateOrgsCount.bind(this))
    this.$store.watch(this.getInactiveOrgsCount, this.updateInactiveOrgsCount.bind(this))
  },
  methods: {
    updateOrgsCount: function() {
      this.orgsCount = this.$store.getters.getOrgsCount()
    },
    updateInactiveOrgsCount: function() {
      this.inactiveOrgsCount = this.$store.getters.getInactiveOrgsCount()
    }
  }
}

</script>

<style scoped>

</style>
