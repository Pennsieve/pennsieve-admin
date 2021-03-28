<template>
    <div class="package-finder">
        <img :src="getImgUrl"/>
        <div class="package-finder-input">
            <input type="text" v-model="packageId" placeholder="Enter packageId" name="packageId">
            <button type="button" class="btn btn-primary" @click="findPackage">Find my package!</button>
        </div>
        <div class="package-finder-results">
            <div v-show="isLoading">
                <h2>Loading...</h2>
            </div>
            <div class="package-finder-results-info" 
                :class="{ 'package-info-success': status === 'READY' || status === 'SUBMITTED' || status === 'SUCCEEDED' || status === 'RUNNABLE', 
                           'package-info-failed': status === 'ERROR' || status === 'EXPORT_FAILED' || status === 'IMPORT_FAILED' || status === 'FAILED', 
                           'package-info-unavailable': status === 'UNAVAILABLE' || status === 'EXPORTING' || status === 'IMPORTING' || status === 'RUNNING' || status === 'STARTING',
                           'package-info-deleting': status === 'DELETING'}" v-if="hasResults">
               <div class="container-fluid">
                <div class="row package-name">
                    <div class="col">
                    <h3>Package Name: {{ this.resultObj.data.package.content.name }}</h3>
                    </div>
                </div>
                <div class="row package-date">
                    <div class="col">
                    <strong>Created:</strong> {{ this.resultObj.data.package.content.createdAt | moment("dddd, MMMM Do YYYY") }}
                    </div>
                </div>
                <div class="row package-owner">
                    <div class="col">
                    <strong>Owner:</strong> {{ this.resultObj.data.user.firstName }}  {{this.resultObj.data.user.lastName}}
                    </div>
                </div>
                <div class="row package-org">
                    <div class="col">
                    <strong>Organization:</strong> {{ this.resultObj.data.organization.name }}
                    </div>
                </div>
                <div class="row package-dataset">
                    <div class="col">
                    <strong>Dataset:</strong> {{ this.resultObj.data.dataset.name }}
                    </div>
                </div>
                 <div class="row package-source-files">
                    <div class="col">
                    <strong>Source Files:</strong> {{ this.resultObj.data.job.s3Path }}
                    </div>
                </div>     
              </div>
                <div class="row package-logs">
                    <div class="col">
                    <a :href="getLogsUrl">View Logs</a>
                    </div>
               </div>
                <div class="row package-type">
                    <div class="col">
                    <h4>Package Type: {{ this.resultObj.data.package.content.packageType }} </h4>
                    </div>
                </div>
                <div class="row package-status">
                    <div class="col-8">
                    <h4 id="subscription-status">Package State: 
                        <span 
                         :class="{ 'package-status-success': status === 'READY', 
                                   'package-status-failed': status === 'ERROR',
                                   'package-status-unavailable': status === 'UNAVAILABLE',
                                   'package-status-deleting': status === 'DELETING'}">
                            {{resultObj.data.package.content.state}}
                        </span></h4>
                    </div> 
                </div>  
        </div>
    </div>
   </div> 
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        name: 'PackageSearch',
        data() {
            return {
                packageId: '',
                isLoading: false,
                hasResults: false,
                status: 'DEFAULT', 
                resultObj: {}   
            }
        },
        methods: {
            findPackage: function() {
                if (!this.getPackageUrl){
                    return
                }
                this.isLoading = true
                const userToken = this.$store.state.userToken
                const url = `${this.getPackageUrl}/${this.packageId}`

                this.$http.get(url, {
                    header: {
                        'Authorization': `bearer ${userToken}`
                    },
                }).then(response => {
                    this.resultObj = response
                    this.status = this.resultObj.data.package.content.state
                    this.isLoading = false
                    this.hasResults = true
                    
                }).catch(error => {
                    this.hasResults = false
                    this.status = 'INVALID'
                });

            }
        },

        computed: {
            getPackageUrl: function() {
                const url = this.$store.state.config
                return `${url}admin/packages`
            },

            getImgUrl: function() {
                const stateTypes = {
                    'SUBMITTED': '/static/images/successmeme.png',
                    'SUCCEEDED': '/static/images/successmeme.png',
                    'RUNNABLE': '/static/images/successmeme.png',
                    'READY': '/static/images/successmeme.png',
                    'ERROR': '/static/images/errormeme.jpg',
                    'EXPORT_FAILED': '/static/images/errormeme.jpg',
                    'IMPORT_FAILED': '/static/images/errormeme.jpg',
                    'FAILED': '/static/images/errormeme.jpg',
                    'UNAVAILABLE': '/static/images/processingmeme.jpg',
                    'EXPORTING': '/static/images/processingmeme.jpg',
                    'IMPORTING': '/static/images/processingmeme.jpg',
                    'PENDING': '/static/images/processingmeme.jpg',
                    'RUNNING': '/static/images/processingmeme.jpg',
                    'STARTING': '/static/images/processingmeme.jpg',
                    'DELETING': '/static/images/deletingmeme.jpg',
                    'INVALID': '/static/images/memenotfound.jpg',
                    'DEFAULT': '/static/images/shrugging meme.jpg'
                }
                const _state = stateTypes[this.status]
                return _state
            },

            getLogsUrl: function() {
                return this.resultObj.data.job.logs
            }
        },
    }
</script>

<style scoped>

    .package-finder {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .package-finder .btn-primary {
        height: 40px;
        margin-bottom: 4px;
    }

    .package-finder .package-unavailable {
        width: 500px;
    }

    .package-finder h1{
        text-align: center;
        font-weight: 700;
        margin-top: 20px;
    }

    .package-finder img {
        width: 700px;
        align-self: center;
        margin-top: 15px;
    }

    .package-finder-results {
        display: flex;
        justify-content: center;
    }

    .package-finder-results-info {
        margin-top: 30px;
        width: 717px;
        height: 440px;
        padding-top: 10px;
    }
    .package-finder-results img {
        align-self: center;
        width: 290px;
        margin-top: 35px;
    }

    .package-finder-input {
       align-self: center;
       margin-top: 30px;
    }

    .package-finder-input input {
        /** add css styling here **/
        height: 41px;
        width: 300px;
        background-color: #eff9ff;
        border: solid 1px #154fa3;

    }

    .package-input button {
        margin-left: 15px;
    }

    .package-finder-results .package-logs .package-parrot {
        width: 44px;
        margin-left: 17px;
        margin-top: 0;
    }

    .package-type {
        margin-top: 15px;
        margin-left: 3px;
    }

    .package-status {
        margin-left: 3px;
    }

    .package-date, .package-owner, .package-org, .package-dataset, .package-source-files, .package-logs {
        color: rgb(34, 35, 37);
        font-size: 20px;
    }

    .package-source-files {
        margin-bottom: 20px;
    }

    .package-logs a {
        margin-left: 17px;
        margin-top: 30px;
        font-size: 25px;
        text-align: center;
    }

    .package-status-success {
        color: green;
    }

    .package-status-failed {
        color: red;
    }

    .package-status-unavailable {
        color: #cc5902;
    }

    .package-status-deleting {
        color: grey;
    }

    .package-info-success {
        background-color: #bfefc6;
        border: solid 1px #367f41;
    }

    .package-info-failed {
        background-color: #fff0ef;
        border: solid 1px #842e2e;
    }

    .package-info-unavailable {
        background-color: #ffefe2;
        border: solid 1px #c16226;
    }

    .package-info-deleting {
        background-color: #ccc3bd;
        border: solid 1px #302d2c;
    }
</style>