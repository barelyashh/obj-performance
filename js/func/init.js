

/* global variables */
var scene, camera, renderer,container, scene2, camera2, renderer2,container2, controlsT, controlsD,
    mouse, raycaster, intersected, light,texture, description, userguide, boxHelper,
     intersect, currentHex, materialIndex , stats;


description = document.getElementById('description');
userguide = document.getElementById('userguide');

var widthO = 1116;
var heightO = 657;
var width2 = 200;
var height2 = 200;


init();
animate();

/* Initial function that will be used to render our scene. */

function init() {

	container = document.getElementById('canvas');
	document.body.appendChild(container);

	//renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.powerPreference= "high-performance" ;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(widthO, heightO);
	container.appendChild(renderer.domElement);

	//scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xe5e5e5);
	mouse = new THREE.Vector3();
	raycaster = new THREE.Raycaster();

	//camera
	camera = new THREE.PerspectiveCamera(70, widthO / heightO, 2, 10000);
	camera.position.set(-14, 15, 15);
	camera.lookAt(scene.position)
	scene.add(camera);

	/* --------------------- */
	stats = new Stats();
	stats.domElement.style.marginLeft = '250px';
	stats.showPanel( 0 );
	/* --------------------- */  
    container.appendChild( stats.dom );
	

	/* scene.overrideMaterial =  new THREE.MeshBasicMaterial({ color: 0x444444}); */
	//TrackballControls
	controlsT = new THREE.TrackballControls(camera, renderer.domElement);

	//Window Resize Event
	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();
	

}


//window resize function
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

}

/* This function is used to clear mesh objects from the scene after button click */

function reset() {

	camera.position.set(0, 0, 6500);
	scene.add(camera);
	while (scene.children[0]) {
		scene.remove(scene.children[0]);
	}
	controlsT.reset();
	renderer.setSize(widthO, heightO);

}

/* animate loop that draws the scene every time the screen is refreshed */

function animate() {

	requestAnimationFrame(animate);
	controlsT.update();
	stats.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}




/* 





description = document.getElementById('description');
userguide = document.getElementById('userguide');

var widthO = 1116;
var heightO = 657;
var width2 = 200;
var height2 = 200;

let cameraPersp, cameraOrtho, currentCamera;
			let scene, renderer, control, orbit;

			init();
			render();

			function init() {

				container = document.getElementById('canvas');
				document.body.appendChild(container);
				
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( widthO, heightO );
				document.body.appendChild( renderer.domElement );

				cameraPersp = new THREE.PerspectiveCamera( 50,  widthO / heightO, 1, 10000 );
				cameraOrtho = new THREE.OrthographicCamera( - 600 *  widthO / heightO,  600 *  widthO / heightO, 600, - 600, 0.01, 30000 );
				currentCamera = cameraPersp;

				currentCamera.position.set( 0, 0, 10 );
				currentCamera.lookAt( scene.position);

				
				scene.add( new THREE.GridHelper( 1000, 10, 0x888888, 0x444444 ) );

				const light = new THREE.DirectionalLight( 0xffffff, 2 );
				light.position.set( 1, 1, 1 );
				scene.add( light );

 				const texture = new THREE.TextureLoader().load( 'textures/crate.gif', render );
				texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); 

				const geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
				const material = new THREE.MeshLambertMaterial( );

				orbit = new THREE.OrbitControls( currentCamera, renderer.domElement );
				orbit.update();
				orbit.addEventListener( 'change', render );

				control = new THREE.TransformControls( currentCamera, renderer.domElement );
				control.addEventListener( 'change', render );

				control.addEventListener( 'dragging-changed', function ( event ) {

					orbit.enabled = ! event.value;

				} );

				const mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				control.attach( mesh );
				scene.add( control );

				window.addEventListener( 'resize', onWindowResize, false );

				window.addEventListener( 'keydown', function ( event ) {

					switch ( event.keyCode ) {

						case 81: // Q
							control.setSpace( control.space === "local" ? "world" : "local" );
							break;

						case 16: // Shift
							control.setTranslationSnap( 100 );
							control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
							control.setScaleSnap( 0.25 );
							break;

						case 87: // W
							control.setMode( "translate" );
							break;

						case 69: // E
							control.setMode( "rotate" );
							break;

						case 82: // R
							control.setMode( "scale" );
							break;

						case 67: // C
							const position = currentCamera.position.clone();

							currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
							currentCamera.position.copy( position );

							orbit.object = currentCamera;
							control.camera = currentCamera;

							currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
							onWindowResize();
							break;

						case 86: // V
							const randomFoV = Math.random() + 0.1;
							const randomZoom = Math.random() + 0.1;

							cameraPersp.fov = randomFoV * 160;
							cameraOrtho.bottom = - randomFoV * 500;
							cameraOrtho.top = randomFoV * 500;

							cameraPersp.zoom = randomZoom * 5;
							cameraOrtho.zoom = randomZoom * 5;
							onWindowResize();
							break;

						case 187:
						case 107: // +, =, num+
							control.setSize( control.size + 0.1 );
							break;

						case 189:
						case 109: // -, _, num-
							control.setSize( Math.max( control.size - 0.1, 0.1 ) );
							break;

						case 88: // X
							control.showX = ! control.showX;
							break;

						case 89: // Y
							control.showY = ! control.showY;
							break;

						case 90: // Z
							control.showZ = ! control.showZ;
							break;

						case 32: // Spacebar
							control.enabled = ! control.enabled;
							break;

					}

				} );

				window.addEventListener( 'keyup', function ( event ) {

					switch ( event.keyCode ) {

						case 16: // Shift
							control.setTranslationSnap( null );
							control.setRotationSnap( null );
							control.setScaleSnap( null );
							break;

					}

				} );

			}

			function onWindowResize() {

				const aspect = window.innerWidth / window.innerHeight;

				cameraPersp.aspect = aspect;
				cameraPersp.updateProjectionMatrix();

				cameraOrtho.left = cameraOrtho.bottom * aspect;
				cameraOrtho.right = cameraOrtho.top * aspect;
				cameraOrtho.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			function render() {

				renderer.render( scene, currentCamera );

			}
 */