<template>
  <div id="app">

    <div class="bg-light" v-if="loggedIn">
      <nav class="navbar navbar-expand-lg navbar-light">
        <router-link class="navbar-brand" to="/">
          <img id="logo" src="./assets/Pennsieve-Logo-RGB.svg">
        </router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/organizations">Organizations</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/organizations/inactive">Inactive Organizations</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/packages/search">Where's My Package?</router-link>
            </li>
          </ul>
          <form class="form-inline">
            <v-autocomplete
              :items="filterdOrgs"
              :input-attrs="inputAttrs"
              v-model="organization"
              :get-label="getLabel"
              :component-item="template"
              :auto-select-one-item="false"
              @change="updateItems"
              @item-selected="handleItemSelect"
            >
            </v-autocomplete>
          </form>
        </div>
      </nav>
    </div>

    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
import swal from 'sweetalert'

import SearchItemTemplate from './components/SearchItemTemplate.vue'

export default {
  name: 'app',
  data() {
    return {
      template: SearchItemTemplate,
      organization: { name: '' },
      searchText: '',
      filterdOrgs:  [],
      inputAttrs: {
        autoFocus: false,
        placeholder: 'Search'
      }
    }
  },
  computed: {
    getLoggedIn() {
       return this.$store.getters.getLoggedIn
    },
    loggedIn() {
      return this.$store.state.loggedIn
    },
    organizations() {
      return this.$store.state.organizations;
    }
  },
  mounted: function () {
    if (this.getLoggedIn()) {
      this.fetchOrgs()
    }
    this.$store.watch(this.getLoggedIn, this.fetchOrgs.bind(this))
  },
  methods: {
    fetchOrgs() {
      // addressing bug where search form submits when 'enter' key is pressed
      const form = document.querySelector('.navbar form')
      form.addEventListener('submit', (e) => {
        e.preventDefault()
      })

      this.$http.get('admin/organizations')
        .then(response => {
          this.$store.dispatch('updateOrganizations', response.data)
          this.filterdOrgs = response.data
        })
        .catch(error => {
          swal("Failure!", "There was an error fetching organizations.", "error");
          // console.log(error)
        });
      this.$http.get('admin/organizations/inactive')
        .then(response => {
          this.$store.dispatch('updateInactiveOrganizations', response.data)
          this.filterdOrgs = response.data
        })
        .catch(error => {
          swal("Failure!", "There was an error fetching organizations.", "error");
          // console.log(error)
        });
    },
    getLabel (item) {
      if (item) {
        return item.name
      } else {
        return this.searchText
      }
    },
    updateItems (text) {
      const t = text.toLowerCase()
      this.searchText = text

      const organizations = [...this.$store.state.organizations]
      // FIXME: Update initial filter logic below -DKH
      this.filterdOrgs = organizations.filter(org => org.name.toLowerCase().includes(t))
    },
    handleItemSelect(item) {
      const id = item.nodeId
      if (id) {
        this.$router.push({ path: `/organizations/${id}`})
      }
    }
  }
}

</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  main {
    padding: 20px 0;
  }

  main,
  nav {
    margin: 0 auto;
    max-width: 1440px;
  }

  #logo {
    width: 200px;
  }

  .modal-form {
    padding: 50px;
  }

  .modal-form h3 {
    padding-bottom: 10px;
  }

  .actions {
    padding-bottom: 30px;
  }

  button:hover {
    cursor: pointer;
  }

  /* Autocomplete */
  .v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
      font-size: 1.5em;
      padding: 5px 10px 0;
      -webkit-box-shadow: none;
      box-shadow: none;
      border: 1px solid #157977;
      width: 100%;
      outline: none;
      background-color: #eee
  }

  .v-autocomplete .v-autocomplete-input-group.v-autocomplete-selected .v-autocomplete-input {
      color: green;
      background-color: #f2fff2
  }

  .v-autocomplete .v-autocomplete-list {
      position: relative;
      z-index: 100;
      width: 100%;
      text-align: left;
      border: none;
      border-top: none;
      max-height: 400px;
      overflow-y: auto;
      border-bottom: 1px solid #157977
  }

  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item {
      cursor: pointer;
      background-color: #fff;
      padding: 10px;
      border-bottom: 1px solid #157977;
      border-left: 1px solid #157977;
      border-right: 1px solid #157977
  }

  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item:last-child {
      border-bottom: none
  }

  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item:hover {
      background-color: #eee
  }

  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item abbr {
      opacity: .8;
      font-size: .8em;
      display: block;
      font-family: sans-serif
  }

  pre {
      white-space: pre-wrap;
      background-color: #eee;
      border: 1px solid silver;
      padding: 20px!important;
      border-radius: 10px;
      font-family: monospace!important
  }

  .left,pre {
      text-align: left
  }

  .note {
      border-left: 5px solid #ccc;
      padding: 10px
  }

  .v-autocomplete {
      position: relative
  }

  .v-autocomplete .v-autocomplete-list {
      position: absolute
  }

  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item {
      cursor: pointer
  }

  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item.v-autocomplete-item-active {
      background-color: #f3f6fa
  }

</style>

<style scoped>
</style>
