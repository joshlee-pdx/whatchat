<template>
  <f7-page name="signup">
    <f7-navbar title="Sign up" back-link="Back"></f7-navbar>
    <div align="center" class="wrapper">
      <img class="image--cover" :src="image_url" alt="" @click="launchFilePicker"/>
    </div>
    <f7-list no-hairlines-md>
      <f7-list-input
        :value="name"
        @input="name=$event.target.value"
        label="Display name"
        type="text"
        placeholder="Your display name"
        clear-button
      >
      </f7-list-input>

      <f7-list-input
        :value="email"
        @input="email=$event.target.value"
        label="E-mail"
        type="email"
        placeholder="Your e-mail"
        clear-button
      >
      </f7-list-input>

      <f7-list-input
        :value="password"
        @input="password=$event.target.value"
        label="Password"
        type="password"
        placeholder="Your password"
        clear-button
      >
      </f7-list-input>
    </f7-list>
    <f7-block>
      <f7-button outline @click="signUp">Sign Up</f7-button>
      <input type="file" ref="file" @change="onFilePicked" style="display:none;">

    </f7-block>
  </f7-page>
</template>

<script>
import { mixin } from '../../js/mixin';

export default {
  // Add mixin for custom toast and alert messages 
  mixins: [ mixin ],
  props: {
    f7router: Object,
  },

  // Default data variables
  data() {
    return {
      name:null,
      email:null,
      password:null,
    }
  }, // End of Data
  computed:{
    image_url() {
      return this.$store.getters.image_url;
    },
    files() {
      return this.$store.getters.files;
    },
    signed_up() {
      return this.$store.getters.signed_up;
    }
  }, // End of Computed 
  watch: {
    signed_up(value) {
      if(value == true){
          this.f7router.navigate('/signin/');
      }
    },
  },
  methods:{
    launchFilePicker() {
        this.$refs.file.click();
    },

    onFilePicked(event) {
      const self = this;

      // If there is a file at all
      if(event.target.files.length > 0){
        // Return if file is too big
        if(event.target.files[0]['size'] > 200000) {
          this.$store.commit('setAlertMessage', 'The image size is greater than 200KB');
          return;
        }
        // Read the image file 
        this.$store.dispatch('readFile');
      }
    }, // onFilePicked() method close

    signUp() {
      const self = this;

      // Check if proper name size
      if(this.name == null || this.name.length < 3){
        this.$store.commit('setAlertMessage', "Name must be at least 3 characters long.");
        return;
      }      

      var payload = {name: '',email:'',password:'',photoURL:''};
      payload.name = this.name;
      payload.email = this.email;
      payload.password = this.password;
      payload.photoURL = this.image_url;
        // alert(JSON.stringify(payload))

      if (self.files) {
        self.$store.dispatch('uploadFile').then(url => {
          payload.photoURL = url;
          self.$store.dispatch('signUp', payload);
        });
      } else 
        this.$store.dispatch('signUp',payload);
    }, // signedUp() method close
  }, // End of methods
  created() {
    this.$store.commit('setSignedUp', false);
  },
}
</script>