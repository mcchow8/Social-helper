import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { functions } from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDYOuOe3_9-9slNjOaUemElOohoBqxrMMo",
  authDomain: "social-helper-ab69e.firebaseapp.com",
  databaseURL: "https://social-helper-ab69e.firebaseio.com",
  projectId: "social-helper-ab69e",
  storageBucket: "social-helper-ab69e.appspot.com",
  messagingSenderId: "994856575721",
  appId: "1:994856575721:web:ce0f5652fe6d87559c8678",
  measurementId: "G-1SJJVR9SKX"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const database = firebase.database();
export const storage = firebase.storage();

const provider = new firebase.auth.GoogleAuthProvider();

export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

export const generateUserDocument = async (user, additionalData) => {
  if (!user) return;

  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const { email, displayName, photoURL } = user;
    try {
      await userRef.set({
        displayName,
        email,
        photoURL,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
  return getUserDocument(user.uid);
};

const getUserDocument = async uid => {
  if (!uid) return null;
  try {
    const userDocument = await database.doc(`user/${uid}`).get();
    
    return {
      uid,
      ...userDocument.data()
    };
  } catch (error) {
    console.error("Error fetching user", error);
  }
};
