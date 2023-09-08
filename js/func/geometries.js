
var threedobject = null;
var rootAssemblyName = null
var modelTreeContainer = null;
var intersected = null
function addObjectToScene() {

	reset();
	document.addEventListener("mousemove", mousemoveToHighlight);
	var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const loader = new THREE.GLTFLoader();
	var array = ['../images/Plate.glb'];
	loader.load(array[0], function (obj) {
		threedobject = obj.scene;
		scene.add(obj.scene);

	},
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.log(error);
		}

	);
	onWindowResize();
	scene.add(new THREE.AmbientLight(new THREE.DirectionalLight( 0xffffff, 0.5 )));
}

function initializeTree() {
	modelTreeContainer = document.getElementById("modelTree")
	modelTreeContainer.id = "yash"
	modelTreeContainer.style = "height : auto; overflow: auto;"
	createModelTree(modelTreeContainer, scene.children[1].children[0])
}

function createModelTree(container, rootNode) {

	rootAssemblyName = rootNode.name;
	var rootAssemblyNode = this.getModelTreeListItem(rootNode, "assembly")
	rootAssemblyNode.className = "tree";
	rootAssemblyNode.style = "padding-top: 8px;";
	generateModelTree1(rootNode, rootAssemblyNode.children[0])
	container.appendChild(rootAssemblyNode)
}


function generateModelTree1(sceneObject, parent) {
	for (var i = 0; i < sceneObject.children.length; i++) {
		var child = sceneObject.children[i]
		if (child.type === "Object3D") {
			if (child.children[0] && (child.children[0].type == "Mesh" || child.children[0].type == "Group")) {
				var partNode = this.getModelTreeListItem(child, "part")
				parent.appendChild(partNode);

			} else {
				var asmNode = this.getModelTreeListItem(child, "assembly")
				this.generateModelTree1(child, asmNode.children[0])
				parent.appendChild(asmNode)
			}
		}
	}
}

function getModelTreeListItem(child, nodeType) {
	var nodeName = child.name
	var compId = child.userData.compId
	var text = document.createElement("a");
	text.className = "expand";
	text.innerHTML = nodeName;
	text.compId = compId
	text.style = nodeType == "assembly" ? "font-weight: 600;" : "";

	var checkBox = document.createElement("input");
	checkBox.type = 'checkbox';
	checkBox.checked = child.visible
	checkBox.compId = compId

	checkBox.addEventListener('change', function () {
		var isVisible = event.target.checked;
		child.visible = isVisible
		let selectedItem = document.getElementById(compId)
		if (selectedItem) {
			let listItem = selectedItem.querySelectorAll('input')

			listItem.forEach((element) => {
				element.checked = isVisible
			})
		}
		child.traverse((child) => {
			if (child.type === "Object3D") {
				child.visible = isVisible
				child.userData.hiddenFromModelTree = !isVisible;
			}
		})

		if (isVisible === true) {
			let visibleParents = (node) => {
				if (node.type !== "Scene") {
					node.visible = true;
					let element = document.getElementById(node.userData.compId)
					if (element) {
						let checkBox = element.querySelector('input')
						if (checkBox) { checkBox.checked = isVisible }
					}
					visibleParents(node.parent)
				}
			}

			visibleParents(child.parent);
		}
	});


	var li = document.createElement("li");
	li.setAttribute("nodetype", nodeType);
	li.setAttribute("uuid", child.uuid);
	li.className = nodeName;
	li.id = compId;
	li.appendChild(checkBox)
	li.appendChild(text);

	li.onclick = (event) => {
		if (this.onClick) {
			this.onClick(event);
		}
	};

	text.onmouseenter = (event) => {
		if (this.onMouseEnter) {
			this.onMouseEnter(event);
		}
		let modelTreeText = event.currentTarget.innerHTML;
		let highlightPart = scene.children[1].children[0].getObjectByName(modelTreeText);
		highlightPartUsingCompId(highlightPart.userData.compId)
	};

	text.onmouseout = (event) => {
		if (this.onMouseOut) {
			this.onMouseOut(event);
		}
		removeHighlights()
	};

	text.oncontextmenu = (event) => {
		if (this.onContextMenu) {
			this.onContextMenu(event);
		} else {
			if (event.target.parentNode.getAttribute("nodetype") == "assembly") {
				if (event.target.parentNode.className == rootAssemblyName) {
				} else {
					var contextMenu = new ContextMenu(["Open"])
					contextMenu.setPosition(event.clientX, event.clientY)
					contextMenu.onItemClick = (e) => {
						if (e.target.innerText === "Open") {
							_this.openNode(compId)
							contextMenu.dismiss()
						}
					}
					document.body.appendChild(contextMenu.getElement())
				}
			}
		}
	}

	var node = document.createElement("ul");
	node.setAttribute("nodetype", nodeType);
	node.appendChild(li);

	return node
}

function highlightPartUsingCompId(cId) {
	scene.children[1].children[0].traverse(function (child) {

		if (child.userData.compId === cId) {
			child.traverse(function (mesh) {

				if (mesh instanceof THREE.Mesh) {
					if (mesh.userData.currentMat == undefined) {
						mesh.userData.currentMat = [];
					}

					for (let i = 0; i < mesh.material.length; i++) {

						mesh.userData.currentMat.push(mesh.material[i]);
						let tempMaterial = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide });
						tempMaterial.emissive.setHex('0xfff');
						mesh.material[i] = tempMaterial;

					}
				}
			});
		}
	});
}

function removeHighlights() {
	scene.children[1].children[0].traverse(function (child) {

		if (child instanceof THREE.Mesh && child.userData.currentMat && child.userData.currentMat.length > 0) {

			for (var i = 0; i < child.material.length; i++) {
				child.material[i] = child.userData.currentMat[i];
			}
			child.userData.currentMat = [];
		}
	});
}

function mousemoveToHighlight(event) {

	var intersects = raycasterIntersect(event); //function call that returns intersects

	if (intersects.length > 0) {
		intersected = intersects[0].object
		intersects[0].object.material.color.setHex(0xff0000);
		currentHex = intersects[0].object.material.color.getHex();
		intersects[0].object.material.colorsNeedUpdate = true;

	} else {
		if (intersected) {
			var a = new THREE.Color(currentHex);
			intersected.material.color.setRGB(a);
			intersected.material.colorsNeedUpdate = true;
		}
	}

}

function raycasterIntersect(event) {

	event.preventDefault();
	mouse.x = ((event.clientX - container.offsetLeft) / container.clientWidth) * 2 - 1;
	mouse.y = -((event.clientY - container.offsetTop) / container.clientHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(scene.children[1].children[0].children[0].children);   // an array containing all objects in the scene with which the ray intersects
	return intersects;
}




