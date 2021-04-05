// Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyASTAE7VHs0gY_llKtahcRwOzsyHKQ6das",
    authDomain: "todo-app-dynamic.firebaseapp.com",
    projectId: "todo-app-dynamic",
    storageBucket: "todo-app-dynamic.appspot.com",
    messagingSenderId: "929074796768",
    appId: "1:929074796768:web:e7554b37ab350dd1cad885"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // AUTH AND FIRESTORE REFERENCE
const auth = firebase.auth();
const db = firebase.firestore();

db.settings({ timestampsInSnapshots: true});
