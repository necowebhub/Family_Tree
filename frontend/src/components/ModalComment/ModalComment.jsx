import React from "react";
import styles from "./ModalComment.module.css";

export default function ModalComment({ item, onClose }) {
    if(!item) return null;
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e)=> e.stopPropagation()}>
                <button className={styles.close} onClick={onClose}>×</button>
                <div className={styles.body}>
                    <div dangerouslySetInnerHTML={{__html: item.comment_text || "<i>Комментарий пуст</i>"}} />
                    {item.comment_image_url && <img src={item.comment_image_url} alt="comment" className={styles.img} />}
                </div>
            </div>
        </div>
    );
}
