import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import TreeEditor from "../components/TreeEditor/TreeEditor";
import {
    getTree,
    createNode,
    updateNode,
    deleteNode,
    getSingleText,
    updateSingleText,
    uploadFile,
    getFooter,
    login,
    logout,
    onAuthChange,
    resetPassword,
    changePassword,
} from "../api";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploader from "quill-image-uploader/dist/quill.imageUploader.min.js";
import Quill from "quill";

import { list } from "firebase/storage";
import firebase from "firebase/compat/app";

Quill.register("modules/imageUploader", ImageUploader);

export default function AdminPage() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [singleText, setSingleText] = useState("");
    const [footer, setFooter] = useState(null);
    const [user, setUser] = useState(null);
    const [authState, setAuthState] = useState({ email: "", password: "" });
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [showChangePass, setShowChangePass] = useState(false);
    const [newPass, setNewPass] = useState("");

    useEffect(() => {
        const unsub = onAuthChange((u) => {
            setUser(u);
            if (u) refresh();
        });
        getFooter().then(setFooter);
        getSingleText().then((d) => setSingleText(d.content || ""));
        return () => unsub();
    }, []);

    async function refresh() {
        const data = await getTree();  
        setItems(data);                
    }

    async function onLogin() {
        try {
            await login(authState.email, authState.password);
            await refresh();
        } catch (e) {
            alert("Ошибка входа: " + e.message);
        }
    }

    async function onResetPassword() {
        try {
            await resetPassword(resetEmail);
            alert("Письмо для сброса пароля отправлено на " + resetEmail);
            setShowReset(false);
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    }

    function onLogout() {
        logout();
    }

    async function onChangePassword() {
        try {
            await changePassword(newPass);
            alert("Пароль успешно изменён");
            setShowChangePass(false);
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    }

    async function onAdd(parent_id = null) {
        const siblings = items.filter(
            (i) => (i.parent_id || null) === (parent_id || null)
        );
        const newPosition =
            siblings.length > 0
                ? Math.max(...siblings.map((s) => s.position || 0)) + 1
                : 0;

        const node = await createNode({
            parent_id: parent_id || null,
            title: "Новый элемент",
            content: "",
            comment_text: "",
            image_url: "",
            position: newPosition,
        });

        setItems((prev) => [...prev, node]);
        setSelected(node);
    }

    async function onSave() {
        if (!selected) return;
        await updateNode(selected.id, {
            title: selected.title,
            content: selected.content,
            comment_text: selected.comment_text,
            image_url: selected.image_url,
            comment_image_url: selected.comment_image_url || "",
        });
        await refresh();
        alert("Сохранено");
    }

    async function onDelete(id) {
        console.log("Удаление элемента:", id);
        const toDelete = [id];
        const all = [...items];

        const collectChildren = (parentId) => {
            all.forEach((item) => {
                if (item.parent_id === parentId) {
                    toDelete.push(item.id);
                    collectChildren(item.id);
                }
            });
        };
        collectChildren(id);

        const confirmMsg = `Удалить элемент и ${toDelete.length - 1} дочерних узлов?`;
        if (!confirm(confirmMsg)) return;

        setItems((prev) => prev.filter((i) => !toDelete.includes(i.id)));

        for (const delId of toDelete) {
            try {
                await deleteNode(delId);
            } catch (e) {
                console.error("Ошибка удаления Firestore:", delId, e);
            }
        }

        setSelected(null);
        await refresh();
    }

    async function onUploadImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const res = await uploadFile(file);
        setSelected({ ...selected, image_url: res.url });
    }

    async function onUploadCommentImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const res = await uploadFile(file);
        setSelected({ ...selected, comment_image_url: res.url });
    }

    async function saveSingleText() {
        await updateSingleText({ content: singleText });
        alert("Сохранено");
    }

    if (!user) {
        return (
            <div style={{ maxWidth: 600, margin: "40px auto" }}>
                <h2>Админ — вход</h2>

                {!showReset ? (
                    <>
                        <label>Почта
                            <br />
                            <input
                                value={authState.email}
                                onChange={(e) =>
                                    setAuthState({ ...authState, email: e.target.value })
                                }
                            />
                        </label>
                        <br />
                        <label>Пароль
                            <br />
                            <input
                                type="password"
                                value={authState.password}
                                onChange={(e) =>
                                    setAuthState({ ...authState, password: e.target.value })
                                }
                            />
                        </label>
                        <br />
                        <button onClick={onLogin}>Войти</button>
                        <div style={{ marginTop: 10 }}>
                            <button
                                onClick={() => setShowReset(true)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "blue",
                                    cursor: "pointer"
                                }}
                            >Забыли пароль?
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3>Восстановление пароля</h3>
                        <label>Ваша почта
                            <br />
                            <input
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </label>
                        <br />
                        <button onClick={onResetPassword}>Отправить письмо</button>
                        <button
                            onClick={() => setShowReset(false)}
                            style={{ marginLeft: 10 }}
                        >Назад
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            <Navbar isAdmin onLogout={onLogout} />

            <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
                <div style={{ padding: "10px 20px" }}>
                    <button onClick={() => setShowChangePass(true)}>Сменить пароль</button>
                </div>

                {showChangePass && (
                    <div style={{ padding: "10px 20px" }}>
                        <h3>Смена пароля</h3>
                        <label>Новый пароль
                            <br />
                            <input
                                type="password"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                            />
                        </label>
                        <br />
                        <button onClick={onChangePassword}>Сменить</button>
                        <button
                            onClick={() => setShowChangePass(false)}
                            style={{ marginLeft: 10 }}
                        >Отмена
                        </button>
                    </div>
                )}

                <div style={{ display: "flex", gap: 20, padding: 20 }}>
                    <div style={{ flex: 1 }}>
                        <h3>Семейное дерево Антипиных</h3>
                            <TreeEditor
                                items={items}
                                setItems={setItems}
                                onSelect={setSelected}
                                onAdd={onAdd}
                                onDelete={onDelete}
                            />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3>Редактор выбранного</h3>
                        {!selected ? (
                            <div>Выбери компонент слева</div>
                        ) : (
                            <>
                                <label>Title
                                    <br />
                                    <input
                                        value={selected.title || ""}
                                        onChange={(e) =>
                                            setSelected({ ...selected, title: e.target.value })
                                        }
                                    />
                                </label>
                                <br />
                                <label>Content (HTML/markdown)
                                    <br />
                                    <textarea
                                        rows={6}
                                        value={selected.content || ""}
                                        onChange={(e) =>
                                            setSelected({ ...selected, content: e.target.value })
                                        }
                                    />
                                </label>
                                <br />
                                <label>Comment text
                                    <br />
                                    <textarea
                                        rows={3}
                                        value={selected.comment_text || ""}
                                        onChange={(e) =>
                                            setSelected({ ...selected, comment_text: e.target.value })
                                        }
                                    />
                                </label>
                                <br />
                                <label>Image (URL)
                                    <br />
                                    <input
                                        value={selected.image_url || ""}
                                        onChange={(e) =>
                                            setSelected({ ...selected, image_url: e.target.value })
                                        }
                                    />
                                </label>
                                <br />
                                <label>Upload image
                                    <br />
                                    <input type="file" onChange={onUploadImage} />
                                </label>
                                <br />
                                <label>Upload comment image
                                    <br />
                                    <input type="file" onChange={onUploadCommentImage} />
                                </label>
                                <div style={{ marginTop: 10 }}>
                                    <button onClick={onSave}>Сохранить</button>
                                </div>
                            </>
                        )}
                        <hr />
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <h3>История семьи Антипиных</h3>
                    <ReactQuill 
                        value={singleText}
                        onChange={setSingleText}
                        theme="snow"
                        modules={{
                            toolbar: [
                                [{ header: [1, 2, 3, false] }],
                                ["bold", "italic", "underline", "strike"],
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["link", "image"],
                                ["clean"]
                            ],
                            ImageUploader: {
                                upload: async (file) => {
                                    const res = await uploadFile(file);
                                    return res.url;
                                }
                            }
                        }}
                        formats={[
                            "header",
                            "bold",
                            "italic",
                            "underline",
                            "strike",
                            "list",
                            "bullet",
                            "link",
                            "image"
                        ]}
                    />
                    <div style={{ marginTop: 8 }}>
                        <button onClick={saveSingleText} style={{ marginTop: 10 }}>Сохранить блок</button>
                    </div>
                    <hr />
                    <h3>Footer (read-only)</h3>
                    <div dangerouslySetInnerHTML={{ __html: footer?.html || "" }} />
                </div>
            </div>
        </div>
    );
}
