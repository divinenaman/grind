import { col, row, text, diffNode, diffAndRender, addNode, updateView, renderView, registerPlatformAPI } from "./simple-dom.mjs";

var counter = 0;

const mockPlatformAPI = {
	createNode(type) {
		console.log("platformAPI: creating node -> ", type);
		counter += 1;
		return { type, id: counter, children: [], props: {} }
	},
	removeNode(parentNode, pos, node) {
		console.log("platformAPI: removing node -> ", node.id)

		while (node.children.length > 0) {
			this.removeNode(node, 0, node.children[0]);
		}
		parentNode.children.splice(pos, 1);

	},
	addProps(node, keys, values) {
		keys.forEach(k => {
			node.props[k] = values[k]
		});
	},
	removeProps(node, keys) {
		keys.forEach(k => {
			delete node.props[k]
		});
	},
	addToParent(parentNode, childNode, pos = -1) {
		if (pos == -1) {
			parentNode.children.push(childNode)
		} else {
			parentNode.children.splice(pos, 0, childNode)
		}
	},
	addToRoot(node) {
		console.log("platformAPI: attached to root -> ", node.id);
	}
}

registerPlatformAPI(mockPlatformAPI);

// Created View
const texts1 = [ text("Hi!"), text("How are you?") ];
const view1 = col({ width: "100" }, texts1);

const texts2 = [ text("Hello!"), text("How are you?"), text("How's the weather ?") ];
const view2 = col({ width: "100", height: "120" }, texts2);


// diff test
const diff = diffNode(view1, view2);
console.log("\n##### Diff Test #####\n", diff, "\n##### End #####\n")


// diff & render test
const parentView = addNode(null, -1, view1);

console.log("#####");
console.log(parentView);
console.log("#####");

console.log("#####");
// test add-child, update-child, add-prop
diffAndRender(parentView, view1, view2)
console.log(parentView.node.children[0]);
console.log("#####");

console.log("#####");
// test replace view
const view3 = row({ width: "100", height: "120" }, texts2);
diffAndRender(parentView, view2, view3);
console.log(parentView.node.children[0]);
console.log("#####");


// test render-view, update-view
const v1 = col({ width: "200", height: "400" }, []);
const rootView = renderView(v1);
console.log("renderView -> \n", rootView, "\n")

const v2 = row({ width: "200", height: "500" }, [text("HI!!!!")])
updateView(rootView, v2);
console.log("updateView -> \n", rootView, "\n")
