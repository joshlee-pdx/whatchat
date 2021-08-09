import firebase from 'firebase';

const FileModule = {
  state: {
    image_url:'https://www.seekpng.com/png/detail/966-9665493_my-profile-icon-blank-profile-image-circle.png',
    files: null,
  },
  getters: {
    image_url: state => state.image_url,
    files: state => state.files,
  },
  mutations: {
    setImageURL(state,payload){
      state.image_url = payload;
    },
    setFiles(state,payload){
      state.files = payload;
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