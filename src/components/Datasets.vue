<template>
  <div>
    <div class="container-fluid">
      <div class="row organization-name">
        <div class="col">
          <h2>{{ organization.name }}: Published Datasets</h2>
        </div>
      </div>
      <div class="row attribute">
        <div class="col">
          Created: {{ organization.createdAt | moment("dddd, MMMM Do YYYY") }}
        </div>
      </div>
      <div class="row attribute mb-4">
        <div class="col">
          Identifier: {{ organization.nodeId }}
        </div>
      </div>
      <div class="row actions">
        <div class="col-12">
          <button type="button" class="btn btn-primary">
            <router-link class="button-link" v-bind:to="`/organizations/${organization.nodeId}`">Org Home</router-link>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Source Dataset ID</th>
                <th scope="col">Published Dataset ID</th>
                <th scope="col">Version Count</th>
                <th scope="col">Status</th>
                <th scope="col">Last Published Date</th>
                <th scope="col">Sponsorship</th>
                <th scope="col">Sponsor Title</th>
                <th scope="col">Sponsor Image URL</th>
                <th scope="col">Sponsor Markup</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dataset in datasets" :key="dataset.sourceDatasetId">
                <td>{{ dataset.name }}</td>
                <td>{{ dataset.sourceDatasetId }}</td>
                <td>{{ dataset.publishedDatasetId }}</td>
                <td>{{ dataset.publishedVersionCount }}</td>
                <td>{{ dataset.status }}</td>
                <td>{{ dataset.lastPublishedDate }}</td>
                <td>
                  <button class="btn btn-primary" v-on:click="handleSponsorBtnClick(dataset.sourceDatasetId)">
                    {{ dataset.sponsorship ? "Update" : "Create" }}
                  </button>
                </td>
                <td>{{ pathOr('', ['sponsorship', 'title'], dataset) }}</td>
                <td>{{ pathOr('', ['sponsorship', 'imageUrl'], dataset) }}</td>
                <td>{{ pathOr('', ['sponsorship', 'markup'], dataset) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <modal height="auto" name="sponsorship">
      <form class="modal-form">
        <h3>Manage Dataset Sponsorship</h3>
        <div class="form-group">
          <label for="form-title">Title</label>
          <input id="form-title" class="form-control" v-model="sponsorship.title" placeholder="Title">
        </div>
        <div class="form-group">
          <label for="form-url">Image URL</label>
          <input id="form-url" class="form-control" v-model="sponsorship.imageUrl" placeholder="Image URL">
        </div>
        <div class="form-group">
          <label for="form-markup">Markup</label>
          <textarea id="form-markup" class="form-control" v-model="sponsorship.markup" placeholder="Markup" />
        </div>
        <button type="submit" class="btn btn-primary" v-on:click.prevent="upsertSponsorship">{{ selectedDataset.sponsorship ? "Update" : "Create" }} Sponsorship</button>
        <button type="submit" class="btn btn-secondary" v-on:click.prevent="removeSponsorship">Remove Sponsorship</button>
      </form>
    </modal>

  </div>
</template>

<script>
import { pathOr } from 'ramda'
export default {
  name: 'Datsets',
  props: ['id'],
  data: function() {
    return {
      datasets: [],
      organization: {},
      selectedDataset: {},
      sponsorship: {},
    }
  },
  beforeMount: function() {
    this.getOrgAndDatasets()
  },
  watch: {
    '$route': 'getOrgAndDatasets'
  },
  methods: {
    getDatasets: function(datasetId) {
      this.$http.get(`admin/organizations/${datasetId}/datasets`)
        .then(response => {
            this.datasets = response.data
        })
        .catch(error => {
            console.log('error', error)
        });
    },
    getOrgAndDatasets: function () {
      this.$http.get('admin/organizations/' + this.id)
        .then(response => {
          this.organization = response.data
          this.getDatasets(response.data.id)
        })
        .catch(error => {
          console.log('error', error)
        });
    },
    handleSponsorBtnClick: function (datasetId) {
      const dataset = this.datasets.find(d => d.sourceDatasetId === datasetId);
      this.selectedDataset = dataset
      this.sponsorship = dataset.sponsorship ? dataset.sponsorship : {}
      this.$modal.show('sponsorship');
    },
    upsertSponsorship: function() {
      this.$http
        .post(`admin/organizations/${this.organization.id}/datasets/${this.selectedDataset.sourceDatasetId}/sponsor`, this.sponsorship)
        .then(() => {
          this.datasets = this.datasets.map(d => {
            if (d.sourceDatasetId === this.selectedDataset.sourceDatasetId) {
              return Object.assign(d, { sponsorship: this.sponsorship })
            }
            return d;
          })
          this.$modal.hide('sponsorship')
        })
        .catch(error => {
          console.log('error', error)
        });
    },
    removeSponsorship: function() {
      this.$http
        .delete(`admin/organizations/${this.organization.id}/datasets/${this.selectedDataset.sourceDatasetId}/sponsor`)
        .then(() => {
          this.datasets = this.datasets.map(d => {
            if (d.sourceDatasetId === this.selectedDataset.sourceDatasetId) {
              return Object.assign(d, { sponsorship: undefined })
            }
            return d;
          })
          this.$modal.hide('sponsorship')
        })
        .catch(error => {
          console.log('error', error)
        });
    },
    pathOr,
  }
}
</script>

<style scoped>
  .organization-name {
    padding-top: 30px;
  }
  .attribute {
    color: #71747C;
  }
  #subscription-status {
    margin-top: 10px;
  }
  .button-link {
    color: white;
    text-decoration: none;
  }
</style>