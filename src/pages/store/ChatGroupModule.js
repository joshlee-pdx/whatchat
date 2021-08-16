import firebase from "firebase";
import _ from "lodash";
import * as db from "./db";
import moment from "moment";

const ChatGroupModule = {
  state: {
    chat_groups:null,
  },
  getters: {
    chat_groups:state => state.chat_groups,
  },
  mutations: {
    setChatGroups(state,payload) {
      state.chat_groups = payload;
    }
  },
  actions: {
    createGroup({commit}, group) {
      return new Promise((resolve, reject) => {
        db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(group.name)
          .set({
            group_pic: group.pic,
            msgboard: "",
            owner: firebase.auth().currentUser.uid,
          })
          .then((data) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getMyGroups({commit}) {
      db.firegroups.child(firebase.auth().currentUser.uid)
      .once('value', snapshot => {
        var mygroups = [];
        if(snapshot.val() != null) {
          var groups = snapshot.val();
          for(var key in groups) {
            var group = {
              name:key,
              pic:groups[key].group_pic,
              owned:groups[key].owner
            };
            mygroups.push(group);
          }
        }
        commit('setChatGroups',mygroups)
      })
    },
  }, // End of actions
};

export default ChatGroupModule;
