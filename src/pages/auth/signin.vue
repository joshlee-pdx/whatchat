<template>
  <f7-page name="signin">
    <f7-navbar title="Sign In"></f7-navbar>

    <f7-list no-hairlines-md>
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
      <f7-button outline @click="signIn">Sign In</f7-button>
      <div align="center">
        <f7-link v-if="show_resend_email" @click="resendEmail" :color="color(time_left)">Resend Confirmation Email<span v-if="time_left>0">&nbsp; - Retry in {{time_left}}s</span></f7-link><br>
        <f7-link href="/signup/">Don't have an account? Sign up</f7-link><br>
        <f7-link @click="forgetPassword">Forgot Password</f7-link><br>
      </div>
    </f7-block>
  </f7-page>
</template>

<script>
import { mixin } from '../../js/mixin';
import firebase from 'firebase';

export default {
  // Add mixin for custom toast and alert messages 
  mixins: [ mixin ], 
  data() {
    return {
        email:null,
        password:null,
        time_left:-1,
      }
  }, // End of Data section
  computed: {
    show_resend_email() {
      return this.$store.getters.show_resend_email;
    }
  }, // End of Computed section
  methods: {
    signIn() {
      // Load payload with user email and password
      var payload = {};
      payload.email = this.email;
      payload.password = this.password;
      // Send sign in dispatch request to store
      this.$store.dispatch('signIn', payload);
    },
    resendEmail() {
      const self = this;
      
      if(this.email != null){
        // Only allow verification email to be resent after time interval
        if(this.time_left <= 0 ){
          console.log("Verification Email resent.");
          this.$store.dispatch('sendVerification');  // BUG: if a different user signs in and then signs out: system gets confused on who is user and cant resend verification
          self.countDown();
        }
      } else {
        self.$store.commit('setAlertMessage', 'Please enter your email.');
      }
    },
    // Create a 20 second timer
    countDown() {
      const self= this;
      self.time_left = 20;
      var timer = setInterval(function(){
        console.log('Time Left: ' + self.time_left);
        self.time_left -= 1;
        if(self.time_left <= 0){
          clearInterval(timer);
        }
      },1000);
    },
    color(timeleft) { 
      if(timeleft <= 0)
        return '#007aff';
      else
        return 'gray';
    },
    // Allow user to retrieve reset password link
    forgetPassword() {
      const self = this;
      var auth = firebase.auth();

      if(this.email != null) {
        // Try to send reset password link to user
        auth.sendPasswordResetEmail(this.email)
          .then(function(){
            // Email sent.
            self.$store.commit('setAlertMessage', 'A Reset Password email has been sent.');
          }).catch(function(error){
            // An error happened.
            self.$store.commit('setAlertMessage', error.message);
          });
      } else{
        self.$store.commit('setAlertMessage', 'Please enter your email.');
      }
    },
  }, // End of Methods section
}
</script>

