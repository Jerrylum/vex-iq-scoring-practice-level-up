import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Renderer {
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls: OrbitControls;
	private container: HTMLElement;

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

		// Initialize renderer with standard settings
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(width, height);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.container.appendChild(this.renderer.domElement);

		// Initialize OrbitControls for mouse camera control
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		this.controls.screenSpacePanning = false;
		this.controls.minDistance = 10;
		this.controls.maxDistance = 2000;
		this.controls.maxPolarAngle = Math.PI;

		// Add lights
		this.setupLights();

		// Handle window resize
		window.addEventListener('resize', () => this.onWindowResize());

		// Start render loop
		this.animate();
	}

	private setupLights(): void {
		// Ambient light for general illumination
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		this.scene.add(ambientLight);

		// Main directional light
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(100, 100, 50);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		this.scene.add(directionalLight);

		// Fill lights for better model visibility
		const light1 = new THREE.DirectionalLight(0xffffff, 0.4);
		light1.position.set(-100, 50, -50);
		this.scene.add(light1);

		const light2 = new THREE.DirectionalLight(0xffffff, 0.3);
		light2.position.set(0, -50, 100);
		this.scene.add(light2);
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
