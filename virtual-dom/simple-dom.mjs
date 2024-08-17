
// DOM representational nodes
const text = (t) => ({ type: "text", props: { text: t }, children: [] });
const col = (props, children) => ({ type: "column", props, children });
const row = (props, children) => ({ type: "row", props, children });

let platformAPI = {}

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

// Render
// side-effect function
const diffAndRender = (parentNode, oldView, newView) => {
	const diff = diffNode(oldView, newView);
	renderNode(parentNode, 0, oldView, newView, diff);
	parentNode.children[0] = newView;
}

const renderNode = (parentNode, posInParent, oldView, newView, diff) => {
	if (diff?.replaceNode) {
		removeNode(parentNode, posInParent, oldView);
		addNode(parentNode, posInParent, newView);
		return;
	}

	// remove props
	if (diff.removedProps.length > 0) removeProps(oldView, diff.removedProps);
	// add props
	if (diff.addProps.length > 0) addProps(oldView, diff.addProps, newView.props);
	
	// storing node reference
	newView.node = oldView.node;

	renderChildren(newView, oldView.children, newView.children, diff.childrenDiff);
}

const renderChildren = (parentView, oldChildren, newChildren, diff) => {
	
	if (diff.removeChildren.length > 0) {
		diff.removeChildren.forEach(element => {
			removeNode(parentView, element, oldChildren[element]);
		});
	}
	
	for (let i = 0; i < diff.updateChildren.length; i++) {
		renderNode(parentView, i, oldChildren[i], newChildren[i], diff.updateChildren[i]);
	}

	if (diff.addChildren.length > 0) {
		diff.addChildren.forEach(ele => {
			addNode(parentView, -1, newChildren[ele]);
		});
	}
}

// functions updating both dsl & platform specific nodes
const addNode = (parentView, position, view) => {
	const ref = platformAPI.createNode(view.type);
	view.node = ref;
	addProps(view, Object.keys(view.props), view.props);
	
	if (parentView) platformAPI.addToParent(parentView.node, ref, position);

	view.children.forEach(x => {
		addNode(view, -1, x);
	})

	return view
}

const addProps = (view, keys, props) => {
	platformAPI.addProps(view.node, keys, props)
}

const removeProps = (view, props) => {	
	platformAPI.removeNode(view.node, props)
}

const removeNode = (parentView, pos, view) => {
	platformAPI.removeNode(parentView.node, pos, view.node)
}


const registerPlatformAPI = (apis) => {
	platformAPI = apis;
}

const renderView = (view) => {
	// create a dummy view to add view sent
	const rootView = col({}, [view]);
	// create node
	addNode(null, -1, rootView);
	// attach to root, the root of platform
	platformAPI.addToRoot(rootView.node);
	// use rootView to update view using updateView
	return rootView	
}

const updateView = (rootView, updatedView) => {
	// assuming rootView is rendered (has a single child)
	diffAndRender(rootView, rootView.children[0], updatedView)	
}

export { registerPlatformAPI, col, row, text, renderView, updateView, diffAndRender, diffNode, addNode }
