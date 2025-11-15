import React, { useMemo, useState } from "react";
import ModalComment from "../ModalComment/ModalComment";
import styles from "./TextTree.module.css";
import { buildTree } from "../../utils/buildTree";

export default function TextTree({ items }) {
    const [modalItem, setModalItem] = useState(null);
    const tree = useMemo(() => buildTree(items || []), [items]);

    const renderNode = (node, level = 0) => (
        <div key={node.id} className={styles.node} style={{ marginLeft: level * 18 }}>
            <div className={styles.clickable} onClick={() => setModalItem(node)}>
                <span className={styles.title}>{node.title} ({node.birthday || "не известно"} - {node.deathday || "по сей день"})</span>
            </div>
            {node.children.map(child => renderNode(child, level + 1))}
        </div>
    );

    return (
        <div className={styles.tree}>
            {tree.map(root => renderNode(root))}
            {modalItem && <ModalComment item={modalItem} onClose={() => setModalItem(null)} />}
        </div>
    );
}
