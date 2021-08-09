<template>
  <f7-page name="requests">
    <f7-navbar title="Requests" back-link="Back"></f7-navbar>
    <f7-block-title>Friend Requests</f7-block-title>
    <f7-list media-list>
      <f7-list-item
        swipeout
        v-for="(request, index) in friend_requests"
        :key="index"
        :title="request.name"
      >
        <template #media>
          <img class="small-avatar" :src="request.photo_url" />
        </template>
        <f7-swipeout-actions right>
          <f7-swipeout-button color="green" @click="confirm(request)"
            >Confirm</f7-swipeout-button
          >
          <f7-swipeout-button color="red" @click="remove(request)"
            >Delete</f7-swipeout-button
          >
        </f7-swipeout-actions>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<script>
import "../../css/contacts.css";

export default {
  created() {
    this.$store.dispatch("getMyRequests");
  },
  computed: {
    friend_requests() {
      return this.$store.getters.friend_requests;
    },
  },
  methods: {
    confirm(request) {
      this.$store.dispatch('confirmRequest', request);
    },
    remove(request) {
      this.$store.dispatch('deleteRequest', request);
    },
  },
};
</script>
