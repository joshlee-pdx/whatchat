<template>
  <f7-page name="chatgroups" @page:beforein="init">
    <f7-navbar title="Chat groups"></f7-navbar>
    <f7-block-title>About My App</f7-block-title>
    <f7-block>
      <f7-link href="/newgroup/"> Create Group </f7-link>
      <f7-list media-list>
      <f7-list-item
        v-for="(group, index) in chat_groups"
        :key="index"
        :title="group.name"
        :text="group.latest_message"
        @click='gotoGroup(group)'
      >
        <template #media>
          <img class="small-avatar" :src="group.pic" />
        </template>
      </f7-list-item>
    </f7-list>
    </f7-block>
    
  </f7-page>
</template>

<script>
import { mixin } from '../../js/mixin';

export default {
  mixins: [ mixin ],
  props: {
    f7router: Object,
  },
  created() {
    this.init();
  },
  computed: {
    chat_groups() {
      return this.$store.getters.chat_groups;
    }
  },
  methods: {
    init() {
      this.$store.commit('setShowTabbar',true);
      this.$store.dispatch('getMyGroups');
    },
    gotoGroup(group) {
      var groupstring = JSON.stringify(group);
      this.f7router.navigate('/chatgroup/'+encodeURIComponent(groupstring));
    }
  },
}
</script>