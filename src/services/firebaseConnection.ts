import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAc1ARGCFAh5bM96RW2zU-_NI2GinSCGac",
  authDomain: "webcarros-25323.firebaseapp.com",
  projectId: "webcarros-25323",
  storageBucket: "webcarros-25323.firebasestorage.app",
  messagingSenderId: "783831804036",
  appId: "1:783831804036:web:201b305ee9e37bbcf1bad1"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };