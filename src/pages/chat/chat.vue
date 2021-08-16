<template>
  <f7-page>
    <f7-navbar title="Messages" back-link="Back" />

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
      <div class="messages" ref="messages" v-for="(messages,index) in chat_messages" :key="index"> 
        <f7-messages-title><b>{{index}}</b></f7-messages-title>
        <f7-message
          v-for="(message, i) in messages"
          :key="i"
          :type="message.type"
          :image="message.image"
          :name="message.name"
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
      </div>
    </f7-messages>
    <input type="file" ref="file" @change="onFilePicked" style="display:none;" multiple>
  </f7-page>
</template>
<script>
import { f7, f7ready } from "framework7-vue";
import $ from "dom7";

export default {
  props: {
    f7route: Object,
  },
  created() {
    //console.log("f7router friend: ", this.f7route.params.friend);
    let param = decodeURIComponent(this.f7route.params.friend);
    this.frnd = JSON.parse(param);

    //console.log(this.frnd.photo_url);
    this.$store.commit("setShowTabbar", false);
    this.$store.dispatch("getChatMessages", this.frnd);
  },
  data() {
    return {
      attachments: [],
      sheetVisible: false,
      typingMessage: null,
      frnd: null,
      messageText: "",
      
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
    chat_messages() {
      return this.$store.getters.chat_messages;
    },
    images() {
      return this.$store.getters.images;
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
      const previousMessage = self.chat_messages[index - 1];
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
      const nextMessage = self.chat_messages[index + 1];
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
      const nextMessage = self.chat_messages[index + 1];
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

      if(self.attachments.length > 0){
        _.forEach(self.attachments, attachment => {
          self.$store.dispatch('uploadChatImages',attachment).then(url => {
            self.$store.dispatch('sendMessage', {
              friend: self.frnd,
              msg: text,
              img: url,
            })
          })
        })
      } else {
        // Send message
        self.$store.dispatch("sendMessage", {
          friend: self.frnd,
          msg: text,
          img: null,
        });
      }

      // Reset attachments
      self.attachments = [];
      // Hide sheet
      self.sheetVisible = false;
      // Clear area
      self.messageText = "";
      // Focus area
      if (text.length) self.messagebar.focus();

      // Mock response
      // if (self.responseInProgress) return;
      // self.responseInProgress = true;
      // setTimeout(() => {
      //   const answer =
      //     self.answers[Math.floor(Math.random() * self.answers.length)];
      //   const person =
      //     self.people[Math.floor(Math.random() * self.people.length)];
      //   self.typingMessage = {
      //     name: person.name,
      //     avatar: person.avatar,
      //   };
      //   setTimeout(() => {
      //     self.messagesData.push({
      //       text: answer,
      //       type: "received",
      //       name: person.name,
      //       avatar: person.avatar,
      //     });
      //     self.typingMessage = null;
      //     self.responseInProgress = false;
      //   }, 4000);
      // }, 1000);
    },
    launchFilePicker() {
        this.$refs.file.click();
    },
    onFilePicked(event) {
      const self = this;

      // If there is a file at all
      if(event.target.files.length > 0){
        // Return if file is too big
        // if(event.target.files[0]['size'] > 200000) {
        //   this.$store.commit('setAlertMessage', 'The image size is greater than 200KB');
        //   return;
        // }
        // Read the image file 
        this.$store.dispatch('readFileMessage');
      }
    }, // onFilePicked() method close
  }, // End of methods
};
</script>
