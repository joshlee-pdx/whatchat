<template>
  <f7-page>
    <f7-navbar title="Messages" back-link="Back">
      <f7-nav-right>
        <f7-link icon-f7="ellipsis_vertical" actions-open="#groupOptions" />
      </f7-nav-right>
    </f7-navbar>

    <!-- Group Owner Action Sheet -->
    <f7-actions v-if="this.user_uid == this.chatgroup.owner" id="groupOptions">
      <f7-actions-group>
        <f7-actions-label>Group Options</f7-actions-label>
        <f7-actions-button bold @click="goto(`/addmembers/${chatgroup.name}`)"
          >Add Members</f7-actions-button
        >
        <f7-actions-button @click="goto(`/groupmembers/${chatgroup.name}`)"
          >Group Info</f7-actions-button
        >
        <f7-actions-button color="red">Delete Group</f7-actions-button>
      </f7-actions-group>
    </f7-actions>

    <!-- Group Member Action Sheet -->
    <f7-actions v-else id="groupOptions">
      <f7-actions-group>
        <f7-actions-label>Group Options</f7-actions-label>
        <f7-actions-button @click="goto(`/groupinfo/${chatgroup.name}`)"
          >Group Info</f7-actions-button
        >
        <f7-actions-button color="red" @click="leaveGroup"
          >Leave Group</f7-actions-button
        >
      </f7-actions-group>
    </f7-actions>

    <f7-messagebar
      ref="messagebar"
      v-model:value="messageText"
      :placeholder="placeholder"
      :attachments-visible="attachmentsVisible"
      :sheet-visible="sheetVisible"
    >
      <template #inner-start>
        <f7-link
          icon-ios="f7:folder_fill"
          icon-aurora="f7:folder_fill"
          icon-md="material:folder"
          @click="launchFilePicker"
        />
        <f7-link
          icon-ios="f7:camera_fill"
          icon-aurora="f7:camera_fill"
          icon-md="material:camera_alt"
          @click="sheetVisible = !sheetVisible"
        />
      </template>
      <template #inner-end>
        <f7-link
          icon-ios="f7:arrow_up_circle_fill"
          icon-aurora="f7:arrow_up_circle_fill"
          icon-md="material:send"
          @click="sendMessage"
        />
      </template>
      <f7-messagebar-attachments>
        <f7-messagebar-attachment
          v-for="(image, index) in attachments"
          :key="index"
          :image="image"
          @attachment:delete="deleteAttachment(image)"
        ></f7-messagebar-attachment>
      </f7-messagebar-attachments>
      <f7-messagebar-sheet>
        <f7-messagebar-sheet-image
          v-for="(image, index) in images"
          :key="index"
          :image="image"
          :checked="attachments.indexOf(image) >= 0"
          @change="handleAttachment"
        ></f7-messagebar-sheet-image>
      </f7-messagebar-sheet>
    </f7-messagebar>

    <f7-messages>
      <f7-messages-title><b>Sunday, Feb 9,</b> 12:58</f7-messages-title>
      <f7-message
        v-for="(message, index) in group_messages"
        :key="index"
        :type="message.type"
        :image="message.image"
        :name="message.displayName"
        :avatar="message.avatar"
        :first="isFirstMessage(message, index)"
        :last="isLastMessage(message, index)"
        :tail="isTailMessage(message, index)"
      >
        <template #text>
          <!-- eslint-disable-next-line -->
          <span v-if="message.text" v-html="message.text"></span>
        </template>
      </f7-message>
      <f7-message
        v-if="typingMessage"
        type="received"
        :typing="true"
        :first="true"
        :last="true"
        :tail="true"
        :header="`${typingMessage.name} is typing`"
        :avatar="typingMessage.avatar"
      ></f7-message>
    </f7-messages>
    <input
      type="file"
      ref="file"
      @change="onFilePicked"
      style="display: none"
      multiple
    />
  </f7-page>
</template>
<script>
import { f7, f7ready } from "framework7-vue";
import $ from "dom7";
import firebase from "firebase";

