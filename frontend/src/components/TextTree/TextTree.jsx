import React, { useMemo, useState } from "react";
import ModalComment from "../ModalComment/ModalComment";
import styles from "./TextTree.module.css";

function buildTree(items){
    const map = {};
    items.forEach(i => map[i.id] = {...i, children: []});
    const roots = [];
    items.forEach(i => {
        if(i.parent_id) {
            if(map[i.parent_id]) map[i.parent_id].children.push(map[i.id]);
            else roots.push(map[i.id]); // orphan fallback
        } else roots.push(map[i.id]);
    });
    const sortRec = node => {
        node.children.sort((a,b)=>(a.order||0)-(b.order||0));
        node.children.forEach(sortRec);
    };
    roots.forEach(sortRec);
    return roots.sort((a,b)=>(a.order||0)-(b.order||0));
}

export default function TextTree({ items }) {
    const [modalItem, setModalItem] = useState(null);
    const tree = useMemo(()=> buildTree(items || []), [items]);

    const renderNode = (node, level=0) => (
        <div key={node.id} className={styles.node} style={{marginLeft: level * 18}}>
            <div className={styles.clickable} onClick={()=>setModalItem(node)}>
                <div className={styles.title}>{node.title}</div>
            </div>
            {node.children.map(ch => renderNode(ch, level+1))}
        </div>
    );

    return (
        <div>
            {tree.map(r => renderNode(r))}
            {modalItem && <ModalComment item={modalItem} onClose={()=>setModalItem(null)} />}
        </div>
    );
}
