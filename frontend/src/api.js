import {
    collection, doc, getDocs, getDoc,
    addDoc, updateDoc, deleteDoc, setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "firebase/auth";

// TREE
export async function getTree() {
    const snapshot = await getDocs(collection(db, "components"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createNode(data) {
    const docRef = await addDoc(collection(db, "components"), data);
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
}

export async function updateNode(id, data) {
    await updateDoc(doc(db, "components", id), data);
    const snap = await getDoc(doc(db, "components", id));
    return { id: snap.id, ...snap.data() };
}

export async function deleteNode(id) {
    await deleteDoc(doc(db, "components", id));
    return { deletedId: id };
}

// SINGLE TEXT BLOCK
export async function getSingleText() {
    const snap = await getDoc(doc(db, "single_text", "main"));
    return snap.exists() ? snap.data() : { content: "" };
}

export async function updateSingleText(data) {
    await setDoc(doc(db, "single_text", "main"), data);
}

// FOOTER
export async function getFooter() {
    const snap = await getDoc(doc(db, "footer", "main"));
    return snap.exists() ? snap.data() : { html: "<p>Контакты: example@mail.com</p>" };
}

// UPLOAD
export async function uploadFile(file) {
    const storageRef = ref(storage, "uploads/" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url };
}

export async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);    
}

export async function logout() {
    return signOut(auth);
}

export async function onAuthChange(cb) {
    return onAuthStateChanged(auth, cb);
}

export function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

export async function changePassword(newPassword) {
    if (!auth.currentUser) throw new Error("Пользователь не вошел");
    await updatePassword(auth.currentUser, newPassword);
}
