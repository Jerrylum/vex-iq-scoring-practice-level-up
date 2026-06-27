import * as THREE from 'three';
import { Structure, ScoringObject, Beam, Pin } from '../ScoringObject';
import type { Scene } from '../Scene';
import { mulberry32 } from '../utils';
import { isStack, isStackMatchingGoal, isThreeColorStack, isTwoColorStack, type StructureScoring } from '../Scoring';

export class FloorGoalStructure extends Structure {
	public readonly theCase: FloorGoalCase;
	public readonly randomSeed: number;

	constructor(theCase: FloorGoalCase, randomSeed: number) {
		super();
		this.theCase = theCase;
		this.randomSeed = randomSeed;
	}

	public getElements(): ScoringObject[] {
		return [
			...(this.theCase.getTopLeftColumn() ?? []),
			...(this.theCase.getTopRightColumn() ?? []),
			...(this.theCase.getBottomLeftColumn() ?? []),
			...(this.theCase.getBottomRightColumn() ?? [])
		];
	}
	public getScoring(): StructureScoring {
		return this.theCase.getScoring();
	}
	public visualize(scene: Scene): Promise<void> {
		return this.theCase.visualize(scene, this);
	}
}

export abstract class FloorGoalCase {
	public abstract getTopLeftColumn(): Pin[] | null;
	public abstract isTopLeftColumnWithinArea(): boolean;
	public abstract getTopRightColumn(): Pin[] | null;
	public abstract isTopRightColumnWithinArea(): boolean;
	public abstract getBottomLeftColumn(): Pin[] | null;
	public abstract isBottomLeftColumnWithinArea(): boolean;
	public abstract getBottomRightColumn(): Pin[] | null;
	public abstract isBottomRightColumnWithinArea(): boolean;
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: FloorGoalStructure): Promise<void>;
}

export class FloorGoalEmptyCase extends FloorGoalCase {
	public getTopLeftColumn(): Pin[] | null {
		return null;
	}
	public isTopLeftColumnWithinArea(): boolean {
		return false;
	}
	public getTopRightColumn(): Pin[] | null {
		return null;
	}
	public isTopRightColumnWithinArea(): boolean {
		return false;
	}
	public getBottomLeftColumn(): Pin[] | null {
		return null;
	}
	public isBottomLeftColumnWithinArea(): boolean {
		return false;
	}
	public getBottomRightColumn(): Pin[] | null {
		return null;
	}
	public isBottomRightColumnWithinArea(): boolean {
		return false;
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
	public visualize(scene: Scene, structure: FloorGoalStructure): Promise<void> {
		return Promise.resolve();
	}
}

export class FloorGoalWithColumnsCase extends FloorGoalCase {
	private readonly topLeftColumn: Pin[];
	private readonly _isTopLeftColumnWithinArea: boolean;
	private readonly topRightColumn: Pin[];
	private readonly _isTopRightColumnWithinArea: boolean;
	private readonly bottomLeftColumn: Pin[];
	private readonly _isBottomLeftColumnWithinArea: boolean;
	private readonly bottomRightColumn: Pin[];
	private readonly _isBottomRightColumnWithinArea: boolean;

	constructor(
		topLeftColumn: Pin[],
		isTopLeftColumnWithinArea: boolean,
		topRightColumn: Pin[],
		isTopRightColumnWithinArea: boolean,
		bottomLeftColumn: Pin[],
		isBottomLeftColumnWithinArea: boolean,
		bottomRightColumn: Pin[],
		isBottomRightColumnWithinArea: boolean
	) {
		super();
		this.topLeftColumn = topLeftColumn;
		this._isTopLeftColumnWithinArea = isTopLeftColumnWithinArea;
		this.topRightColumn = topRightColumn;
		this._isTopRightColumnWithinArea = isTopRightColumnWithinArea;
		this.bottomLeftColumn = bottomLeftColumn;
		this._isBottomLeftColumnWithinArea = isBottomLeftColumnWithinArea;
		this.bottomRightColumn = bottomRightColumn;
		this._isBottomRightColumnWithinArea = isBottomRightColumnWithinArea;
	}

