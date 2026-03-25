import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// FIREBASE CONFIG
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1fF5VytMP5_sss6n3UE04ZEbtDLdw7-4",
  authDomain: "elite-auto-paintworks.firebaseapp.com",
  projectId: "elite-auto-paintworks",
  storageBucket: "elite-auto-paintworks.firebasestorage.app",
  messagingSenderId: "627149047172",
  appId: "1:627149047172:web:7882ee919e2b65571209d1"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };