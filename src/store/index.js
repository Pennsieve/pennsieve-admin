import Vue from "vue";
import Vuex from "vuex";
import * as site from '../site-config/site.json'

Vue.use(Vuex);

// state
const state = {
  loggedIn: sessionStorage.getItem('bf-admin-token') ? true : false,
  organizations: [],
  inactiveOrganizations: [],
  config: site.API_URL,
  userToken: sessionStorage.getItem('bf-admin-token')
}

// mutations
const mutations = {
  loginUser(state) {
    state.loggedIn = true;
  },
  updateOrganizations(state, organizations) {
    state.organizations = organizations;
  },
  updateInactiveOrganizations(state, inactiveOrganizations) {
    state.inactiveOrganizations = inactiveOrganizations;
  }
}

// actions
const actions = {
  loginUser({ commit }) {
    commit('loginUser');
  },
  updateOrganizations({ commit }, organizations) {
    commit('updateOrganizations', organizations)
  },
  updateInactiveOrganizations({ commit }, inactiveOrganizations) {
    commit('updateInactiveOrganizations', inactiveOrganizations)
  }
}

// getters
export const getters = {
  getLoggedIn: state => () => state.loggedIn,
  getOrgsCount: state => () => state.organizations.length,
  getInactiveOrgsCount: state => () => state.inactiveOrganizations.length,
  config: state => state.config
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