	public getTopLeftColumn(): Pin[] | null {
		return this.topLeftColumn;
	}
	public isTopLeftColumnWithinArea(): boolean {
		return this._isTopLeftColumnWithinArea;
	}
	public getTopRightColumn(): Pin[] | null {
		return this.topRightColumn;
	}
	public isTopRightColumnWithinArea(): boolean {
		return this._isTopRightColumnWithinArea;
	}
	public getBottomLeftColumn(): Pin[] | null {
		return this.bottomLeftColumn;
	}
	public isBottomLeftColumnWithinArea(): boolean {
		return this._isBottomLeftColumnWithinArea;
	}
	public getBottomRightColumn(): Pin[] | null {
		return this.bottomRightColumn;
	}
	public isBottomRightColumnWithinArea(): boolean {
		return this._isBottomRightColumnWithinArea;
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins:
				(isStack(this.topLeftColumn) ? this.topLeftColumn.length : 0) +
				(isStack(this.topRightColumn) ? this.topRightColumn.length : 0) +
				(isStack(this.bottomLeftColumn) ? this.bottomLeftColumn.length : 0) +
				(isStack(this.bottomRightColumn) ? this.bottomRightColumn.length : 0),
			connectedBeams: 0,
			twoColorStacks:
				(isTwoColorStack(this.topLeftColumn) ? 1 : 0) +
				(isTwoColorStack(this.topRightColumn) ? 1 : 0) +
				(isTwoColorStack(this.bottomLeftColumn) ? 1 : 0) +
				(isTwoColorStack(this.bottomRightColumn) ? 1 : 0),
			threeColorStacks:
				(isThreeColorStack(this.topLeftColumn) ? 1 : 0) +
				(isThreeColorStack(this.topRightColumn) ? 1 : 0) +
				(isThreeColorStack(this.bottomLeftColumn) ? 1 : 0) +
				(isThreeColorStack(this.bottomRightColumn) ? 1 : 0),
			matchingGoals:
				(isStackMatchingGoal(this.topLeftColumn, 'orange') && this.isTopLeftColumnWithinArea() ? 1 : 0) +
				(isStackMatchingGoal(this.topRightColumn, 'orange') && this.isTopRightColumnWithinArea() ? 1 : 0) +
				(isStackMatchingGoal(this.bottomLeftColumn, 'orange') && this.isBottomLeftColumnWithinArea() ? 1 : 0) +
				(isStackMatchingGoal(this.bottomRightColumn, 'orange') && this.isBottomRightColumnWithinArea() ? 1 : 0),
			stacksPlacedOnStandoffGoal: 0
		};
	}

	public async visualize(scene: Scene, structure: FloorGoalStructure): Promise<void> {
		// random generator
		const random = mulberry32(structure.randomSeed);

		let y = -114;
		let a = this.isTopLeftColumnWithinArea() ? -2 : 1;
		let b = random() * 10 * a;
		let c = random() * 10 * a;

		for (const pin of this.topLeftColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(-115 - b, y, 115 + c), new THREE.Euler(0, 90, 0));
			y += 60;
		}

		y = -114;
		a = this.isTopRightColumnWithinArea() ? -2 : 1;
		b = random() * 10 * a;
		c = random() * 10 * a;

		for (const pin of this.topRightColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(-115 - b, y, -115 - c), new THREE.Euler(0, 90, 0));
			y += 60;
		}

		y = -114;
		a = this.isBottomLeftColumnWithinArea() ? -2 : 1;
		b = random() * 10 * a;
		c = random() * 10 * a;

		for (const pin of this.bottomLeftColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(115 + b, y, 115 + c), new THREE.Euler(0, 90, 0));
			y += 60;
		}

		y = -114;
		a = this.isBottomRightColumnWithinArea() ? -2 : 1;
		b = random() * 10 * a;
		c = random() * 10 * a;

		for (const pin of this.bottomRightColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(115 + b, y, -115 - c), new THREE.Euler(0, 90, 0));
			y += 60;
		}
	}
}
