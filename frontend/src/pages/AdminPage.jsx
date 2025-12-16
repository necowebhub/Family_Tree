import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import TreeEditor from "../components/TreeEditor/TreeEditor";
import {
    getTree,
    createNode,
    updateNode,
    deleteNode,
    getSingleText,
    updateSingleText,
    logout,
    onAuthChange,
    changePassword,
} from "../api";

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";


export default function AdminPage() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [singleText, setSingleText] = useState("");
    const [showChangePass, setShowChangePass] = useState(false);
    const [newPass, setNewPass] = useState("");

    useEffect(() => {
        refresh();
        getSingleText().then((d) => setSingleText(d.content || ""));
    }, []);

    async function refresh() {
        const data = await getTree();  
        setItems(data);                
    }

    const navigate = useNavigate();

    async function onLogout() {
        setShowChangePass(false);
        await logout();
        navigate("/login", { replace: true })
    }

    async function onChangePassword() {
        if (!newPass || newPass.length < 6) {
            alert("Пароль должен быть не короче 6 символов");
            return;
        }

        try {
            await changePassword(newPass);
            alert("Пароль успешно изменён");
            setNewPass("");
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
        setTimeout(() => {
            setSelected(node);
        }, 100);
    }

    async function onSave() {
        if (!selected) return;
        const updated = await updateNode(selected.id, {
            title: selected.title,
            birthday: selected.birthday,
            deathday: selected.deathday,
            comment_text: selected.comment_text,
            bgColor: selected.bgColor || "",
        });
        setItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSelected(updated);
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
    }

    return (
        <div>
            <Navbar onLogout={onLogout} onChangePass={() => setShowChangePass(true)}/>

            <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>

                {showChangePass && (
                    <div style={{ padding: "10px 20px" }}>
                        <h3>Смена пароля</h3>
                        <label>Новый пароль
                            <br />
                            <input
                                type="password"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                style={{ width: "100%", maxWidth: "400px" }}
                            />
                        </label>
                        <br />
                        <button 
                            className="admin-btn"
                            onClick={onChangePassword}
                            style={{ marginLeft: 0, marginTop: 10, marginRight: 10 }}
                        >Сменить
                        </button>
                        <button
                            className="admin-btn"
                            onClick={() => setShowChangePass(false)}
                            style={{ marginTop: 10 }}
                        >Отмена
                        </button>
                    </div>
                )}

                <div className="admin-tree-editor-container">
                    <div className="flex-col admin-tree-section">
                        <h3>Семейное дерево Антипиных</h3>
                        <div style={{
                            border: "1px solid #bebebe",
                            borderRadius: "8px",
                            background: "#fff",
                            overflow: "hidden"
                        }}>
                            <TreeEditor
                                items={items}
                                setItems={setItems}
                                onSelect={setSelected}
                                onAdd={onAdd}
                                onDelete={onDelete}
                            />
                        </div>
                    </div>

                    <div className="flex-col admin-editor-section">
                        <h3>Редактор выбранного</h3>
                        {!selected ? (
                            <div>Выбери компонент слева</div>
                        ) : (
                            <>
                                <label>ФИО
                                    <br />
                                    <input
                                        type="text"
                                        value={selected.title || ""}
                                        onChange={(e) =>
                                            setSelected({ ...selected, title: e.target.value })
                                        }
                                        style={{ width: "100%", maxWidth: "400px" }}
                                    />
                                </label>
                                <br />
                                <label>Цвет элемента
                                    <br />
                                    <input 
                                        type="color"
                                        value={selected.bgColor || "#ffffff"}
                                        onChange={(e) => 
                                            setSelected({ ...selected, bgColor: e.target.value })
                                        }
                                        style={{ width: '60px', height: '30px', cursor: 'pointer' }}
                                    />
                                    <button
                                        className="admin-btn"
                                        onClick={() => setSelected({ ...selected, bgColor: "" })}
                                        style={{ marginLeft: 10, padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        Сбросить
                                    </button>
                                </label>
                                <br />
                                <label>Дни жизни
                                    <br />
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <input 
                                            type="text"
                                            placeholder="?"
                                            value={selected.birthday || ""}
                                            onChange={(e) => 
                                                setSelected({ ...selected, birthday: e.target.value })
                                            }
                                            style={{ flex: "1", minWidth: "80px", maxWidth: "150px" }}
                                        />
                                        <span> — </span>
                                        <input 
                                            type="text"
                                            placeholder="?"
                                            value={selected.deathday || ""}
                                            onChange={(e) => 
                                                setSelected({ ...selected, deathday: e.target.value })
                                            }
                                            style={{ flex: "1", minWidth: "80px", maxWidth: "150px" }}
                                        />
                                    </div>
                                </label>
                                <br />
                                <label>Контент</label>
                                <div className="editor-wrapper">
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
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <button className="admin-btn" onClick={onSave}>Сохранить</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <hr style={{ border: "none", borderTop: "2px dotted #372414" }}/>
            <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
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
                        
                        <button className="admin-btn" onClick={saveSingleText}>Сохранить блок</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
