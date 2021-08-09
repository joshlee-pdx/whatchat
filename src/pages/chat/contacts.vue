<template>
  <f7-page name="contacts">
    <f7-navbar title="Contacts" back-link="Back"></f7-navbar>
    <f7-list media-list>
      <f7-list-item
        swipeout
        v-for="(contact, index) in contacts"
        :key="index"
        :title="contact.name"
      >
        <template #media>
          <img class="small-avatar" :src="contact.photo_url"/>
        </template>
        <f7-swipeout-actions right>
          <f7-swipeout-button
            color="green"
            @click="addFriend(contact)"
            >Add</f7-swipeout-button
          >
        </f7-swipeout-actions>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<script>
import '../../css/contacts.css';
import firebase from 'firebase';

export default {
  computed: {
    contacts() {
      return this.$store.getters.contacts;
    },
  },
  created() {
    this.$store.dispatch("getAllUsers");
  },
  methods: {
    addFriend(friend) {
      var request = {};
      request.sender = firebase.auth().currentUser.uid;
      request.recipient = friend.uid;

      console.log('Request', request);

      this.$store.dispatch('sendRequest', request);
    },
  },
};
</script>