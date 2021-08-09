import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css';

export const mixin = {
  computed:{
    alert_message() {
      return this.$store.getters.alert_message;
    }
  },
  watch:{
    alert_message(value) {
      const self = this
      if(value == null)
        return;

      this.showToast(value)
       setTimeout(() => {
         self.$store.commit('setAlertMessage',null);
       },5000);
    }
  },
  methods:{
    showToast(text) {
      const self = this;
      let toast_title = "Error";
      let toast_type = "danger";
      let toast_position = 'top-center';
      //let message_str = "Invalid input.";
      
      // Get rid of quote marks
      var text_to_string = new String(text).replaceAll("^\"|\"$", "");;
    
      // Change toast to success type for "desired" actions being completed
      // NOTE: In future just send toast type/title code as params + text
      if(text.includes('verification email') || text.includes('success') || 
        text.includes('Reset') || text.includes('Welcome')){
        toast_title = "Success";
        toast_type = "success";

        if(text.includes('success'))
          toast_position = 'bottom-center';
      }   
      
      // Create toast
      createToast(
        {title: toast_title, description: text_to_string}, 
        {
          type: toast_type,
          position: toast_position,
        }
      )
    },
  }
}