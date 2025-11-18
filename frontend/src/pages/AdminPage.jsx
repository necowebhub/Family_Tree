import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import TreeEditor from "../components/TreeEditor/TreeEditor";
import {
    getTree,
    createNode,
    updateNode,
    deleteNode,
    getSingleText,
    updateSingleText,
    getFooter,
    login,
    logout,
    onAuthChange,
    resetPassword,
    changePassword,
} from "../api";

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";


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
        const node = await createNode({
            parent_id: parent_id || null,
            title: "Иванов Иван Иванович",
            birthday: "",
            deathday: "",
            comment_text: "",
        });

        setItems((prev) => [...prev, node]);
        setSelected(node);
    }

    async function onSave() {
        if (!selected) return;
        const updated = await updateNode(selected.id, {
            title: selected.title,
            birthday: selected.birthday,
            deathday: selected.deathday,
            comment_text: selected.comment_text,
        });
        setItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSelected(updated);
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
                console.error("Ошибка удаления Firestore", delId, e);
                alert(`Ошибка удаления элемента ${delId}: ${e.message}`);
            }
        }

        setSelected(null);
        await refresh();
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
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                onLogin();
                            }}
                        >
                            <label>Почта
                                <br />
                                <input
                                    type="email"
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
                            <button type="submit">Войти</button>
                        </form>
                        <div style={{ marginTop: 10 }}>
                            <button
                                onClick={() => setShowReset(true)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "blue",
                                    cursor: "pointer"
                                }}
                            >
                                Забыли пароль?
                            </button>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <button 
                                onClick={() => (window.location.href = "/")} 
                                style={{ 
                                    background: "transparent", 
                                    border: "none", 
                                    color: "blue", 
                                    cursor: "pointer" 
                                }}
                            >
                                ← Вернуться на главную
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
                                <label>ФИО
                                    <br />
                                    <input
                                        value={selected.title || ""}
                                        onChange={(e) =>
                                            setSelected({ ...selected, title: e.target.value })
                                        }
                                    />
                                </label>
                                <br />
                                <label>Дни жизни
                                        <br />
                                        <input 
                                            type="date"
                                            value={selected.birthday || ""}
                                            onChange={(e) => 
                                                setSelected({ ...selected, birthday: e.target.value })
                                            }
                                        />
                                        <span> - </span>
                                        <input type="date"
                                            value={selected.deathday || ""}
                                            onChange={(e) => 
                                                setSelected({ ...selected, deathday: e.target.value })
                                            }                                        
                                        />
                                </label>
                                <br />
                                <label>Контент</label>
                                <ReactQuill
                                    value={selected.comment_text || ""}
                                    onChange={ value =>
                                        setSelected({ ...selected, comment_text: value })
                                    }
                                    theme="snow"
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, 3, false] }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ align: [] }],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            ["link", "image"],
                                            ["clean"]
                                        ],
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
                                        "image",
                                        "align"
                                    ]}
                                    style={{ background: "white", marginBottom: 20 }}
                                />
                                
                                <div style={{ marginTop: 10 }}>
                                    <button onClick={onSave}>Сохранить</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <hr />
                <div style={{ marginBottom: 20 }}>
                    <div style={{ padding: 20 }}>
                        <h3>История семьи Антипиных</h3>
                        <ReactQuill 
                            value={singleText}
                            onChange={setSingleText}
                            theme="snow"
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, 3, false] }],
                                    ["bold", "italic", "underline", "strike"],
                                    [{ align: [] }],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link", "image"],
                                    ["clean"]
                                ],
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
                                "image",
                                "align"
                            ]}
                            style={{ background: "white", marginBottom: 20 }}
                        />
                        
                        <button onClick={saveSingleText} style={{ marginTop: 10 }}>Сохранить блок</button>
                    </div>
                    <hr />
                    <div style={{ padding: 20 }}>
                        <h3>Footer (read-only)</h3>
                        <div dangerouslySetInnerHTML={{ __html: footer?.html || "" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
