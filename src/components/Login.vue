<template>
  <div>
    <img class="logo" src="../assets/Pennsieve-Logo-RGB.svg">
    <div class="container">
      <div class="row">
        <div class="col-sm"></div>
        <div class="col-sm">
          <form v-on:submit="login">
            <div class="form-group">
              <input class="form-control" v-model="email" placeholder="Email">
            </div>
            <div class="form-group">
              <input type="password" class="form-control" v-model="password" placeholder="Password">
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <i v-if="loading" class="fas fa-circle-notch fa-spin"></i>
                Login
              </button>
            </div>
          </form>
        </div>
        <div class="col-sm"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data: function () {
    return {
      email: "",
      password: "",
      loading: false
    }
  },
  methods: {
    login: function (e) {
      e.preventDefault();
      this.loading = true;

      this.$http.post('account/login', {
        email: this.email,
        password: this.password
      })
      .then(response => {
        this.loading = false;

        const token = "bearer " + response.data.sessionToken;
        this.axios.defaults.headers.common['Authorization'] = token;
        sessionStorage.setItem('pennsieve-admin-token', token);

        this.$store.dispatch('loginUser');
        this.$router.push('/');
      })
      .catch(error => {
        this.loading = false;
      });
    },
  }
}

</script>

<style scoped>
  .logo {
    margin: 60px auto 30px auto;
    display: block;
    height: 35px;
    width: 198px;
  }
</style>
