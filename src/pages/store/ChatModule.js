import firebase from "firebase";
import _ from "lodash";
import * as db from "./db";

const ChatModule = {
  state: {
    contacts: [],
    friends: [],
    friend_requests: [],
  },
  getters: {
    contacts: (state) => state.contacts,
    friends: (state) => state.friends,
    friend_requests: (state) => state.friend_requests,
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
  },
  actions: {
    getAllUsers({ commit }) {
      var promise = new Promise((resolve, reject) => {
        firebase
          .database()
          .ref("users")
          .on("value", function (snapshot) {
            console.log(snapshot.val());
            commit("setContacts", snapshot.val());
            resolve(snapshot.val());
          });
      });
      return promise;
    },
    sendRequest({ commit }, payload) {
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
    async getMyRequests({ commit, dispatch }) {
      var users = await dispatch("getAllUsers");

      db.firerequest
        .child(firebase.auth().currentUser.uid)
        .on("value", (snapshot) => {
          console.log("getMyRequest: ", snapshot.val());
          var friend_request_id = _.map(snapshot.val(), "sender");
          var user_details = [];

          // console.log("Friend Request ID: ",friend_request_id);
          // console.log("Users: ", users);

          _.forEach(friend_request_id, (uid) => {
            var user = _.find(users, ["uid", uid]);
            user_details.push(user);
          });
          //console.log("user_details", user_details);
          commit("setFriendRequests", user_details);
        });
    },
    deleteRequest({}, payload) {
      var promise = new Promise((resolve,reject) => {
        db.firerequest.child(firebase.auth().currentUser.uid)
        .orderByChild('sender')
        .equalTo(payload.uid)
        .once('value', snapshot => {
          let userKey;

          // Search for the userkey that corresponds to desired request to be deleted
          for(var key in snapshot.val())
            userKey = key;

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
          //console.log("getMyFriends: ", snapshot.val());
          var friends_id = _.map(snapshot.val(), "uid");
          var user_details = [];

          // console.log("Friend Request ID: ",friend_request_id);
          // console.log("Users: ", users);

          _.forEach(friends_id, (uid) => {
            var user = _.find(users, ["uid", uid]);
            user_details.push(user);
          });
          //console.log("user_details", user_details);
          commit("setFriends", user_details);
        });
    },
  }, // End of actions
};

export default ChatModule;
