import firebase from "firebase";
import _ from "lodash";
import * as db from "./db";
import moment from 'moment';

const ChatModule = {
  state: {
    contacts: [],
    friends: [],
    friend_requests: [],
    chat_messages: []
  },
  getters: {
    contacts: (state) => state.contacts,
    friends: (state) => state.friends,
    friend_requests: (state) => state.friend_requests,
    chat_messages: (state) => state.chat_messages,
  },
  mutations: {
    setContacts(state, payload) {
      state.contacts = payload;
    },
    setFriends(state, payload) {
      state.friends = payload;
    },
    setFriendRequests(state, payload) {
      state.friend_requests = payload;
    },
    setChatMessages(state, payload) {
      state.chat_messages = payload;
    },
  },
  actions: {
    // Retrieve all users from firebase
    getAllUsers({ commit }) {
      var promise = new Promise((resolve, reject) => {
        firebase
          .database()
          .ref("users")
          .on("value", function (snapshot) {
            //console.log(snapshot.val());
            commit("setContacts", snapshot.val());
            resolve(snapshot.val());
          });
      });
      return promise;
    },
    sendRequest({ commit }, payload) {
      // Send request via pushing sender uid to recipient
      var promise = new Promise((resolve, reject) => {
        db.firerequest
          .child(payload.recipient)
          .push({ sender: payload.sender })
          .then(() => {
            resolve({ success: true });
          })
          .catch((error) => {
            reject(error);
          });
      });
      return promise;
    },
    // Get all requests for the current user
    async getMyRequests({ commit, dispatch }) {
      // Retrieve all users from firebase
      var users = await dispatch("getAllUsers");

      // Find requests for current user
      db.firerequest
        .child(firebase.auth().currentUser.uid)
        .on("value", (snapshot) => {
          //console.log("getMyRequest: ", snapshot.val());
          var friend_request_id = _.map(snapshot.val(), "sender");
          var user_details = [];

          // console.log("Friend Request ID: ",friend_request_id);
          // console.log("Users: ", users);

          // Check if friend has a request with user, if so add it to list
          _.forEach(friend_request_id, (uid) => {
            var user = _.find(users, ["uid", uid]);
            user_details.push(user);
          });
          //console.log("user_details", user_details);

          // Set list of friend requests for current user 
          commit("setFriendRequests", user_details);
        });
    },
    deleteRequest({}, payload) {
      // Delete request with desired uid from user
      var promise = new Promise((resolve,reject) => {
        db.firerequest.child(firebase.auth().currentUser.uid)
        .orderByChild('sender')
        .equalTo(payload.uid)
        .once('value', snapshot => {
          let userKey;

          // Search for the userkey that corresponds to desired request to be deleted
          for(var key in snapshot.val())
            userKey = key;

          // Remove request from the sender uid too
          db.firerequest.child(firebase.auth().currentUser.uid)
          .child(userKey)
          .remove()
          .then(() => {
            resolve(true);
          })
          .catch(error => {
            reject(error);
          });
        }).catch(error => {
          reject(error);
        });
      });
      return promise;
    },
    confirmRequest({dispatch}, payload) {
      var promise = new Promise((resolve,reject) => {
        // Push friend's uid to us
        db.firefriends.child(firebase.auth().currentUser.uid)
        .push({uid:payload.uid})
        .then(() => {
          // Push our uid to friend's
          db.firefriends.child(payload.uid)
          .push({uid:firebase.auth().currentUser.uid})
        })
        .then(() => {
          // delete friend request since friended
          dispatch('deleteRequest',payload).then(() => {
            resolve(true);
          })
        })
        .catch(error => {
          reject(error);
        });
      });
      return promise;
    },
    async getMyFriends({ commit, dispatch }) {
      var users = await dispatch("getAllUsers");

      db.firefriends
        .child(firebase.auth().currentUser.uid)
        .on("value", (snapshot) => {
          var friends = snapshot.val();
          var user_details = [];

          _.forEach(friends,(friend,key) => {
            var user = _.find(users, ["uid", friend.uid]);
            if(friend.latest_message) {
              user.latest_message = friend.latest_message;
            } else {
              user.latest_message = '';
            }
            user.friend_key = key;
            user_details.push(user);
          })

          commit("setFriends", user_details);
        });
    },
    async sendMessage({dispatch},payload) {
      var userkey = await dispatch('getUserKey',payload);
      var friend_info = payload;
      friend_info.userkey = userkey;

      dispatch('sendLatestMessage', friend_info);
      try {
        // Push the message being sent to recipient uid to firebase
        await db.firechats.child(firebase.auth().currentUser.uid)
        .child(payload.friend.uid)
        .push({
          sentby:firebase.auth().currentUser.uid,
          text:payload.msg,
          image:payload.img,
          timestamp:firebase.database.ServerValue.TIMESTAMP
        });

        // Push the message being sent to sender uid as well to firebase
        await db.firechats.child(payload.friend.uid)
        .child(firebase.auth().currentUser.uid)
        .push({
          sentby:firebase.auth().currentUser.uid,
          text:payload.msg,
          image:payload.img,
          timestamp:firebase.database.ServerValue.TIMESTAMP
        });
      } catch (error) {
        console.log(error);
      }
    },
    getChatMessages({commit}, payload) {
      // Get current user
      var current_user = firebase.auth().currentUser
      
      // Get chat history for current user with friend uid passed in via payload
      db.firechats.child(current_user.uid).child(payload.uid).on('value',snapshot => {
        var messages = snapshot.val(); // store messages
        // Set type, name, avatar, and date per message depending on who sent the message
        _.forEach(messages, message => {
          message.type = message.sentby == current_user.uid? 'sent':'received';
          message.name = message.sentby == current_user.uid? current_user.displayName:payload.name;
          message.avatar = message.sentby == current_user.uid? current_user.photoURL:payload.photo_url.replace("profile/","profile%2F");
          message.date = moment(message.timestamp).format("MMMM Do dddd");
        })
        var groupedmessages = _.groupBy(messages, 'date');
        commit('setChatMessages', groupedmessages);
        //commit('setChatMessages',messages);
      })
    },
    getUserKey({}, payload){
      return new Promise((resolve,reject) => {
        var friend_id = payload.friend.uid;
        db.firefriends.child(friend_id).orderByChild("uid")
        .equalTo(firebase.auth().currentUser.uid)
        .once('value', snapshot => {
          let userkey;
          for(var key in snapshot.val()) userkey = key;
          resolve(userkey)
        })
        .catch(error => {
          reject(error);
        });
      });
    },
    async sendLatestMessage({}, payload) {
      var user_id = firebase.auth().currentUser.uid;
      var user_key = payload.userkey;
      var friend_id = payload.friend.uid;
      var friend_key = payload.friend.friend_key;

      var latest_message = '';
      if (payload.img != null) {
        latest_message = 'photo';
      } else {
        latest_message = payload.msg;
      }

      try {
        // Update latest message on current user id
        await db.firefriends.child(user_id)
        .child(friend_key)
        .update({
          latest_message: latest_message
        });

        // Update latest message on friend uid
        await db.firefriends.child(friend_id)
        .child(user_key)
        .update({
          latest_message: latest_message
        });
      } catch (error) {
        console.log(error.msg);
      }
    },
  }, // End of actions
};

export default ChatModule;
