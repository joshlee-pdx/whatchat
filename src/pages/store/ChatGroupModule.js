import firebase from "firebase";
import _ from "lodash";
import * as db from "./db";
import moment from "moment";

const ChatGroupModule = {
  state: {
    chat_groups: null,
    group_members: null,
    group_messages: null
  },
  getters: {
    chat_groups: (state) => state.chat_groups,
    group_members: (state) => state.group_members,
    group_messages: (state) => state.group_messages,
  },
  mutations: {
    setChatGroups(state, payload) {
      state.chat_groups = payload;
    },
    setGroupMembers(state, payload) {
      state.group_members = payload;
    },
    setGroupMessages(state, payload) {
      state.group_messages = payload;
    },
  },
  actions: {
    createGroup({ commit }, group) {
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
    getMyGroups({ commit }) {
      db.firegroups
        .child(firebase.auth().currentUser.uid)
        .once("value", (snapshot) => {
          var mygroups = [];
          if (snapshot.val() != null) {
            var groups = snapshot.val();
            for (var key in groups) {
              var group = {
                name: key,
                pic: groups[key].group_pic,
                owner: groups[key].owner,
                latest_message: groups[key].latest_message
              };
              mygroups.push(group);
            }
          }
          commit("setChatGroups", mygroups);
        });
    },
    getGroupImage({}, group_name) {
      return new Promise((resolve, reject) => {
        db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(group_name)
          .once("value", (snapshot) => {
            var group_pic = snapshot.val().group_pic;
            resolve(group_pic);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    async addMember({ dispatch }, payload) {
      try {
        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .child("members")
          .push(payload.newmember);

        var url = await dispatch("getGroupImage", payload.group_name);
        await db.firegroups
          .child(payload.newmember.uid)
          .child(payload.group_name)
          .set({
            group_pic: url,
            msgboard: "",
            owner: firebase.auth().currentUser.uid,
          });
        dispatch("getGroupMembers", payload.group_name);
      } catch (error) {
        console.log(error);
      }
    },
    async getGroupMembers({ commit }, group_name) {
      var owner = "";
      await db.firegroups
        .child(firebase.auth().currentUser.uid)
        .child(group_name)
        .once("value", (snapshot) => {
          owner = snapshot.val().owner;
        });
      //console.log(owner)

      return new Promise((resolve, reject) => {
        db.firegroups
          .child(owner)
          .child(group_name)
          .once(
            "value",
            (snapshot) => {
              var members = snapshot.val().members;
              //console.log(members)
              var groupmembers = [];
              for (var key in members) {
                groupmembers.push(members[key]);
              }
              resolve(members);
              //console.log("Returning group member list: ", groupmembers);
              commit("setGroupMembers", groupmembers);
            },
            (error) => {
              reject(error);
            }
          );
      });
    },
    async removeMember({ dispatch }, payload) {
      try {
        var member_ref = await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .child("members");
        member_ref
          .orderByChild("uid")
          .equalTo(payload.member.uid)
          .once("value", (snapshot) => {
            let memberkey;
            for (var key in snapshot.val()) memberkey = key;

            member_ref.child(memberkey).remove();
          });

        await db.firegroups
          .child(payload.member.uid)
          .child(payload.group_name)
          .remove();
        await dispatch("getGroupMembers", payload.group_name);
      } catch (error) {
        console.log(error);
      }
    },
    async leaveGroup({ dispatch }, payload) {
      try {
        var owner = "";
        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .once("value", (snapshot) => {
            owner = snapshot.val().owner;
          });

        var member_ref = await db.firegroups
          .child(owner)
          .child(payload.group_name)
          .child("members");
        member_ref
          .orderByChild("uid")
          .equalTo(firebase.auth().currentUser.uid)
          .once("value", (snapshot) => {
            let memberkey;
            for (var key in snapshot.val()) memberkey = key;

            member_ref.child(memberkey).remove();
          });

        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .remove();
        //await dispatch("getGroupMembers", payload.group_name);
      } catch (error) {
        console.log(error);
      }
    },
    async sendGroupMessage({dispatch}, payload) {
      try {
        //console.log('Payload just arrived in sendGroupMessage: ',payload)
        var owner ='';
        // Get owner uid
        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .once("value", (snapshot) => {
            owner = snapshot.val().owner;
          });

        //console.log('Owner found: ',owner)
        // Push message to self
        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .child("msgboard")
          .push({
            sentby: firebase.auth().currentUser.uid,
            displayName: firebase.auth().currentUser.displayName,
            avatar: firebase.auth().currentUser.photoURL,
            image: payload.image,
            text: payload.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
          });
        //console.log("Push to self complete. . .")
        // Push message to owner if not the owner
        if (firebase.auth().currentUser.uid != owner) {
          db.firegroups
            .child(owner)
            .child(payload.group_name)
            .child("msgboard")
            .push({
              sentby: firebase.auth().currentUser.uid,
              displayName: firebase.auth().currentUser.displayName,
              avatar: firebase.auth().currentUser.photoURL,
              image: payload.image,
              text: payload.message,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
            });
            //console.log("Push to owner complete. . .")
        }
        

        // Send message to other members
        var members = await dispatch("getGroupMembers", payload.group_name);
        _.forEach(members, (member) => {
          if (firebase.auth().currentUser.uid != member.uid) {
            db.firegroups
              .child(member.uid)
              .child(payload.group_name)
              .child("msgboard")
              .push({
                sentby: firebase.auth().currentUser.uid,
                displayName: firebase.auth().currentUser.displayName,
                avatar: firebase.auth().currentUser.photoURL,
                image: payload.image,
                text: payload.message,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
              });
          }
          //console.log("Push to others complete. . .")
        });
      } catch (error) {
        console.log(error.msg)
      }
    },
    getGroupMessages({commit}, payload) {
      var current_user = firebase.auth().currentUser;
      db.firegroups.child(current_user.uid).child(payload).child('msgboard').on('value', snapshot => {
        var messages = snapshot.val()
        var group_messages = [];
        _.forEach(messages, message => {
          message.type = message.sentby == current_user.uid ? "sent": "received";
          //message.name = message.sentby == current_user.uid ? current_user.displayName: "friend_name";
          message.date = moment(message.TIMESTAMP).format("MMMM Do dddd");
          group_messages.push(message)
        })
        //console.log('group messages',group_messages)
        commit('setGroupMessages', group_messages)
      }, error => {
        console.log(error)
      })
    },
    async sendLatestGroupMessage({dispatch}, payload) {
      try {
        var latest_message = payload.image == null? payload.message: 'image file'
        var owner ='';
        // Get owner uid
        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .once("value", (snapshot) => {
            owner = snapshot.val().owner;
          });

        //console.log('Owner found: ',owner)
        // Push message to self
        await db.firegroups
          .child(firebase.auth().currentUser.uid)
          .child(payload.group_name)
          .update({
            latest_message: latest_message
          })
          
        //console.log("Push to self complete. . .")
        // Push message to owner if not the owner
        if (firebase.auth().currentUser.uid != owner) {
          db.firegroups
            .child(owner)
            .child(payload.group_name)
            .update({
              latest_message: latest_message
            })
            //console.log("Push to owner complete. . .")
        }

        // Send message to other members
        var members = await dispatch("getGroupMembers", payload.group_name);
        _.forEach(members, (member) => {
          if (firebase.auth().currentUser.uid != member.uid) {
            db.firegroups
              .child(member.uid)
              .child(payload.group_name)
              .update({
                latest_message: latest_message
              })
          }
          //console.log("Push to others complete. . .")
        });
      } catch (error) {
        console.log(error.msg)
      }
    },
  }, // End of actions
};

export default ChatGroupModule;
