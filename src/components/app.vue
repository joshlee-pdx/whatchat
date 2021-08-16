<template>
  <f7-app v-bind="f7params" >

  <!-- Left panel with cover effect-->
  <f7-panel left cover theme-dark id="left-panel">
    <f7-view>
      <f7-page>
        <div class="wrapper">
          <img class="image--cover" :src="photo_url" v-on:click="editProfileNavigate" panel-close link='#' />
          <f7-block>{{display_name}}</f7-block>
        </div>
        <f7-list>
          <f7-list-item link="/signin/" view=".view-main" panel-close title="Sign in"> </f7-list-item>
          <f7-list-item link='#' @click="signOut" view=".view-main" panel-close title="Sign out"> </f7-list-item>
        </f7-list>
      </f7-page>
    </f7-view>
  </f7-panel>

  <!-- Views/Tabs container -->
  <f7-views tabs class="safe-areas" v-if='signed_in' >
    <!-- Tabbar for switching views-tabs -->
    <f7-toolbar tabbar labels bottom v-show="show_tabbar">
      <f7-link tab-link="#view-home" tab-link-active icon-ios="f7:house_fill" icon-aurora="f7:house_fill" icon-md="material:home" text="Home"></f7-link>
      <f7-link tab-link="#view-chatgroups" icon-ios="f7:persons_round_fill" icon-aurora="f7:persons_round_fill" icon-md="material:group" text="Groups"></f7-link>
      <f7-link tab-link="#view-settings" icon-ios="f7:gear" icon-aurora="f7:gear" icon-md="material:settings" text="Settings"></f7-link>
    </f7-toolbar>

    <!-- Your main view/tab, should have "view-main" class. It also has "tab-active" class -->
    <f7-view id="view-home" main tab tab-active url="/"></f7-view>

    <!-- Chat Groups View -->
    <f7-view id="view-chatgroups" name="chatgroups" tab url="/chatgroups/"></f7-view>

    <!-- Settings View -->
    <f7-view id="view-settings" name="settings" tab url="/settings/"></f7-view>

  </f7-views>
  <f7-view v-if="!signed_in" url="/signin/" :main="true"> </f7-view> 

    <!-- Popup -->
    <f7-popup id="my-popup">
      <f7-view>
        <f7-page>
          <f7-navbar title="Popup">
            <f7-nav-right>
              <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
          </f7-navbar>
          <f7-block>
            <p>Popup content goes here.</p>
          </f7-block>
        </f7-page>
      </f7-view>
    </f7-popup>

    <f7-login-screen id="my-login-screen">
      <f7-view>
        <f7-page login-screen>
          <f7-login-screen-title>Login</f7-login-screen-title>
          <f7-list form>
            <f7-list-input
              type="text"
              name="username"
              placeholder="Your username"
              v-model:value="username"
            ></f7-list-input>
            <f7-list-input
              type="password"
              name="password"
              placeholder="Your password"
              v-model:value="password"
            ></f7-list-input>
          </f7-list>
          <f7-list>
            <f7-list-button title="Sign In" @click="alertLoginData"></f7-list-button>
            <f7-block-footer>
              Some text about login information.<br>Click "Sign In" to close Login Screen
            </f7-block-footer>
          </f7-list>
        </f7-page>
      </f7-view>
    </f7-login-screen>
  </f7-app>
</template>
<script>
  import firebase from 'firebase';
  import { ref, onMounted } from 'vue';
  import { f7, f7ready } from 'framework7-vue';
  import { getDevice }  from 'framework7/lite-bundle';
  import cordovaApp from '../js/cordova-app.js';

  import routes from '../js/routes.js';
  import store from '../js/store';

  // Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyB0IG7D78nIBi8vytyrk3ALpDTVG6XO3sY",
    authDomain: "whatchat-f732a.firebaseapp.com",
    projectId: "whatchat-f732a",
    storageBucket: "whatchat-f732a.appspot.com",
    messagingSenderId: "44020539208",
    appId: "1:44020539208:web:20c3fae8f7f04879ca9d7d",
    measurementId: "G-XKW3616BXK"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // firebase.analytics();

  export default {
    props: {
      f7router: Object,
    },
    
    setup() {
      const device = getDevice();
      // Framework7 Parameters
      const f7params = {
        name: 'WhatChat', // App name
        theme: 'auto', // Automatic theme detection


        id: 'io.framework7.whatchat', // App bundle ID
        // App store
        store: store,
        // App routes
        routes: routes,


        // Input settings
        input: {
          scrollIntoViewOnFocus: device.cordova && !device.electron,
          scrollIntoViewCentered: device.cordova && !device.electron,
        },
        // Cordova Statusbar settings
        statusbar: {
          iosOverlaysWebView: true,
          androidOverlaysWebView: false,
        },
      };
      // Login screen data
      const username = ref('');
      const password = ref('');

      const alertLoginData = () => {
        f7.dialog.alert('Username: ' + username.value + '<br>Password: ' + password.value, () => {
          f7.loginScreen.close();
        });
      }
      onMounted(() => {
        f7ready(() => {
          // Init cordova APIs (see cordova-app.js)
          if (device.cordova) {
            cordovaApp.init(f7);
          }

          // Call F7 APIs here
        });
      });

      return {
        f7params,
        username,
        password,
        alertLoginData
      }
    },
    computed: {
      signed_in() {
        return this.$store.getters.signed_in;
      },
      photo_url() {
        return this.$store.getters.photo_url;
      },
      display_name() {
        return this.$store.getters.display_name;
      },
      show_tabbar() {
        return this.$store.getters.show_tabbar;
      },
    },
    methods: {
      signOut() {
        this.$store.dispatch('signOut');
      },
      editProfileNavigate() {
        f7.views.main.router.navigate('/editprofile/');
        // Force close left panel after redirect
        f7.panel.close();
      },
    },
  }
</script>