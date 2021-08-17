<template>
  <f7-page name="addmembers">
    <f7-navbar title="Add Members" back-link="Back"></f7-navbar>
    <f7-block-title>Add Members</f7-block-title>
    <f7-list media-list>
      <f7-list-item
        swipeout
        v-for="(member, index) in p_members"
        :key="index"
        :title="member.name"
      >
        <template #media>
          <img class="small-avatar" :src="member.photo_url" />
        </template>
        <f7-swipeout-actions right>
          <f7-swipeout-button color="green" @click="addMember(member)"
            >Add</f7-swipeout-button
          >
        </f7-swipeout-actions>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    f7route: Object,
  },
  data() {
    return {
      group_name: null,
    };
  },
  computed: {
    p_members() {
      const self = this;
      var friends = [...this.$store.getters.friends];

      _.forEach(self.group_members, function(member) {
        const index = _.findIndex(friends,member)
        friends.splice(index,1)
      })
      return friends;
    },
    group_members() {
      return this.$store.getters.group_members;
    },
  },
  async created() {
    this.group_name = this.f7route.params.group_name;
    this.$store.dispatch('getGroupMembers', this.group_name);
  },
  methods: {
    addMember(member) {
      var payload = {};
      payload.newmember = member;
      payload.group_name = this.group_name;
      this.$store.dispatch('addMember', payload);
    }
  },
};
</script>