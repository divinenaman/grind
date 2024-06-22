
// DOM representational nodes
const text = (t) => ({ type: "text", props: { text: t }, children: [] });
const col = (props, children) => ({ type: "column", props, children });
const row = (props, children) => ({ type: "row", props, children });

// Created View
const texts1 = [ text("Hi!"), text("How are you?") ];
const view1 = col({ width: "100" }, texts1);

const texts2 = [ text("Hello!"), text("How are you?"), text("How's the weather ?") ];
const view2 = col({ width: "100", height: "120" }, texts2);

// Diff
const diffNode = (oldNode, newNode) => {
	
	if (oldNode.type != newNode.type) {
		// remove node
		// recreate node
		return { replaceNode: true }
	} 
	
	// remove props
	const removedProps = Object.keys(oldNode.props)
		.filter(x => !newNode.props.hasOwnProperty(x));
	
	// add/update props
	const addProps = Object.keys(newNode.props)
		.filter(x => !oldNode.props.hasOwnProperty(x) || oldNode.props[x] != newNode.props[x])

	const childrenDiff = diffChildren(oldNode.children, newNode.children);

	return { removedProps, addProps, childrenDiff };
}

const diffChildren = (oldChildren, newChildren) => {
	let removeChildren = [], addChildren = [], removeOrAdd = [], updateChildren = [];
	const maxChildren = Math.max(oldChildren.length, newChildren.length);

	// remove children if len(old) > len(new)
	// add children if len(old) < len(new)
	// else diff
	for (let i = 0; i < maxChildren; i++) {
		
		if (i >= oldChildren.length || i >= newChildren.length) {
			removeOrAdd.push(i);
			continue;
		}
		const childDiff = diffNode(oldChildren[i], newChildren[i]);
		updateChildren.push(childDiff);
	}

	if (oldChildren.length > newChildren.length) {	
		removeChildren = removeOrAdd;
	} else {
		addChildren = removeOrAdd;
	}
	
	return { removeChildren, addChildren, updateChildren }	
}

const diff = diffNode(view1, view2);
console.log(diff, diff.childrenDiff)

// Render
// side-effect function
const diffAndRender = (parentNode, oldView, newView) => {
	const diff = diffNode(oldView, newView);
	renderNode(parentNode, -1, oldView, newView, diff);
}

const renderNode = (parentNode, posInParent, oldView, newView, diff) => {
	if (diff?.replaceNode) {
		removeNode(parentNode, posInParent, oldView.node);
		addNode(parentNode, posInParent, newView);
		return;
	}

	// remove props
	if (diff.removedProps.length > 0) removeProps(oldView.node, diff.removedProps);
	// add props
	if (diff.addProps.length > 0) addProps(oldView.node, diff.addProps, newView.props);
	
	// storing node reference
	newView.node = oldView.node;

	renderChildren(newView.node, oldView.children, newView.children, diff.childrenDiff);
}

const renderChildren = (parentView, oldChildren, newChildren, diff) => {
	
	if (diff.removeChildren.length > 0) {
		diff.removeChildren.forEach(element => {
			removeNode(parentView, element, oldChildren[element].node);
		});
	}
	
	for (let i = 0; i < diff.updateChildren.length; i++) {
		renderNode(parentView, i, oldChildren[i], newChildren[i], diff.updateChildren[i]);
	}

	if (diff.addChildren.length > 0) {
		diff.addChildren.forEach(ele => {
			const newNode = addNode(parentView, -1, newChildren[ele]);
			newChildren[ele].node = newNode;
		});
	}
}

var counter = 0;

const createNode = (type) => {
	console.log("creating node -> ", type);
	counter += 1;
	return { type, id: counter, children: [], props: {} }
}

const addNode = (parentNode, position, view) => {
	const ref = createNode(view.type);
	
	addProps(ref, Object.keys(view.props), view.props);

	// append at last
	if (position == -1) {
		parentNode.children.push(ref);	
	} else {
		parentNode.children.splice(pos, 0, ref);
	}

	view.children.forEach(x => {
		addNode(ref, -1, x);
	})
	view.node = ref;
}

const addProps = (ref, keys, props) => {
	for (const k of keys) {
		ref.props[k] = props[k];
	}
}

const removeProps = (ref, props) => {
	for (const p in props) {
		delete ref.props[p];
	}	
}

const removeNode = (parentRef, pos, ref) => {
	console.log("removing node -> ", ref);

	while (ref.children.length > 0) {
		removeNode(ref, 0, ref.children[0]);
	}

	parentRef.children.splice(pos, 1);
}

const parentNode = createNode("div");
addNode(parentNode, -1, view1);

console.log("#####");
console.log(parentNode);
console.log(parentNode.children[0])
console.log("#####");

console.log("#####");
diffAndRender(parentNode, view1, view2)
console.log(parentNode.children[0]);
console.log("#####");

console.log("#####");
const view3 = row({ width: "100", height: "120" }, texts2);
diffAndRender(parentNode, view2, view3);
console.log(parentNode.children[0]);
console.log("#####");
