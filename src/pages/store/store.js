// import Vue from 'vue'
import { createStore } from 'vuex';
import AuthModule from './AuthModule';
import FileModule from './FileModule';
import ChatModule from './ChatModule';

//store.registerModule('./FileModule.js', FileModule);

 export default createStore({
   modules:{
    auth: AuthModule,
    file: FileModule,
    chat: ChatModule,
   },
   state: {
    alert_message: null,
    show_tabbar: true,
   },
   getters: {
    alert_message:state => state.alert_message,
    show_tabbar:state => state.show_tabbar,
   },
   mutations: {
    setAlertMessage(state,payload) {
      state.alert_message = payload
    },
    setShowTabbar(state,payload) {
      state.show_tabbar = payload
    }
   }
})
