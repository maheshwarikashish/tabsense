// ... firebaseConfig ...

const firebaseConfig = {
  apiKey: "AIzaSyDpoeWltluk8wWwYvsctnlFHr1DPgWUNYo",
  authDomain: "tabsense-project.firebaseapp.com",
  databaseURL: "https://tabsense-project-default-rtdb.firebaseio.com",
  projectId: "tabsense-project",
  storageBucket: "tabsense-project.firebasestorage.app",
  messagingSenderId: "26260205065",
  appId: "1:26260205065:web:235ff2980c1d92a45e52d8",
  measurementId: "G-38C4DKSY7X"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();
