export function buildTree(items) {
    const map = {};
    items.forEach((i) => {map[i.id] = { ...i, children: [] }});

    const roots = [];
    items.forEach((i) => {
        if (i.parent_id && map[i.parent_id]) {
            map[i.parent_id].children.push(map[i.id]);
        } else {
            roots.push(map[i.id]);
        }
    });

    const sortRec = (node) => {
        node.children.sort((a, b) => (a.position || 0) - (b.position || 0));
        node.children.forEach(sortRec);
    };

    roots.forEach(sortRec);
    return roots.sort((a, b) => (a.position || 0) - (b.position || 0));
}
