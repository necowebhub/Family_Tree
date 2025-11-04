import React, { useMemo } from "react";
import { DndContext, closestCenter, useDraggable, useDroppable } from "@dnd-kit/core";
import { buildTree } from "../../utils/buildTree";
import { updateNode } from "../../api";
import styles from "./TreeEditor.module.css";


function DraggableNode({ node, depth = 0, onSelect }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: node.id,
        data: { node },
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: node.id,
        data: { node },
    });

    const style = {
        transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
        marginLeft: depth * 20,
        border: isOver ? "1px dashed #00aaff" : "1px solid transparent",
        padding: "4px 6px",
        background: isOver ? "rgba(0,170,255,0.05)" : "transparent",
        borderRadius: 4,
        cursor: "grab",
        transition: "background 0.15s ease",
    };

    return (
        <div ref={setDropRef}>
            <div
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                style={style}
                onClick={() => onSelect(node)}
            >
                <span className={styles.title}>{node.title || "(без названия)"}</span>
            </div>

            {node.children?.map((ch) => (
                <DraggableNode
                key={ch.id}
                node={ch}
                depth={depth + 1}
                onSelect={onSelect}
                />
            ))}
        </div>
    );
}


export default function TreeEditor({ items, setItems, onSelect }) {
    const tree = useMemo(() => buildTree(items), [items]);

    async function handleDragEnd(event) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const dragged = items.find((i) => i.id === active.id);
        const target = items.find((i) => i.id === over.id);
        if (!dragged || !target) return;

        const isDescendant = (parentId, childId) => {
            const child = items.find((i) => i.id === childId);
            if (!child) return false;
            if (child.parent_id === parentId) return true;
            return child.parent_id
                ? isDescendant(parentId, child.parent_id)
                : false;
        };
        if (isDescendant(dragged.id, target.id)) return;

        let newParent = target.parent_id || null;
        let siblings = items
            .filter((i) => i.parent_id === newParent)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

        const draggedIndex = siblings.findIndex((s) => s.id === dragged.id);
        const targetIndex = siblings.findIndex((s) => s.id === target.id);

        if (dragged.parent_id === target.parent_id) {
            siblings.splice(draggedIndex, 1);
            siblings.splice(targetIndex, 0, dragged);
        } else {
            newParent = target.id;
            siblings = items
                .filter((i) => i.parent_id === newParent)
                .sort((a, b) => (a.position || 0) - (b.position || 0));
            siblings.push(dragged);
        }

        const updatedSiblings = siblings.map((s, index) => ({
            ...s,
            position: index,
            parent_id: newParent,
        }));

        const updatedItems = items.map((i) => {
            const found = updatedSiblings.find((u) => u.id === i.id);
            return found ? found : i;
        });

        setItems(updatedItems);

        for (const s of updatedSiblings) {
            await updateNode(s.id, {
                position: s.position,
                parent_id: s.parent_id || null,
            });
        }
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className={styles.treeContainer}>
                {tree.map((node) => (
                    <DraggableNode key={node.id} node={node} onSelect={onSelect} />
                ))}
            </div>
        </DndContext>
    );
}

