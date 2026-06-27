import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import {
	PinObject,
	BeamObject,
	Field,
	GameObject,
	FloorObject,
	WallObject,
	CornerObject
} from './GameObject';
import { Renderer } from './Renderer';

export type PinColor = 'red' | 'blue' | 'orange';

export class Scene {
	private renderer: Renderer;
	private modelLoader: ModelLoader;
	private field: Field | null = null;
	private fieldObjects: GameObject[] = [];
	private gameObjects: GameObject[] = [];
	private pinCounter: Map<PinColor, number> = new Map([
		['red', 0],
		['blue', 0],
		['orange', 0]
	]);
	private beamCounter: number = 0;

	constructor(containerId: string) {
		this.renderer = new Renderer(containerId);
		this.modelLoader = new ModelLoader();
	}

	public resize(): void {
		// Trigger renderer resize when container dimensions change
		this.renderer.resize();
	}

	public async initialize(): Promise<void> {
		// Pre-load all game object models
		await this.preloadGameObjects();

		// Load the field
		await this.loadField();

		// Hide loading message
		const loadingElement = document.getElementById('loading');
		if (loadingElement) {
			loadingElement.style.display = 'none';
		}

		console.log('Scene initialized successfully');
	}

	private async loadField(): Promise<void> {
		const ft = 12 * 25.4;
		const ox = -2.5 * ft;
		const oz = -3.5 * ft;
		for (let x = 0; x < 6; x++) {
			for (let z = 0; z < 8; z++) {
				this.addFloor(new THREE.Vector3(ox + x * ft, -120, oz + z * ft));
			}
		}

		this.addWall(new THREE.Vector3(ox + 0.5 * ft, -126, oz - 0.5 * ft - 16), 180);
		this.addWall(new THREE.Vector3(ox + 1.5 * ft, -126, oz - 0.5 * ft - 16), 180);
		this.addWall(new THREE.Vector3(ox + 2.5 * ft, -126, oz - 0.5 * ft - 16), 180);
		this.addWall(new THREE.Vector3(ox + 3.5 * ft, -126, oz - 0.5 * ft - 16), 180);
		this.addWall(new THREE.Vector3(ox + 4.5 * ft, -126, oz - 0.5 * ft - 16), 180);

		this.addWall(new THREE.Vector3(ox + 0.5 * ft, -126, oz + 7.5 * ft + 16), 0);
		this.addWall(new THREE.Vector3(ox + 1.5 * ft, -126, oz + 7.5 * ft + 16), 0);
		this.addWall(new THREE.Vector3(ox + 2.5 * ft, -126, oz + 7.5 * ft + 16), 0);
		this.addWall(new THREE.Vector3(ox + 3.5 * ft, -126, oz + 7.5 * ft + 16), 0);
		this.addWall(new THREE.Vector3(ox + 4.5 * ft, -126, oz + 7.5 * ft + 16), 0);

		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 6.5 * ft), 90);
		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 5.5 * ft), 90);
		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 4.5 * ft), 90);
		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 3.5 * ft), 90);
		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 2.5 * ft), 90);
		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 1.5 * ft), 90);
		this.addWall(new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 0.5 * ft), 90);

		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 6.5 * ft), 270);
		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 5.5 * ft), 270);
		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 4.5 * ft), 270);
		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 3.5 * ft), 270);
		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 2.5 * ft), 270);
		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 1.5 * ft), 270);
		this.addWall(new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 0.5 * ft), 270);

		this.addCorner(new THREE.Vector3(-2.75 * ft - 20, -126, -3.75 * ft - 20), 180);
		this.addCorner(new THREE.Vector3(+2.75 * ft + 20, -126, -3.75 * ft - 20), 90);
		this.addCorner(new THREE.Vector3(-2.75 * ft - 20, -126, +3.75 * ft + 20), 270);
		this.addCorner(new THREE.Vector3(+2.75 * ft + 20, -126, +3.75 * ft + 20), 0);

		// TODO: Level Up field elements

		const maxDim = 1600;

		this.renderer.setCameraView(new THREE.Vector3(1600, 1600, 0), new THREE.Vector3(0, 0, 0));

		// Update camera planes
		this.renderer.camera.near = maxDim * 0.01;
		this.renderer.camera.far = maxDim * 10;
		this.renderer.camera.updateProjectionMatrix();

		console.log('Field loaded');
	}

	private async preloadGameObjects(): Promise<void> {
		await Promise.all([
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Floor.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'Floor'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Wall.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'Wall'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Corner.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'Corner')
		]);

		console.log('All game object models preloaded');
	}

	public async addPin(color: PinColor, position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler(0, 0, 0)): Promise<PinObject> {
		// TODO: Level Up pin assets
		throw new Error('Not implemented: Level Up pin assets');
	}

	public async addBeam(position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler(0, 0, 0)): Promise<BeamObject> {
		// TODO: Level Up beam assets
		throw new Error('Not implemented: Level Up beam assets');
	}

	public async addFloor(position: THREE.Vector3) {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Floor.obj',
			'/VIQRC-LevelUp-H2H-_-Common.mtl',
			'Floor'
		);

		const floor = new FloorObject(model);
		floor.setPosition(position);
		floor.setRotation(new THREE.Euler(0, 0, 0));

		this.renderer.scene.add(floor.getObject());
		this.fieldObjects.push(floor);

		console.log('Added floor at', position);
		return floor;
	}

	public async addWall(position: THREE.Vector3, rotation: number) {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Wall.obj',
			'/VIQRC-LevelUp-H2H-_-Common.mtl',
			'Wall'
		);
		const wall = new WallObject(model);
		wall.setPosition(position);
		wall.setRotation(new THREE.Euler(0, (rotation * Math.PI) / 180, 0));

		this.renderer.scene.add(wall.getObject());
		this.fieldObjects.push(wall);
		console.log('Added wall at', position);
		return wall;
	}

	public async addCorner(position: THREE.Vector3, rotation: number) {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Corner.obj',
			'/VIQRC-LevelUp-H2H-_-Common.mtl',
			'Corner'
		);
		const corner = new CornerObject(model);
		corner.setPosition(position);
		corner.setRotation(new THREE.Euler(0, (rotation * Math.PI) / 180, 0));

		this.renderer.scene.add(corner.getObject());
		this.fieldObjects.push(corner);
		console.log('Added corner at', position);
		return corner;
	}

	public async addFloorGoalSheet(position: THREE.Vector3, rotation: number) {
		// TODO: Level Up floor goal sheet assets
		throw new Error('Not implemented: Level Up floor goal sheet assets');
	}

	public async addStandoffGoal(position: THREE.Vector3, rotation: number) {
		// TODO: Level Up standoff goal assets
		throw new Error('Not implemented: Level Up standoff goal assets');
	}

	public async addLoadZone(color: PinColor, position: THREE.Vector3, rotation: number) {
		// TODO: Level Up load zone assets
		throw new Error('Not implemented: Level Up load zone assets');
	}

	public async addStartingPinSupport(color: PinColor, position: THREE.Vector3, rotation: number) {
		// TODO: Level Up starting pin support assets
		throw new Error('Not implemented: Level Up starting pin support assets');
	}

	public async addTriangleGoal(color: PinColor, position: THREE.Vector3, rotation: number) {
		// TODO: Level Up triangle goal assets
		throw new Error('Not implemented: Level Up triangle goal assets');
	}

	public async addSquareGoal(color: PinColor, position: THREE.Vector3, rotation: number) {
		// TODO: Level Up square goal assets
		throw new Error('Not implemented: Level Up square goal assets');
	}

	public removeGameObject(gameObject: GameObject): void {
		this.renderer.scene.remove(gameObject.getObject());
		const index = this.gameObjects.indexOf(gameObject);
		if (index > -1) {
			this.gameObjects.splice(index, 1);
		}
	}

	public clearGameObjects(): void {
		this.gameObjects.forEach((obj) => {
			this.renderer.scene.remove(obj.getObject());
		});
		this.gameObjects = [];
		this.pinCounter.set('red', 0);
		this.pinCounter.set('blue', 0);
		this.pinCounter.set('orange', 0);
		this.beamCounter = 0;
	}

	public getGameObjects(): GameObject[] {
		return [...this.gameObjects];
	}
}
