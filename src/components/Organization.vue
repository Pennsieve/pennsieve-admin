<template>
  <div class="organization">

    <div class="container-fluid">
      <div class="row organization-name">
        <div class="col">
          <h2>{{ organization.name }}</h2>
        </div>
      </div>
      <div class="row attribute">
        <div class="col">
          Created: {{ organization.createdAt | moment("dddd, MMMM Do YYYY") }}
        </div>
      </div>
      <div class="row attribute">
        <div class="col">
          Identifier: {{ organization.nodeId }}
        </div>
      </div>
      <div class="row attribute mb-4">
        <div class="col">
          Custom Terms of Service: {{ tosDisplayValue }}
        </div>
      </div>
      <div class="row actions">
        <!-- <div class="col-12">
          <h5 id="subscription-status">Subscription Status: {{ subscriptionStatus }}</h5>
        </div>
        <div class="col-12 mb-3">
          <h5 id="subscription-status">Subscription Type: {{ subscriptionType }}</h5>
        </div> -->
        <div class="col-12">
          <button type="button" class="btn btn-primary" v-on:click="inviteOwnerRequest">
            Invite Owner
          </button>
          <button v-if="isTrial" type="button" class="btn btn-primary" v-on:click="updateSubscriptionType">
            End Trial
          </button>
          <button v-else type="button" class="btn btn-primary" v-on:click="updateSubscriptionType">
            Start Trial
          </button>
          <button type="button" class="btn btn-primary" v-on:click="refreshStorageMetrics">
            Refresh Storage Metrics
          </button>
          <!-- <button type="button" class="btn btn-danger" v-on:click="hadleResetTSABtnClick">
            Reset TSA
          </button> -->
          <button type="button" class="btn btn-primary" v-on:click="openTermsOfServiceModal">
            Upload Terms of Service
          </button>
          <button type="button:" class="btn btn-primary">
            <router-link class="button-link" v-bind:to="`/organizations/${organization.id}/datasets`">Published Datasets</router-link>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <table class="table">
          <thead>
              <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Identifier</th>
              <th scope="col">Permissions</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="member in members" :key="member.id">
                <th scope="row">{{ member.user.id }}</th>
                <td>{{ member.user.firstName }} {{ member.user.lastName }}</td>
                <td>{{ member.user.email }}</td>
                <td>{{ member.permission }}</td>
                <td>{{ member.user.nodeId }}</td>
                <td>
                  <button class="btn btn-primary" v-on:click="handlePermissionsBtnClick(member.user.nodeId)">
                    Update
                  </button>
                </td>
              </tr>
          </tbody>
          </table>
        </div>
      </div>
    </div>

    <modal height="auto" name="invite-owner">
      <form class="modal-form">
        <h3>Invite organization owner</h3>
        <div class="form-group">
          <input class="form-control" v-model="newOwnerFirstName" placeholder="First Name">
        </div>
        <div class="form-group">
          <input class="form-control" v-model="newOwnerLastName" placeholder="Last Name">
        </div>
        <div class="form-group">
          <input class="form-control" v-model="newOwnerEmail" placeholder="Email">
        </div>
        <button type="submit" class="btn btn-primary" v-on:click.prevent="inviteOwner">Invite</button>
      </form>
    </modal>

    <modal height="auto" name="user-permissions">
      <form class="modal-form">
        <h3>Update User Permissions</h3>
        <div class="form-row">
          <div class="col-12">
            <select v-on:change="handlePermissionSelection" class="custom-select custom-select-lg mb-3">
              <option selected>Select Permission</option>
              <option value="administer">Administer</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" v-on:click.prevent="updateUserPermissions">Submit</button>
      </form>
    </modal>

    <modal height="auto" name="terms-of-service">
      <form class="modal-form">
        <h3>Upload Terms of Service</h3>
        <div class="form-row">
          <div class="col-12">
            <div class="form-group">
              <div class="input-group custom-file mb-3">
                <input @change="onTosInputChange" type="file" class="custom-file-input" id="terms-of-service-input">
                <label class="custom-file-label" for="terms-of-service-input">{{ tosInputLabelText }}</label>
              </div>
              <div class="mb-3">Is this a New Terms of Service Version?</div>
              <select @change="onNewVersionSelection" class="custom-select">
                <option selected>Choose...</option>
                <option value="Yes">Yes</option>
                <option value="NO">No</option>
              </select>
            </div>
          </div>
        </div>
        <p v-show="isNewVersion">Submitting will force all users in this organization to accept the terms.</p>
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="!termsOfServiceFile.name"
          v-on:click.prevent="submitTermsOfService"
        >
          Submit
        </button>
      </form>
    </modal>

  </div>
