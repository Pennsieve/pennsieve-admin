import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Organizations from '@/components/Organizations'
import Organization from '@/components/Organization'
import PackageSearch from '@/components/PackageSearch'
import Datasets from '@/components/Datasets'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: Home,
      beforeEnter: (to, from, next) => {
        if (!store.getters.getLoggedIn()) {
          next('/login')
        } else {
          next()
        }
      }
    },
    { path: '/login', name: 'login', component: Login },
    { path: '/organizations/inactive', name: "inactiveOrganizations", component: Organizations, props: true },
    { path: '/organizations', name: 'organizations', component: Organizations },
    { path: '/packages', name: 'packages'},
    { path: '/packages/search', name: 'packageSearch', component: PackageSearch, props: true},
    { path: '/organizations/:id', name: "organization", component: Organization, props: true },
    { path: '/organizations/:id/datasets', name: "datasets", component: Datasets, props: true }
  ]
})

export default router
