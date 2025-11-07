import React, { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { buildTree } from "../../utils/buildTree";
import { updateNode } from "../../api";
import styles from "./TreeEditor.module.css";

/* DropZone */
function DropZone({ id, depth }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={styles.dropZone}
      style={{
        height: 6,
        marginLeft: depth * 20,
        background: isOver ? "rgba(0,170,255,0.18)" : "transparent",
        transition: "background 0.08s ease",
      }}
    />
  );
}

/* Узел дерева */
function DraggableNode({ node, depth = 0, onSelect, onAdd, onDelete, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: node.id,
    data: { node },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    marginLeft: depth * 20,
    padding: "4px 6px",
    borderRadius: 4,
    cursor: "grab",
    transition: "background 0.12s ease",
    userSelect: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <div>
      <DropZone id={`before-${node.id}`} depth={depth} />

      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        onClick={() => onSelect(node)}
      >
        <span className={styles.title}>{node.title || "(без названия)"}</span>

        {!isDragging && (
          <span className={styles.actions}>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onAdd(node.id);
              }}
              title="Добавить ребёнка"
            >
              ➕
            </button>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              title="Удалить элемент"
            >
              ➖
            </button>
          </span>
        )}
      </div>

      <DropZone id={`inside-${node.id}`} depth={depth + 1} />

      {node.children?.map((ch) => (
        <DraggableNode
          key={ch.id}
          node={ch}
          depth={depth + 1}
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          isDragging={isDragging}
        />
      ))}

      <DropZone id={`after-${node.id}`} depth={depth} />
    </div>
  );
}

/* Пересчёт позиций */
function assignPositions(itemsArr, parentId) {
  const group = itemsArr
    .filter((i) => (i.parent_id || null) === (parentId || null))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  group.forEach((item, idx) => {
    item.position = idx;
    item.parent_id = parentId || null;
  });
  return group;
}

/* Основной компонент */
export default function TreeEditor({ items, setItems, onSelect, onAdd, onDelete }) {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const tree = useMemo(() => buildTree(items || []), [items]);

  async function handleDragEnd(event) {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedId = active.id;
    const overId = over.id;
    const match = overId.match(/^(before|inside|after)-(.+)$/);
    if (!match) return;

    const dropType = match[1];
    const targetId = match[2];

    const dragged = items.find((i) => i.id === draggedId);
    const target = items.find((i) => i.id === targetId);
    if (!dragged || !target) return;

    const updated = items.map((i) => ({ ...i })).filter((i) => i.id !== draggedId);

    let newParent = dragged.parent_id ?? null;

    if (dropType === "inside") {
      newParent = target.id;
      updated.push({ ...dragged, parent_id: newParent });
    } else {
      newParent = target.parent_id ?? null;
      const siblings = updated
        .filter((i) => (i.parent_id ?? null) === (newParent ?? null))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      const insertIndex =
        siblings.findIndex((s) => s.id === targetId) + (dropType === "after" ? 1 : 0);
      const draggedCopy = { ...dragged, parent_id: newParent };
      siblings.splice(insertIndex, 0, draggedCopy);

      const others = updated.filter((i) => (i.parent_id ?? null) !== (newParent ?? null));
      updated.length = 0;
      others.forEach((o) => updated.push(o));
      siblings.forEach((s) => updated.push(s));
    }

    const oldParent = dragged.parent_id ?? null;
    assignPositions(updated, oldParent);
    assignPositions(updated, newParent);

    setItems(updated);

    const toUpdate = items
      .map((orig) => {
        const cur = updated.find((u) => u.id === orig.id);
        if (!cur) return null;
        if (
          (cur.parent_id ?? null) !== (orig.parent_id ?? null) ||
          (cur.position ?? 0) !== (orig.position ?? 0)
        ) {
          return { id: cur.id, parent_id: cur.parent_id ?? null, position: cur.position ?? 0 };
        }
        return null;
      })
      .filter(Boolean);

    for (const u of toUpdate) {
      try {
        await updateNode(u.id, { parent_id: u.parent_id, position: u.position });
      } catch (e) {
        console.error("updateNode error", u, e);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.treeContainer}>
        {tree.map((node) => (
          <DraggableNode
            key={node.id}
            node={node}
            onSelect={onSelect}
            onAdd={onAdd}
            onDelete={onDelete}
            isDragging={isDragging}
          />
        ))}
      </div>
    </DndContext>
  );
}
