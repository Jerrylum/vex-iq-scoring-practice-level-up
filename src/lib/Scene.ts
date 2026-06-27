import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import {
	PinObject,
	BeamObject,
	Field,
	GameObject,
	FloorObject,
	WallObject,
	CornerObject,
	L4StructureObject,
	L4BaseObject,
	GoalObject
} from './GameObject';
import { Renderer } from './Renderer';

export type PinColor = 'red' | 'blue' | 'orange';

const colorName = {
	red: 'Red',
	blue: 'Blue',
	orange: 'Orange'
};

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

		this.addL4Base(new THREE.Vector3(ft / 2, 0, ft));
		this.addL4Base(new THREE.Vector3(-ft / 2, 0, ft));
		this.addL4Base(new THREE.Vector3(ft / 2, 0, -ft));
		this.addL4Base(new THREE.Vector3(-ft / 2, 0, -ft));

		this.addL4Structure(new THREE.Vector3(-ft - 25.4 * 2, 0, ft), new THREE.Euler(0, Math.PI / 2, 0));
		this.addL4Structure(new THREE.Vector3(ft + 25.4 * 2, 0, -ft), new THREE.Euler(0, -Math.PI / 2, 0));

		this.addGoal('red', new THREE.Vector3(-ft * 2 - 92, 0, ft * 3 + 89), new THREE.Euler(0, Math.PI / 2, 0));
		this.addGoal('blue', new THREE.Vector3(ft * 2 + 92, 0, -ft * 3 - 89), new THREE.Euler(0, -Math.PI / 2, 0));

		this.addBeam12x2('blue', new THREE.Vector3(ft * 2.75, 0, ft * 3.5));
		this.addBeam12x2('blue', new THREE.Vector3(ft * 2.25, 0, ft * 3.5));
		this.addBeam12x2('blue', new THREE.Vector3(ft * 1.75, 0, ft * 3.5));
		this.addBeam12x2('red', new THREE.Vector3(ft * 1.25, 0, ft * 3.5));
		this.addBeam12x2('red', new THREE.Vector3(ft * 0.75, 0, ft * 3.5));
		this.addBeam12x2('red', new THREE.Vector3(ft * 0.25, 0, ft * 3.5));
		this.addBeam12x2('red', new THREE.Vector3(-ft * 0.25, 0, ft * 3.5));
		this.addBeam12x2('red', new THREE.Vector3(-ft * 0.75, 0, ft * 3.5));
		this.addBeam10x2('red', new THREE.Vector3(-ft * 1.25 + 10, 0, ft * 3.5));
		this.addBeam12x2Gray(new THREE.Vector3(ft * 1.5, 0, ft * 3.75 + 13), new THREE.Euler(0, -Math.PI, 0));

		this.addBeam12x2Gray(new THREE.Vector3(-ft * 1.5, 0, ft * -3.75 - 13), new THREE.Euler(0, Math.PI, 0));
		this.addBeam10x2('blue', new THREE.Vector3(ft * 1.25 - 10, 0, ft * -3.5), new THREE.Euler(0, -Math.PI, 0));
		this.addBeam12x2('blue', new THREE.Vector3(ft * 0.75, 0, ft * -3.5));
		this.addBeam12x2('blue', new THREE.Vector3(ft * 0.25, 0, ft * -3.5));
		this.addBeam12x2('blue', new THREE.Vector3(-ft * 0.25, 0, ft * -3.5));
		this.addBeam12x2('blue', new THREE.Vector3(-ft * 0.75, 0, ft * -3.5));
		this.addBeam12x2('blue', new THREE.Vector3(-ft * 1.25, 0, ft * -3.5));
		this.addBeam12x2('red', new THREE.Vector3(-ft * 1.75, 0, ft * -3.5));
		this.addBeam12x2('red', new THREE.Vector3(-ft * 2.25, 0, ft * -3.5));
		this.addBeam12x2('red', new THREE.Vector3(-ft * 2.75, 0, ft * -3.5));

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
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Corner.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'Corner'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_L4Structure.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'L4 Structure'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_L4Base.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'L4 Base'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Goal.obj', '/VIQRC-LevelUp-H2H-_-ColorRed.mtl', 'Goal Red'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Goal.obj', '/VIQRC-LevelUp-H2H-_-ColorBlue.mtl', 'Goal Blue'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Beam12x2.obj', '/VIQRC-LevelUp-H2H-_-ColorBlue.mtl', 'Beam12x2 Blue'),
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Beam10x2.obj', '/VIQRC-LevelUp-H2H-_-ColorRed.mtl', 'Beam10x2 Red'),
			this.modelLoader.loadModel(
				'/VIQRC-LevelUp-H2H-_-GameObjects_Beam12x2Gray.obj',
				'/VIQRC-LevelUp-H2H-_-Common.mtl',
				'Beam10x2 Gray'
			)
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

	public async addBeam12x2(
		color: 'red' | 'blue',
		position: THREE.Vector3,
		rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
	): Promise<BeamObject> {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Beam12x2.obj',
			`/VIQRC-LevelUp-H2H-_-Color${colorName[color]}.mtl`,
			`Beam12x2 ${colorName[color]}`
		);

		const beam = new BeamObject(model);
		beam.setPosition(position);
		beam.setRotation(rotation);

		this.renderer.scene.add(beam.getObject());
		this.gameObjects.push(beam);

		console.log(`Added ${color} 12x2 beam at`, position);
		return beam;
	}

	public async addBeam10x2(
		color: 'red' | 'blue',
		position: THREE.Vector3,
		rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
	): Promise<BeamObject> {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Beam10x2.obj',
			`/VIQRC-LevelUp-H2H-_-Color${colorName[color]}.mtl`,
			`Beam10x2 ${colorName[color]}`
		);

		const beam = new BeamObject(model);
		beam.setPosition(position);
		beam.setRotation(rotation);

		this.renderer.scene.add(beam.getObject());
		this.gameObjects.push(beam);

		console.log(`Added ${color} 10x2 beam at`, position);
		return beam;
	}

	public async addBeam12x2Gray(
		position: THREE.Vector3,
		rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
	): Promise<BeamObject> {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Beam12x2Gray.obj',
			'/VIQRC-LevelUp-H2H-_-Common.mtl',
			'Beam10x2 Gray'
		);

		const beam = new BeamObject(model);
		beam.setPosition(position);
		beam.setRotation(rotation);

		this.renderer.scene.add(beam.getObject());
		this.gameObjects.push(beam);

		console.log('Added 10x2 gray beam at', position);
		return beam;
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
		const model = await this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_Wall.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'Wall');
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

	public async addGoal(color: 'red' | 'blue', position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler(0, 0, 0)) {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_Goal.obj',
			`/VIQRC-LevelUp-H2H-_-Color${colorName[color]}.mtl`,
			`Goal ${colorName[color]}`
		);
		const goal = new GoalObject(model, color);
		goal.setPosition(position);
		goal.setRotation(rotation);

		this.renderer.scene.add(goal.getObject());
		this.fieldObjects.push(goal);
		console.log(`Added ${color} goal at`, position);
		return goal;
	}

	public async addL4Base(position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler(0, 0, 0)) {
		const model = await this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-GameObjects_L4Base.obj', '/VIQRC-LevelUp-H2H-_-Common.mtl', 'L4 Base');
		const l4Base = new L4BaseObject(model);
		l4Base.setPosition(position);
		l4Base.setRotation(rotation);

		this.renderer.scene.add(l4Base.getObject());
		this.fieldObjects.push(l4Base);
		console.log('Added L4 base at', position);
		return l4Base;
	}

	public async addL4Structure(position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler(0, 0, 0)) {
		const model = await this.modelLoader.loadModel(
			'/VIQRC-LevelUp-H2H-_-GameObjects_L4Structure.obj',
			'/VIQRC-LevelUp-H2H-_-Common.mtl',
			'L4 Structure'
		);
		const l4Structure = new L4StructureObject(model);
		l4Structure.setPosition(position);
		l4Structure.setRotation(rotation);

		this.renderer.scene.add(l4Structure.getObject());
		this.fieldObjects.push(l4Structure);
		console.log('Added L4 structure at', position);
		return l4Structure;
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
