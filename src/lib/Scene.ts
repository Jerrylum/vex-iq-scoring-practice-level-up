import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import { Field, GameObject, BeanBagObject } from './GameObject';
import { Renderer } from './Renderer';

export type BeanBagColor = 'red' | 'blue' | 'yellow';

const colorName = {
	red: 'Red',
	blue: 'Blue',
	yellow: 'Yellow'
};

const beanBagModelPath: Record<BeanBagColor, string> = {
	red: '/VIQRC-LevelUp-H2H-_-RedBeanBag.glb',
	blue: '/VIQRC-LevelUp-H2H-_-BlueBeanBag.glb',
	yellow: '/VIQRC-LevelUp-H2H-_-YellowBeanBag.glb'
};

export class Scene {
	private renderer: Renderer;
	private modelLoader: ModelLoader;
	private field: Field | null = null;
	private scoringObjects: GameObject[] = [];
	private beanBagCounter: Map<'red' | 'blue' | 'yellow', number> = new Map([
		['red', 0],
		['blue', 0],
		['yellow', 0]
	]);

	constructor(containerId: string) {
		this.renderer = new Renderer(containerId);
		this.modelLoader = new ModelLoader();
	}

	public resize(): void {
		this.renderer.resize();
	}

	public async initialize(): Promise<void> {
		await this.preloadGameObjects();
		await this.loadField();

		const loadingElement = document.getElementById('loading');
		if (loadingElement) {
			loadingElement.style.display = 'none';
		}

		console.log('Scene initialized successfully');
	}

	private async loadField(): Promise<void> {
		await this.addField();

		// TEST ONLY
		this.addBeanBag('red', new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0));

		const maxDim = 1600;

		this.renderer.setCameraView(new THREE.Vector3(0, 1600, 1600), new THREE.Vector3(0, 0, 0));

		this.renderer.camera.near = maxDim * 0.01;
		this.renderer.camera.far = maxDim * 10;
		this.renderer.camera.updateProjectionMatrix();

		console.log('Field loaded');
	}

	private async preloadGameObjects(): Promise<void> {
		await Promise.all([
			this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-FieldElements.glb', 'Field'),
			this.modelLoader.loadModel(beanBagModelPath.red, 'BeanBag Red'),
			this.modelLoader.loadModel(beanBagModelPath.blue, 'BeanBag Blue'),
			this.modelLoader.loadModel(beanBagModelPath.yellow, 'BeanBag Yellow')
		]);

		console.log('All game object models preloaded');
	}

	public async addField(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): Promise<Field> {
		const model = await this.modelLoader.loadModel('/VIQRC-LevelUp-H2H-_-FieldElements.glb', 'Field');
		const field = new Field(model);
		field.setPosition(position);

		this.renderer.scene.add(field.getObject());
		this.field = field;

		console.log('Added field at', position);
		return field;
	}

	public async addBeanBag(
		color: 'red' | 'blue' | 'yellow',
		position: THREE.Vector3,
		rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
	): Promise<BeanBagObject> {
		const model = await this.modelLoader.loadModel(
			beanBagModelPath[color],
			`BeanBag ${colorName[color]}`
		);

		const instanceId = this.beanBagCounter.get(color)!;
		this.beanBagCounter.set(color, instanceId + 1);

		const beanBag = new BeanBagObject(model, color, instanceId);
		beanBag.setPosition(position);
		beanBag.setRotation(rotation);

		this.renderer.scene.add(beanBag.getObject());
		this.scoringObjects.push(beanBag);

		console.log(`Added ${color} bean bag at`, position);
		return beanBag;
	}

	public removeScoringObject(gameObject: GameObject): void {
		this.renderer.scene.remove(gameObject.getObject());
		const index = this.scoringObjects.indexOf(gameObject);
		if (index > -1) {
			this.scoringObjects.splice(index, 1);
		}
	}

	public clearScoringObjects(): void {
		this.scoringObjects.forEach((obj) => {
			this.renderer.scene.remove(obj.getObject());
		});
		this.scoringObjects = [];
		this.beanBagCounter.set('red', 0);
		this.beanBagCounter.set('blue', 0);
		this.beanBagCounter.set('yellow', 0);
	}

	public getScoringObjects(): GameObject[] {
		return [...this.scoringObjects];
	}
}
