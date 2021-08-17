<template>
  <f7-page name="groupinfo">
    <f7-navbar title="Group info" back-link="Back"></f7-navbar>
    <f7-block-title v-if="this.group_members != null && this.group_members.length>0">{{this.group_members.length}} member{{this.group_members.length>1?'s':' '}}</f7-block-title>
    <f7-block-title v-else>No members here. . </f7-block-title>
    <f7-block>
      <f7-list media-list>
        <f7-list-item
          v-for="(member, index) in group_members"
          :key="index"
          :title="member.name"
        >
          <template #media>
            <img class="small-avatar" :src="member.photo_url" />
          </template>
        
        </f7-list-item>
      </f7-list>
    </f7-block>
  </f7-page>
</template>

<script>
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
    group_members() {
      return this.$store.getters.group_members;
    },
  },
  created() {
    this.group_name = this.f7route.params.group_name;
    this.$store.dispatch("getGroupMembers", this.group_name);
    //console.log(this.group_name)
  },
}
</script>