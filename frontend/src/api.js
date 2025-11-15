import { auth, db, storage } from "./firebase";
import { 
    collection, 
    doc, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


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
        title: data.title || "Иванов Иван Иванович",
        birthday: data.birthday || "",
        deathday: data.deathday || "",
        comment_text: data.comment_text || "",
        parent_id: data.parent_id || null,
        position: maxPosition + 1,
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

    try {
        const q = query(
            collection(db, "components"),
            where("id", "==", id)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("[deleteNode] документ не найден");
            return false;
        }

        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        console.log("[deleteNode] успешно удалено:", querySnapshot.size);
        return true;
    } catch (error) {
        console.error("[deleteNode] ошибка:", error);
        throw error;
    }
}

// SINGLE TEXT BLOCK
export async function getSingleText() {
    const snap = await getDoc(doc(db, "single_text", "main"));
    return snap.exists() ? snap.data() : { content: "" };
}

export async function updateSingleText(data) {
    await setDoc(doc(db, "single_text", "main"), data);
}

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