export default {
  props: {
    f7router: Object,
    f7route: Object,
  },
  created() {
    //console.log("f7router friend: ", this.f7route.params.friend);
    this.user_uid = firebase.auth().currentUser.uid;
    let param = decodeURIComponent(this.f7route.params.group);
    this.chatgroup = JSON.parse(param);

    this.$store.commit("setShowTabbar", false);
    this.$store.dispatch("getGroupMessages", this.chatgroup.name);
  },
  data() {
    return {
      user_uid: null,
      chatgroup: [],
      attachments: [],
      sheetVisible: false,
      typingMessage: null,
      messageText: "",
      messagesData: [],
      responseInProgress: false,
    };
  },
  computed: {
    attachmentsVisible() {
      const self = this;
      return self.attachments.length > 0;
    },
    placeholder() {
      const self = this;
      return self.attachments.length > 0 ? "Add comment or Send" : "Message";
    },
    images() {
      return this.$store.getters.images;
    },
    group_messages() {
      return this.$store.getters.group_messages;
    },
  },
  mounted() {
    const self = this;
    f7ready(() => {
      self.messagebar = f7.messagebar.get(self.$refs.messagebar.$el);
    });
  },
  methods: {
    isFirstMessage(message, index) {
      const self = this;
      const previousMessage = self.messagesData[index - 1];
      if (message.isTitle) return false;
      if (
        !previousMessage ||
        previousMessage.type !== message.type ||
        previousMessage.name !== message.name
      )
        return true;
      return false;
    },
    isLastMessage(message, index) {
      const self = this;
      const nextMessage = self.messagesData[index + 1];
      if (message.isTitle) return false;
      if (
        !nextMessage ||
        nextMessage.type !== message.type ||
        nextMessage.name !== message.name
      )
        return true;
      return false;
    },
    isTailMessage(message, index) {
      const self = this;
      const nextMessage = self.messagesData[index + 1];
      if (message.isTitle) return false;
      if (
        !nextMessage ||
        nextMessage.type !== message.type ||
        nextMessage.name !== message.name
      )
        return true;
      return false;
    },
    deleteAttachment(image) {
      const self = this;
      const index = self.attachments.indexOf(image);
      self.attachments.splice(index, 1)[0]; // eslint-disable-line
    },
    handleAttachment(e) {
      const self = this;
      const index = $(e.target).parents("label.checkbox").index();
      const image = self.images[index];
      if (e.target.checked) {
        // Add to attachments
        self.attachments.unshift(image);
      } else {
        // Remove from attachments
        self.attachments.splice(self.attachments.indexOf(image), 1);
      }
    },
    sendMessage() {
      const self = this;
      const text = self.messageText.replace(/\n/g, "<br>").trim();
      const messagesToSend = [];
      self.attachments.forEach((attachment) => {
        messagesToSend.push({
          image: attachment,
        });
      });
      if (text.length) {
        messagesToSend.push({
          text,
        });
      }
      if (messagesToSend.length === 0) {
        return;
      }

      if (self.attachments.length > 0) {
        _.forEach(self.attachments, (attachment) => {
          self.$store.dispatch("uploadChatImages", attachment).then((url) => {
            var payload = {
              group_name: self.chatgroup.name,
              message: text,
              image: url,
            };

            self.$store.dispatch("sendGroupMessage", payload);
            self.$store.dispatch("sendLatestGroupMessage", payload);
          });
        });
      } else {
        var payload = {
          group_name: self.chatgroup.name,
          message: text,
          image: null,
        };
        // Send message
        self.$store.dispatch("sendGroupMessage", payload);
        self.$store.dispatch("sendLatestGroupMessage", payload);
      }

      //self.$store.dispatch("sendGroupMessage", payload);

      // Reset attachments
      self.attachments = [];
      // Hide sheet
      self.sheetVisible = false;
      // Clear area
      self.messageText = "";
      // Focus area
      if (text.length) self.messagebar.focus();
      // Send message
      self.messagesData.push(...messagesToSend);
    },
    goto(page) {
      this.f7router.navigate(page);
    },
    leaveGroup() {
      var payload = {};
      payload.group_name = this.chatgroup.name;
      this.$store.dispatch("leaveGroup", payload);
    },
    launchFilePicker() {
      this.$refs.file.click();
    },
    onFilePicked(event) {
      const self = this;

      // If there is a file at all
      if (event.target.files.length > 0) {
        // Return if file is too big
        // if(event.target.files[0]['size'] > 200000) {
        //   this.$store.commit('setAlertMessage', 'The image size is greater than 200KB');
        //   return;
        // }
        // Read the image file
        this.$store.dispatch("readFileMessage");
      }
    }, // onFilePicked() method close
  },
};
</script>