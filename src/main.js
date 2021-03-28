import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";

import axios from "axios";
import VueAxios from "vue-axios";
import VModal from "vue-js-modal";
import Autocomplete from 'v-autocomplete'

import * as site from '@/site-config/site.json';

Vue.use(VueAxios, axios);
Vue.use(VModal);
Vue.use(require("vue-moment"));
Vue.use(Autocomplete);

Vue.axios.defaults.headers.post["Content-Type"] = "application/json";
Vue.axios.defaults.headers.put["Content-Type"] = "application/json";
Vue.axios.defaults.baseURL = site.API_URL;

const token = sessionStorage.getItem('pennsieve-admin-token');
if (token) {
  Vue.axios.defaults.headers.common['Authorization'] = token;
}

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  template: "<App/>",
  components: { App }
});
