import * as THREE from 'three';
import { Structure, ScoringObject, Pin } from '../ScoringObject';
import type { Scene } from '../Scene';
import { isStack, isStackMatchingGoal, isThreeColorStack, isTwoColorStack, type StructureScoring } from '../Scoring';
import { mulberry32 } from '../utils';

export class RedTriangleGoal extends Structure {
	public readonly theCase: RedTriangleGoalCase;
	public readonly randomSeed: number;

	constructor(theCase: RedTriangleGoalCase, randomSeed: number) {
		super();
		this.theCase = theCase;
		this.randomSeed = randomSeed;
	}

	public getElements(): ScoringObject[] {
		return this.theCase.getElements();
	}

	public getScoring(): StructureScoring {
		return this.theCase.getScoring();
	}

	public visualize(scene: Scene): Promise<void> {
		return this.theCase.visualize(scene, this);
	}
}

export abstract class RedTriangleGoalCase {
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: RedTriangleGoal): Promise<void>;
}

export class RedTriangleGoalEmptyCase extends RedTriangleGoalCase {
	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins: 0,
			connectedBeams: 0,
			twoColorStacks: 0,
			threeColorStacks: 0,
			matchingGoals: 0,
			stacksPlacedOnStandoffGoal: 0
		};
	}
	public visualize(scene: Scene): Promise<void> {
		return Promise.resolve();
	}
}

export class RedTriangleGoalWithColumnsCase extends RedTriangleGoalCase {
	private readonly column1: Pin[];
	private readonly column2: Pin[];
	private readonly column3: Pin[];

	constructor(column1: Pin[], column2: Pin[], column3: Pin[]) {
		super();
		if (column1.length === 0 && column2.length === 0 && column3.length === 0) {
			throw new Error('Columns must have at least 1 pin');
		}
		this.column1 = column1;
		this.column2 = column2;
		this.column3 = column3;
	}

	public getElements(): ScoringObject[] {
		return [...this.column1, ...this.column2, ...this.column3];
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins:
				(isStack(this.column1) ? this.column1.length : 0) +
				(isStack(this.column2) ? this.column2.length : 0) +
				(isStack(this.column3) ? this.column3.length : 0),
			connectedBeams: 0,
			twoColorStacks:
				(isTwoColorStack(this.column1) ? 1 : 0) + (isTwoColorStack(this.column2) ? 1 : 0) + (isTwoColorStack(this.column3) ? 1 : 0),
			threeColorStacks:
				(isThreeColorStack(this.column1) ? 1 : 0) + (isThreeColorStack(this.column2) ? 1 : 0) + (isThreeColorStack(this.column3) ? 1 : 0),
			matchingGoals:
				(isStackMatchingGoal(this.column1, 'red') ? 1 : 0) +
				(isStackMatchingGoal(this.column2, 'red') ? 1 : 0) +
				(isStackMatchingGoal(this.column3, 'red') ? 1 : 0),
			stacksPlacedOnStandoffGoal: 0
		};
	}

	public async visualize(scene: Scene, structure: RedTriangleGoal): Promise<void> {
		const random = mulberry32(structure.randomSeed);
		const dx = random() * 10;
		const dz = random() * 10;

		let y = -114;
		for (const pin of this.column1) {
			await scene.addPin(pin.color, new THREE.Vector3(880 + dx, y, 1180 + dz), new THREE.Euler(0, 0, 0));
			y += 60;
		}

		y = -114;
		for (const pin of this.column2) {
			await scene.addPin(pin.color, new THREE.Vector3(790 + dx, y, 1180 + dz), new THREE.Euler(0, 0, 0));
			y += 60;
		}

		y = -114;
		for (const pin of this.column3) {
			await scene.addPin(pin.color, new THREE.Vector3(880 + dx, y, 1090 + dz), new THREE.Euler(0, 0, 0));
			y += 60;
		}
	}
}
