import * as THREE from 'three';

export abstract class GameObject {
	protected container: THREE.Group;
	protected model: THREE.Group;

	constructor(model: THREE.Group, name: string) {
		this.model = model;
		this.container = new THREE.Group();
		this.container.name = name;
		this.container.add(this.model);
	}

	public getObject(): THREE.Group {
		return this.container;
	}

	public setPosition(position: THREE.Vector3): void {
		this.container.position.copy(position);
	}

	public setRotation(rotation: THREE.Euler): void {
		this.container.rotation.copy(rotation);
	}

	public getPosition(): THREE.Vector3 {
		return this.container.position.clone();
	}

	public getRotation(): THREE.Euler {
		return this.container.rotation.clone();
	}

	protected prepareModel(): void {
		// Calculate bounding box after rotation
		const box = new THREE.Box3().setFromObject(this.model);
		const rotatedCenter = new THREE.Vector3();
		box.getCenter(rotatedCenter);

		// Center horizontally and place bottom on ground
		this.model.position.x = -rotatedCenter.x;
		this.model.position.y = -box.min.y;
		this.model.position.z = -rotatedCenter.z;
	}
}

export class PinObject extends GameObject {
	constructor(model: THREE.Group, color: string, instanceId: number) {
		super(model, `${color}Pin_${instanceId}`);
		this.prepareModel();
	}

	protected override prepareModel(): void {
		// Rotate the model to correct orientation
		this.model.rotation.x = -Math.PI / 2;

		super.prepareModel();
	}
}

export class BeamObject extends GameObject {
	constructor(model: THREE.Group) {
		super(model, `Beam_${Math.random().toString(36).substring(2, 15)}`);
		this.prepareModel();
	}

	protected override prepareModel(): void {
		// Rotate the model to correct orientation
		this.model.rotation.x = -Math.PI / 2;
		this.model.rotation.z = +Math.PI / 2;
		this.model.position.y = 113;

		super.prepareModel();
	}
}

export class FloorObject extends GameObject {
	constructor(model: THREE.Group) {
		super(model, `Floor_${Math.random().toString(36).substring(2, 15)}`);
		this.prepareModel();
	}

	protected override prepareModel(): void {}
}

export class WallObject extends GameObject {
	constructor(model: THREE.Group) {
		super(model, `Wall_${Math.random().toString(36).substring(2, 15)}`);
		this.prepareModel();
	}
}

export class CornerObject extends GameObject {
	constructor(model: THREE.Group) {
		super(model, `Corner_${Math.random().toString(36).substring(2, 15)}`);
		this.prepareModel();
	}
}

export class L4StructureObject extends GameObject {
	constructor(model: THREE.Group) {
		super(model, `L4Structure_${Math.random().toString(36).substring(2, 15)}`);
		this.prepareModel();
	}

	protected override prepareModel(): void {
		this.model.rotation.x = -Math.PI / 2;
		// this.model.rotation.z = +Math.PI / 2;
		this.model.position.y = 113;
		super.prepareModel();
	}
}

export class L4BaseObject extends GameObject {
	constructor(model: THREE.Group) {
		super(model, 'L4Base');
		this.prepareModel();
	}

	protected override prepareModel(): void {
		this.model.rotation.y = +Math.PI / 2;
		this.model.position.y = 113;
		super.prepareModel();
	}
}

export class GoalObject extends GameObject {
	constructor(model: THREE.Group, color: string) {
		super(model, `Goal_${color}`);
		this.prepareModel();
	}

	protected override prepareModel(): void {
		this.model.rotation.x = -Math.PI / 2;
		this.model.position.y = 111;
		super.prepareModel();
	}
}

export class Field extends GameObject {
	constructor(model: THREE.Group) {
		super(model, 'Field');
		this.prepareModel();
	}
}
