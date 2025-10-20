import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { getTree, createNode, updateNode, deleteNode, getSingleText, updateSingleText, uploadFile, getFooter, login, logout, onAuthChange } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminPage(){
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [singleText, setSingleText] = useState("");
    const [footer, setFooter] = useState(null);
    const [user, setUser] = useState(null);
    const [authState, setAuthState] = useState({email:'',password:''});
    const nav = useNavigate();

    useEffect(()=>{
        const unsub = onAuthChange(u=> {
            setUser(u);
            if (!u) { /* do nothing */ }
            else refresh();
        });
        getFooter().then(setFooter);
        return ()=> unsub();
    },[]);

    async function refresh(){
        const tree = await getTree();
        setItems(tree);
    }

    async function onLogin(){
        try {
            await login(authState.email, authState.password);
            await refresh();
        } catch(e){
            alert("Ошибка входа: " + e.message);
        }
    }

    function onLogout(){
        logout();
    }

    async function onAdd(parent_id=null){
        const node = await createNode({
            parent_id: parent_id || null,
            title: "Новый",
            content: "",
            comment_text: "",
            comment_image_url: "",
            image_url: "",
            order: 0
        });
        await refresh();
        setSelected(node);
    }

    async function onSave(){
        if(!selected) return;
        await updateNode(selected.id, {
            title: selected.title,
            content: selected.content,
            comment_text: selected.comment_text,
            comment_image_url: selected.comment_image_url,
            image_url: selected.image_url,
            parent_id: selected.parent_id || null,
            order: selected.order || 0
        });
        await refresh();
        alert("Сохранено");
    }

    async function onDelete(id){
        if(!confirm("Удалить этот узел?")) return;
        await deleteNode(id);
        setSelected(null);
        await refresh();
    }

    async function moveOrder(id, dir){
        const node = items.find(i=>i.id===id);
        if(!node) return;
        const siblings = items.filter(i => (i.parent_id || null) === (node.parent_id || null)).sort((a,b)=>(a.order||0)-(b.order||0));
        const idx = siblings.findIndex(s=>s.id===id);
        const swapIdx = dir==='up' ? idx-1 : idx+1;
        if(swapIdx < 0 || swapIdx >= siblings.length) return;
        const other = siblings[swapIdx];
        await updateNode(node.id, { order: other.order || 0 });
        await updateNode(other.id, { order: node.order || 0 });
        await refresh();
    }

    async function onUploadImage(e){
        const file = e.target.files[0];
        if(!file) return;
        const res = await uploadFile(file);
        setSelected({...selected, image_url: res.url});
    }

    async function onUploadCommentImage(e){
        const file = e.target.files[0];
        if(!file) return;
        const res = await uploadFile(file);
        setSelected({...selected, comment_image_url: res.url});
    }

    async function saveSingleText(){
        await updateSingleText({ content: singleText });
        alert("Сохранено");
    }

    // initial data
    useEffect(()=> { refresh(); getSingleText().then(d=>setSingleText(d.content||"")); }, []);

    if(!user) {
        return (
        <div style={{maxWidth:600, margin:"40px auto"}}>
            <h2>Админ — вход</h2>
            <label>email<br/>
                <input value={authState.email} onChange={e=>setAuthState({...authState,email:e.target.value})}/>
            </label><br/>
            <label>password<br/>
                <input type="password" value={authState.password} onChange={e=>setAuthState({...authState,password:e.target.value})}/>
            </label><br/>
            <button onClick={onLogin}>Войти</button>
        </div>
        );
    }

    return (
        <div>
            <Navbar isAdmin onLogout={onLogout}/>
            <div style={{display:'flex', gap:20, padding:20}}>
                <div style={{flex:1}}>
                <h3>Дерево компонентов</h3>
                <button onClick={()=>onAdd(null)}>Добавить корневой</button>
                <ul>
                    {items.sort((a,b)=>(a.order||0)-(b.order||0)).map(it=>(
                    <li key={it.id} style={{marginBottom:6}}>
                        <span style={{cursor:'pointer'}} onClick={()=>setSelected({...it})}>{it.title || "(без заголовка)"}</span>
                        &nbsp;
                        <button onClick={()=>onAdd(it.id)}>+child</button>
                        <button onClick={()=>moveOrder(it.id,'up')}>↑</button>
                        <button onClick={()=>moveOrder(it.id,'down')}>↓</button>
                        <button onClick={()=>onDelete(it.id)}>Удалить</button>
                    </li>
                    ))}
                </ul>
                </div>

                <div style={{flex:1}}>
                    <h3>Редактор выбранного</h3>
                    {!selected ? <div>Выбери компонент слева</div> : (
                        <>
                            <label>Title<br/>
                                <input value={selected.title||""} onChange={e=>setSelected({...selected, title:e.target.value})}/>
                            </label><br/>
                            <label>Content (HTML/markdown)<br/>
                                <textarea rows={6} value={selected.content||""} onChange={e=>setSelected({...selected, content:e.target.value})}/>
                            </label><br/>
                            <label>Comment text<br/>
                                <textarea rows={3} value={selected.comment_text||""} onChange={e=>setSelected({...selected, comment_text:e.target.value})}/>
                            </label><br/>
                            <label>Comment image (URL)<br/>
                                <input value={selected.comment_image_url||""} onChange={e=>setSelected({...selected, comment_image_url:e.target.value})}/>
                            </label>
                            <br/>
                            <label>Upload comment image<br/>
                                <input type="file" onChange={onUploadCommentImage} />
                            </label>
                            <br/>
                            <label>Image (URL)<br/>
                                <input value={selected.image_url||""} onChange={e=>setSelected({...selected, image_url:e.target.value})}/>
                            </label>
                            <br/>
                            <label>Upload image<br/>
                                <input type="file" onChange={onUploadImage} />
                            </label>
                            <br/>
                            <label>Order (число)<br/>
                                <input type="number" value={selected.order||0} onChange={e=>setSelected({...selected, order: Number(e.target.value)})}/>
                            </label><br/>
                            <div style={{marginTop:10}}>
                                <button onClick={onSave}>Сохранить</button>
                            </div>
                        </>
                    )}
                <hr/>
                <h3>Отдельный текстовый блок</h3>
                <textarea rows={10} style={{width:'100%'}} value={singleText} onChange={e=>setSingleText(e.target.value)} />
                <div style={{marginTop:8}}><button onClick={saveSingleText}>Сохранить блок</button></div>
                <hr/>
                <h3>Footer (read-only)</h3>
                <div dangerouslySetInnerHTML={{__html: footer?.html || ""}} />
                </div>
            </div>
        </div>
    );
}
