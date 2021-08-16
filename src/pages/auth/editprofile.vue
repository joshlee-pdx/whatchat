<template>
  <f7-page name="editprofile">
    <f7-navbar title="Edit Profile" back-link="Back"></f7-navbar>
    <div align="center" class="wrapper">
      <img class="image--cover" :src="image_url" alt="" @click="launchFilePicker"/>
    </div>
    <f7-list no-hairlines-md>
      <f7-list-input
        :value="display_name"
        @input="display_name=$event.target.value"
        label="Display name"
        type="text"
        placeholder="Your display name"
        clear-button
      >
      </f7-list-input>
    </f7-list>
    <f7-block>
      <f7-button outline @click="updateProfile" round>Update profile</f7-button>
      <input type="file" ref="file" @change="onFilePicked" style="display:none;">
    </f7-block>

  </f7-page>
</template>

<script>
import { mixin } from '../../js/mixin';
import firebase from 'firebase';

export default {
  // Add mixin for custom toast and alert messages 
  mixins: [ mixin ],
  props: {
    f7router: Object,
  },
  computed:{
    image_url() {
      return this.$store.getters.image_url;
    },
    files() {
      return this.$store.getters.files;
    },
    photo_url() {
      return this.$store.getters.photo_url;
    },
    display_name: {
      get: function() {
        return this.$store.getters.display_name;
      },
      set: function(newValue) {
        this.$store.commit('setDisplayName', newValue);
      }
    },
  }, // End of Computed 
  methods:{
    launchFilePicker() {
        this.$refs.file.click()
    },

    onFilePicked(event) {
      // If there is a file at all
      if(event.target.files.length > 0){
        // Return if file is too big
        if(event.target.files[0]['size'] > 200000) {
          this.$store.commit('setAlertMessage', 'The image size is greater than 200KB');
          return;
        }

        // Read the image file 
        this.$store.dispatch('readFile','setImageURL')
      }
    }, // onFilePicked() method close
      
    updateProfile() {
      const self = this;

      // Check if proper name size
      if(this.display_name == null || this.display_name.length < 3){
        this.$store.commit('setAlertMessage', "Name must be at least 3 characters long.");
        return;
      }
      
      // Get Current user
      var user = firebase.auth().currentUser;

      // If user is changing their profile picture
      if (self.files) {

        // Check to see if there is a photo to upload
        if(this.photo_url != null) {
          // Get URL for old photo then delete it
          var storage = firebase.storage();
          var httpReference = storage.refFromURL(this.photo_url);
          httpReference.delete().then(() => {

          }).catch(error =>{
            console.log(error);
          });
        }
        // Upload the new photo and update user name
        self.$store.dispatch('uploadFile','profile/').then(url => {
          user.updateProfile({
            displayName: self.display_name,
            photoURL: url,
          }).then(function() {
            self.$store.commit('setPhotoURL', user.photoURL);
            self.$store.commit('setDisplayName', user.displayName);
            firebase.database().ref('users/'+user.uid).update({
              photo_url: user.photoURL,
              name: user.displayName,
            });
            // Profile update success message
            self.$store.commit('setAlertMessage', "Profile successfully updated!");
          }).catch(error => {
            console.log(error);
          });
        });
      } else { // No photo to upload only display name change
        user.updateProfile({
          displayName: self.display_name,
        }).then(function() {
          firebase.database().ref('users/'+user.uid).update({
              name: user.displayName,
          });
          self.$store.commit('setDisplayName', user.displayName);
          // Profile update success message
          self.$store.commit('setAlertMessage', "Profile successfully updated!");
        }); 
      }
    },
  }, // End of methods
  created() {
    if(this.photo_url != null){
      this.$store.commit('setImageURL', this.photo_url);
    }

    this.$store.commit('setShowTabbar',false);
  },
}
</script>