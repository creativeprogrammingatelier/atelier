import firebase from 'firebase'

var firebaseConfig = {
    apiKey: "AIzaSyA32MYUCmzzDD4CkEkG3hwH4_oH5PvB2X4",
    authDomain: "atelier-prototype.firebaseapp.com",
    databaseURL: "https://atelier-prototype.firebaseio.com",
    projectId: "atelier-prototype",
    storageBucket: "atelier-prototype.appspot.com",
    messagingSenderId: "1049464518598",
    appId: "1:1049464518598:web:9bceb53eaf178469"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase