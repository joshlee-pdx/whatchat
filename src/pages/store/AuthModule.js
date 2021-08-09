import firebase from 'firebase';

const AuthModule = {
  state:{
    signed_up: false,
    signed_in: false,
    show_resend_email: false,
    photo_url: null,
    display_name: null,
  },
  getters: {
    signed_up: state => state.signed_up,
    signed_in: state => state.signed_in,
    show_resend_email: state => state.show_resend_email,
    photo_url: state => state.photo_url,
    display_name: state => state.display_name,
  },
  mutations: {
    setSignedUp(state, payload){
      state.signed_up = payload;
    },
    setSignedIn(state, payload){
      state.signed_in = payload;
    },
    setShowResendEmail(state, payload){
      state.show_resend_email = payload;
    },
    setPhotoURL(state, payload){
      state.photo_url = payload;
    },  
    setDisplayName(state, payload){
      state.display_name = payload;
    },    
  },
  actions: {
    signIn({commit}, payload) {
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
      .then(user => {
        // Logged In
        firebase.auth().onAuthStateChanged(function(user){
          if(user && user.emailVerified){
            commit('setAlertMessage', "Welcome " + user.displayName);
            commit('setSignedIn', true);
            commit('setShowResendEmail', false);
          } else {
            commit('setSignedIn', false);
            commit('setAlertMessage', "Please verify account with email");
            commit('setShowResendEmail', true);
          }
        });
      })
      .catch(function(error){
        // Handle Errors here.
        commit('setAlertMessage', error.message);
      });
    },
    signUp({commit, dispatch},payload) {
      // Create user with email and password
      firebase.auth().createUserWithEmailAndPassword(payload.email,payload.password)
      .then(data => { // Then record the data in real time to firebase database
        firebase.database().ref('users').child(data.user.uid).set({
          uid: data.user.uid,
          name: payload.name,
          email: payload.email,
          emailverified: false,
          photo_url: payload.photoURL,
        });

        // After all data has been set, update profile
        let newuser = data.user;
        newuser.updateProfile({
          displayName: payload.name,
          photoURL: payload.photoURL,
        })
        .then(() => {
          // Send Verification email
          dispatch('sendVerification');

          // Change user signed up status to true and display alert message upon success
          console.log('Updated Profile');
          commit('setSignedUp', true);
        })
      }).catch(err => {
        // Log error and display failure message upon failure
        console.log(err.message);
        commit('setAlertMessage', err.message);
      });
    },
    signOut({commit}) {
      firebase.auth().signOut().then(() => {
        commit('setSignedIn', false);
      });
    }, 
    sendVerification({commit}) {
      var user = firebase.auth().currentUser;

      // Attempt to send user a verification email
      user.sendEmailVerification()
        .then(function() {
          // Email Sent.
          commit('setAlertMessage', `A verification email has been sent to ${user.email}.`);
        })
        .catch(function(error){
          // An error happened
          commit('setAlertMessage', error.message);
        });
    },
  },
}

export default AuthModule