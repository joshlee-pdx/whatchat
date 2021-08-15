import firebase from 'firebase';

const FileModule = {
  state: {
    image_url:'https://www.seekpng.com/png/detail/966-9665493_my-profile-icon-blank-profile-image-circle.png',
    files: null,
    images: [],
  },
  getters: {
    image_url: state => state.image_url,
    files: state => state.files,
    images: state => state.images,
  },
  mutations: {
    setImageURL(state,payload){
      state.image_url = payload;
    },
    setFiles(state,payload){
      state.files = payload;
    },
    setImages(state,payload){
      state.images = payload;
    }
  },
  actions: {
    readFile({commit}) {
      const files = event.target.files;
      commit('setFiles', files);
      
      const fileReader = new FileReader();
      let file = files[0];

      if(file['size'] < 200000){
        fileReader.readAsDataURL(file);
        fileReader.addEventListener('load', () => {
          var imageUrl = fileReader.result;
          commit('setImageURL', imageUrl);
        });
      } else {
        commit('setAlertMessage', 'The image size is greater than 200KB');
        return;
      }
    },
    uploadFile({commit, state}) {
      return new Promise((resolve,reject) => {
        var file = state.files[0];
        var storageRef = firebase.storage().ref('profile/'+file.name);
        var uploadTask = storageRef.put(file)
        
        uploadTask.on('state_changed', (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
          // Handle unsuccessful uploads
          reject(error);
        }, 
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            resolve(downloadURL);
          });
        });
      });
    },
    readFileMessage({commit}) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        var file = files[i];
        console.log("Inside readFileMessage. . .")
        if(!file.type.match("image")){continue;} 

        var picReader = new FileReader();
        var images = [];

        picReader.addEventListener('load', event => {
          var picFile = event.target;
          images.push(picFile.result);
        });
        commit('setImages',images);
        picReader.readAsDataURL(file);
      }
    },
    uploadChatImages({commit}, payload) {
      return new Promise((resolve,reject) => {
        console.log("Inside uploadChatImages. . .")
        var number = Math.random();
        var unique_id = number.toString(36).substr(2,9);

        var storageRef = firebase.storage().ref('chat_images/'+`${unique_id}.png`);
        var uploadTask = storageRef.putString(payload,'data_url', {
          contentType: "image/png"
        })
        
        uploadTask.on('state_changed', (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
          // Handle unsuccessful uploads
          reject(error);
        }, 
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            resolve(downloadURL);
          });
        });
      });
    }, 
  },
};

export default FileModule;