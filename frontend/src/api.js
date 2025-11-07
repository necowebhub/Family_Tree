import { auth, db, storage } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// TREE
export async function getTree() {
    const snapshot = await getDocs(collection(db, "components"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createNode(data) {
    const snapshot = await getDocs(collection(db, "components"));
    const sameParent = snapshot.docs
        .map((d) => d.data())
        .filter((d) => d.parent_id === (data.parent_id || null));

    const maxPosition =
        sameParent.length > 0
            ? Math.max(...sameParent.map((d) => d.position ?? 0))
            : -1;

    const docRef = await addDoc(collection(db, "components"), {
        title: data.title || "Новый элемент",
        content: data.content || "",
        comment_text: data.comment_text || "",
        comment_image_url: data.comment_image_url || "",
        image_url: data.image_url || "",
        parent_id: data.parent_id || null,
        position: maxPosition + 1, // следующий по порядку
    });

    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
}

export async function updateNode(id, data) {
    await updateDoc(doc(db, "components", id), data);
    const snap = await getDoc(doc(db, "components", id));
    return { id: snap.id, ...snap.data() };
}

export async function deleteNode(id) {
    console.log("[deleteNode] попытка удалить документ:", id);
    const ref = doc(db, "components", id);
    await deleteDoc(ref);
    const check = await getDoc(ref);
    if (check.exists()) {
        console.warn("⚠️ Документ не удалился:", id);
    } else {
        console.log("✅ Документ успешно удалён:", id);
    }
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

export async function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

export async function changePassword(newPassword) {
    if (!auth.currentUser) throw new Error("Пользователь не вошел");
    await updatePassword(auth.currentUser, newPassword);
}
