// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyANBSrX_q9Bd864gbN4mIhURvdwDsiY-Y4",
  authDomain: "exam-result-portal-20023.firebaseapp.com",
  databaseURL: "https://exam-result-portal-20023-default-rtdb.firebaseio.com",
  projectId: "exam-result-portal-20023",
  storageBucket: "exam-result-portal-20023.firebasestorage.app",
  messagingSenderId: "842149078237",
  appId: "1:842149078237:web:99fbb2d61eecae51846734"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);