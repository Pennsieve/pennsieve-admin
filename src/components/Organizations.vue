<template>
  <div id="organizations">

    <div class="container-fluid">
      <div class="row actions">
        <div class="col-10"></div>
        <div class="col-2">
          <button type="button" class="btn btn-primary" v-on:click="createOrganizationRequest">New Organization</button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Created</th>
                <th scope="col">Identifier</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="organization in organizations" :key="organization.nodeId">
                <th scope="row">{{ organization.id }}</th>
                <td><router-link v-bind:to="'/organizations/' + organization.nodeId">{{ organization.name }}</router-link></td>
                <td>{{ organization.createdAt | moment("dddd, MMMM Do YYYY") }}</td>
                <td>{{ organization.nodeId }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <modal name="create-organization">
      <form class="modal-form">
        <h3>Create new organization</h3>
        <div class="form-group">
          <input class="form-control" v-model="newOrganizationName" placeholder="Organization name">
        </div>
        <div class="form-group">
          <input class="form-control" v-model="newOrganizationSlug" placeholder="Organization slug">
        </div>
        <button type="submit" class="btn btn-primary" v-on:click="createOrganization">Create</button>
      </form>
    </modal>

  </div>
</template>

<script>

export default {
  name: 'Organizations',
  data: function () {
    return {
      newOrganizationName: "",
      newOrganizationSlug: ""
    }
  },
  computed: {
    organizations() {
      if (this.$route.name == 'organizations') {
        return this.$store.state.organizations;
      }
      if (this.$route.name == 'inactiveOrganizations') {
        return this.$store.state.inactiveOrganizations;
      }
      return this.$store.state.organizations;
    }
  },
  methods: {
    createOrganizationRequest: function () {
      this.newOrganizationName = "";
      this.newOrganizationSlug = "";
      this.$modal.show('create-organization');
    },
    createOrganization: function () {
      this.$http.post('admin/organizations', {
        name: this.newOrganizationName,
        slug: this.newOrganizationSlug
      })
      .then(response => {
        const organization = response.data;
        const organizations = [...this.organizations, organization];

        this.$store.dispatch('updateOrganizations', organizations);
        this.$modal.hide('create-organization');
        this.$router.push('/organizations/' + organization.nodeId);
      })
      .catch(error => {
      });
    }
  }
}

</script>

<style scoped>
  .actions {
    padding-top: 30px;
  }
</style>
