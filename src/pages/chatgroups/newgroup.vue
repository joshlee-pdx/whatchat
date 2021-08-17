<template>
  <f7-page name="newgroup">
    <f7-navbar title="New group" back-link="Back"></f7-navbar>
    <f7-block-title>About My App</f7-block-title>
    <f7-block>
      <div align="center" class="wrapper">
        <img
          class="image--cover"
          :src="group_image_url"
          alt=""
          @click="launchFilePicker"
        />
      </div>

      <f7-list no-hairlines-md>
      <f7-list-input
        :value="group_name"
        @input="group_name=$event.target.value"
        label="Group Name"
        type="text"
        placeholder="Your group name"
        clear-button
      >
      </f7-list-input>
    </f7-list>
    <f7-button fill @click="createGroup"> Create New Group </f7-button>
    <input type="file" ref="file" @change="onFilePicked" style="display:none;">

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
  data() {
    return {
      group_name: 'New Group',
    }
  },
  created() {
    var url = 'https://i.imgur.com/StvAwWj.png';
    this.$store.commit('setGroupImageURL', url)
  },
  computed: {
    group_image_url() {
      return this.$store.getters.group_image_url;
    },
    files() {
      return this.$store.getters.files;
    },
  },
  methods: {
    launchFilePicker() { 
      this.$refs.file.click(); 
    },
    onFilePicked() {
      // Read the image file 
        this.$store.dispatch('readFile','setGroupImageURL');
    },
    async createGroup() {
      const self = this;
      var group = {};
      group.name =  this.group_name;
      group.pic = this.group_image_url;
      //console.log(group);

       if(this.files) {
         group.pic = await this.$store.dispatch('uploadFile','group_profile/')
       }
      
      self.$store.dispatch('createGroup',group);
      self.$store.commit('setAlertMessage', 'Room creation successful!');
    },
  },
}
</script>