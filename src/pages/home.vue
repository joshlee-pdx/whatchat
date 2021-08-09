<template>
  <f7-page name="home">
    <!-- Top Navbar -->
    <f7-navbar large :sliding="false">
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title sliding>WhatChat</f7-nav-title>
      <f7-nav-right>

        <f7-link href="/requests/">
          <f7-icon f7="persons" >
            <f7-badge color="red" v-if="friend_requests.length>0">{{friend_requests.length}}</f7-badge>
          </f7-icon>
        </f7-link>

        <f7-link icon-f7="person_badge_plus_fill" href="/contacts/">
          
        </f7-link>

      </f7-nav-right>
      <f7-nav-title-large>WhatChat </f7-nav-title-large>
    </f7-navbar>

    <!-- Page content-->
    <f7-list media-list>
      <f7-list-item
        v-for="(friend, index) in friends"
        :key="index"
        :title="friend.name"
      >
        <template #media>
          <img class="small-avatar" :src="friend.photo_url" />
        </template>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<script>
export default {
  computed: {
    friends() {
      return this.$store.getters.friends;
    },
    friend_requests() {
      return this.$store.getters.friend_requests;
    },
  },
  created() {
    this.$store.dispatch('getMyFriends');
    this.$store.dispatch('getMyRequests');
},
}
</script>