</template>

<script>
import swal from 'sweetalert';
import { uniqBy, path, propOr, pathOr } from 'ramda';
import moment from 'moment';

export default {
  name: 'Organization',
  props: ['id'],
  data: function () {
    return {
      newOwnerFirstName: '',
      newOwnerLastName: '',
      newOwnerEmail: '',
      selectedUserID: '',
      selectedUserPermission: '',
      organization: {},
      subscriptionStatus: '',
      subscriptionType: '',
      isTrial: '',
      members: [],
      termsOfServiceFile: {},
      termsOfService: '',
      isNewVersion: false
    }
  },
  computed: {
    /**
     * Compute customer terms of service url
     * @returns {String}
     */
    termsOfServiceUrl: function() {
      return `admin/organizations/${this.id}/custom-terms-of-service`
    },

    /**
     * Compute it org has custom terms of service
     * @returns {Boolean}
     */
    hasCustomTermsOfService: function() {
      return propOr(false, 'updatedAt', this.termsOfService)
    },

    /**
     * Compute the display value for custom terms
     * @returns {String}
     */
    tosDisplayValue: function() {
      const org = this.organization
      return org.customTermsOfServiceVersion ? org.customTermsOfServiceVersion : 'N/A'
    },

    /**
     * Compute terms of service label text
     * @returns {String}
     */
    tosInputLabelText: function() {
      const fileName = this.termsOfServiceFile.name
      return fileName ? fileName : 'Choose a File'
    }
  },
  beforeMount: function () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    inviteOwnerRequest: function () {
      this.newOwnerFirstName = '';
      this.newOwnerLastName = '';
      this.newOwnerEmail = '';
      this.$modal.show('invite-owner');
    },
    inviteOwner: function () {
      if (!this.newOwnerFirstName || !this.newOwnerLastName || !this.newOwnerEmail) {
        return swal('Failure!', 'Please complete form', 'error');
      }
      const body = {
        inviterFullName: `${this.newOwnerFirstName.trim()} ${this.newOwnerLastName.trim()}`,
        organizationId: this.id,
        email: this.newOwnerEmail,
        firstName: this.newOwnerFirstName,
        lastName: this.newOwnerLastName,
        isOwner: true
      }
      this.$http.post('admin/users/invite', body)
      .then(response => {
        const data = propOr([], 'data', response);
        const owners = data.map(user => {
          return {
            permission: 'owner',
            user
          }
        });
        const updatedMembers = this.members.concat(owners);
        this.members = uniqBy(path(['user', 'id']), updatedMembers);
        this.$modal.hide('invite-owner');
      })
      .catch(error => {
        console.log('error', error) 
      });
    },
    getOrg: function () {
      this.$http.get('organizations/' + this.id)
      .then(response => {
        this.organization = response.data.organization
      })
      .catch(error => {
        console.log('error', error)
      });
    },
    getOrgSubscription: function () {
      this.$http.get(`admin/organizations/${this.id}/subscription`)
      .then(response => {
        this.subscriptionStatus = response.data.status;
        if (response.data.type == null) {
          this.subscriptionType = 'None'
          this.isTrial = false
        }
        else {
          this.subscriptionType = response.data.type
          this.isTrial = true
        }
      })
      .catch(error => {
        console.log('error', error)
      });
    },
    getOrgUsers: function () {
      this.$http.get('admin/organizations/' + this.id + '/users')
      .then(response => {
        this.members = response.data;
      })
      .catch(error => {
        console.log('error', error)
      });
    },
    fetchData: function() {
      this.getOrg()
      this.getOrgSubscription()
      this.getOrgUsers()
    },
    handlePermissionsBtnClick: function (userID) {
      this.selectedUserID = userID;
      this.$modal.show('user-permissions');
    },
    handlePermissionSelection: function (userID) {
      this.selectedUserPermission = event.target.value;
    },
    updateUserPermissions: function () {
      if (!this.selectedUserID && !this.selectedUserPermission) {
        return;
      }

      this.$http.put(`admin/organizations/${this.id}/users`, {
        userId: this.selectedUserID,
        permission: this.selectedUserPermission
      })
      .then(response => {
        this.$modal.hide('user-permissions');

        const memberIndex = this.members.findIndex(obj => obj.user.nodeId === this.selectedUserID);
        const member = this.members[memberIndex];
        member.permission = this.selectedUserPermission;

        const { firstName, lastName } = member.user;
        swal({
          title: 'Success!',
          text: `User permissions for ${firstName} ${lastName} have been updated`,
          icon: 'success',
        })
        this.resetUserSelection();
      })
      .catch(error => {
        this.$modal.hide('user-permissions');
        swal('Failure!', 'There was an error.', 'error');
        this.resetUserSelection();
      });
    },
    resetUserSelection: function () {
      this.selectedUserID = '';
      this.selectedUserPermission = '';
    },
    hadleResetTSABtnClick: function () {
      swal({
        title: 'Reset Terms of Service Agreement',
        text: 'Are you Sure?',
        icon: 'warning',
        buttons: ['Cancel', 'Confirm'],
        dangerMode: true
      })
      .then((reset) => {
        if (reset) {
          this.resetOrgTSA()
        }
      })
    },
    resetOrgTSA: function () {
      this.$http.delete(`admin/organizations/${this.id}/subscription`)
        .then(response => {
          swal('Success!', 'The TSA Has been flushed.', 'success')
          this.subscriptionStatus = 'PendingSubscription';
        })
        .catch(error => {
          swal('Failure!', 'There was an error.', 'error');
        })
    },
    refreshStorageMetrics: function () {
    this.$http.get(`admin/organizations/${this.id}/storage`)
      .then(response => {
        swal('Success!', 'Your job has been submitted.', 'success')
      })
      .catch(error => {
        swal('Failure!', 'There was an error.', 'error');
      })
    },
    updateSubscriptionType: function () {
      this.$http.put(`admin/organizations/${this.id}/subscription`, {
        isTrial: !this.isTrial
      })
      .then(response => {
        swal('Success!', 'You have updated the subscription.', 'success')
      })
      .catch(error => {
        swal('Failure!', 'There was an error.', 'error');
      })
    },
    /**
     * Open terms of service modal
     */
    openTermsOfServiceModal: function() {
      this.$modal.show('terms-of-service');
    },
    /**
     * Submit terms of service xhr
     */
    submitTermsOfService: function() {
      const url = `admin/${this.termsOfServiceUrl}?isNewVersion=${this.isNewVersion}`

      this.$http.put(url, this.termsOfServiceFile, {
        headers: {
          'Content-Type': 'text/html'
        }
      })
      .then(response => {
        this.$modal.hide('terms-of-service');
        this.termsOfServiceFile = {}
        this.termsOfService = response.data
      })
      .catch(error => {
        console.log('error', error) 
      });
    },
    /**
     * Handle terms of service new version selection
     * @param {Object} evt
     */
    onNewVersionSelection: function(evt) {
      this.isNewVersion = Boolean(evt.target.value === 'Yes') ? true : false
    },
    /**
     * Handle terms of service file input change
     * @param {Object} e
     */
    onTosInputChange: function(e) {
      const file = pathOr({}, ['target', 'files', 0], e)
      this.termsOfServiceFile = file
    }
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
