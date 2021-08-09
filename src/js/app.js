// Import Vue
import { createApp, defineComponent } from 'vue';

// Import Framework7
import Framework7 from 'framework7/lite-bundle';

// Import Framework7-Vue Plugin
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';

// Import Framework7 Styles
import 'framework7/framework7-bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';

// Import App Component
import App from '../components/app.vue';
import store from '../pages/store/store';
import firebase from 'firebase';
import lodash from 'lodash';

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue, lodash);

let newApp = null;

firebase.auth().onAuthStateChanged(function(user) {
  if(user && user.emailVerified) {
    // User is signed in
    store.commit('setSignedIn', true);
    store.commit('setDisplayName', user.displayName);
    store.commit('setPhotoURL', user.photoURL);
  } else {
    // No user is signed in
    store.commit('setSignedIn', false);
  }

  if(!newApp) {
    newApp = createApp(App);
    newApp.use(store);
    registerComponents(newApp);
    newApp.mount('#app');
  }
});


// Init App
//const app = createApp(App);

// Use store
//app.use(store)

// Register Framework7 Vue components
//registerComponents(app);

// Mount the app using VueRouter
//app.mount('#app');