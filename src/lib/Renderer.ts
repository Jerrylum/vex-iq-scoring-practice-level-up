import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class Renderer {
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls: OrbitControls;
	private container: HTMLElement;
	private pmremGenerator: THREE.PMREMGenerator;

	constructor(containerId: string) {
		this.container = document.getElementById(containerId)!;

		// Initialize scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x2a2a2a);

		// Initialize camera
		const width = this.container.clientWidth;
		const height = this.container.clientHeight;
		this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
		this.camera.position.set(100, 100, 100);

		// Initialize renderer with PBR-friendly output
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(width, height);
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 0.2;
		this.renderer.shadowMap.enabled = false;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.container.appendChild(this.renderer.domElement);

		this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
		this.pmremGenerator.compileEquirectangularShader();

		// Initialize OrbitControls for mouse camera control
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		this.controls.screenSpacePanning = false;
		this.controls.minDistance = 10;
		this.controls.maxDistance = 2000;
		this.controls.maxPolarAngle = Math.PI;

		this.setupEnvironment();

		// Handle window resize
		window.addEventListener('resize', () => this.onWindowResize());

		// Start render loop
		this.animate();
	}

	private setupEnvironment(): void {
		const environment = new RoomEnvironment();
		const envMap = this.pmremGenerator.fromScene(environment).texture;
		this.scene.environment = envMap;
		environment.removeFromParent();
	}

	public setCameraView(position: THREE.Vector3, target: THREE.Vector3): void {
		this.camera.position.copy(position);
		this.camera.lookAt(target);
		this.controls.target.copy(target);
		this.controls.update();
	}

	private onWindowResize(): void {
		const width = this.container.clientWidth;
		const height = this.container.clientHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(width, height);
	}

	public resize(): void {
		// Public method to manually trigger resize (e.g., when panel is collapsed/expanded)
		this.onWindowResize();
	}

	private animate(): void {
		requestAnimationFrame(() => this.animate());

		// Update controls (handles damping)
		this.controls.update();

		// Render the scene
		this.renderer.render(this.scene, this.camera);
	}
}
