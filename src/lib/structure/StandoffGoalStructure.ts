import * as THREE from 'three';
import { Structure, ScoringObject, Beam, Pin } from '../ScoringObject';
import type { Scene } from '../Scene';
import { isStack, isStackMatchingGoal, isThreeColorStack, isTwoColorStack, type StructureScoring } from '../Scoring';

export class StandoffGoalStructure extends Structure {
	public readonly theCase: StandoffGoalCase;
	public readonly rotation: number;

	constructor(theCase: StandoffGoalCase, rotation: number) {
		super();
		this.theCase = theCase;
		this.rotation = rotation;
	}

	public getElements(): ScoringObject[] {
		return [
			...(this.theCase.getBottomColumn() ?? []),
			...(this.theCase.getTopLeftColumn() ?? []),
			...(this.theCase.getTopRightColumn() ?? []),
			...(this.theCase.getBeam() ? [this.theCase.getBeam()!] : [])
		];
	}

	public getScoring(): StructureScoring {
		return this.theCase.getScoring();
	}

	public async visualize(scene: Scene): Promise<void> {
		await this.theCase.visualize(scene, this);
	}
}
export abstract class StandoffGoalCase {
	public abstract getBottomColumn(): Pin[] | null;
	public abstract getTopLeftColumn(): Pin[] | null;
	public abstract getTopRightColumn(): Pin[] | null;
	public abstract getBeam(): Beam | null;
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: StandoffGoalStructure): Promise<void>;
}

export class StandoffGoalEmptyCase extends StandoffGoalCase {
	private readonly beam: Beam = new Beam();

	public getBottomColumn(): Pin[] | null {
		return null;
	}

	public getTopLeftColumn(): Pin[] | null {
		return null;
	}

	public getTopRightColumn(): Pin[] | null {
		return null;
	}

	public getBeam(): Beam | null {
		return this.beam;
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

	public async visualize(scene: Scene, structure: StandoffGoalStructure): Promise<void> {
		// do nothing

		// add beam on the floor
		await scene.addBeam(new THREE.Vector3(-300, -114, 0), new THREE.Euler(0, (structure.rotation * Math.PI) / 180, 0));
	}
}

export class StandoffGoalOnlyBeamPlacedCase extends StandoffGoalCase {
	private readonly beam: Beam = new Beam();

	public getBottomColumn(): Pin[] | null {
		return null;
	}

	public getTopLeftColumn(): Pin[] | null {
		return null;
	}

	public getTopRightColumn(): Pin[] | null {
		return null;
	}

	public getBeam(): Beam | null {
		return this.beam;
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins: 0,
			connectedBeams: 1,
			twoColorStacks: 0,
			threeColorStacks: 0,
			matchingGoals: 0,
			stacksPlacedOnStandoffGoal: 0
		};
	}

	public async visualize(scene: Scene, structure: StandoffGoalStructure): Promise<void> {
		await scene.addBeam(new THREE.Vector3(0, 74, 0), new THREE.Euler(0, (structure.rotation * Math.PI) / 180, 0));
	}
}

export class StandoffGoalOneColumnCase extends StandoffGoalCase {
	private readonly column: Pin[];
	private readonly beam: Beam = new Beam();

	constructor(column: Pin[]) {
		super();
		if (column.length === 0) {
			throw new Error('Column must have at least 1 pin');
		}
		this.column = column;
	}

	public getBottomColumn(): Pin[] | null {
		return this.column;
	}

	public getTopLeftColumn(): Pin[] | null {
		return null;
	}

	public getTopRightColumn(): Pin[] | null {
		return null;
	}

	public getBeam(): Beam | null {
		return this.beam;
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins: isStack(this.column) ? this.column.length : 0,
			connectedBeams: 0,
			twoColorStacks: isTwoColorStack(this.column) ? 1 : 0,
			threeColorStacks: isThreeColorStack(this.column) ? 1 : 0,
			matchingGoals: isStackMatchingGoal(this.column, 'orange') ? 1 : 0,
			stacksPlacedOnStandoffGoal: isStack(this.column) ? 1 : 0
		};
	}

	public async visualize(scene: Scene, structure: StandoffGoalStructure): Promise<void> {
		let y = 74;

		// add beam on the floor
		await scene.addBeam(new THREE.Vector3(-300, -114, 0), new THREE.Euler(0, (structure.rotation * Math.PI) / 180, 0));

		for (const pin of this.column) {
			await scene.addPin(pin.color, new THREE.Vector3(0, y, 0), new THREE.Euler(0, 0, 0));
			y += 60;
		}
	}
}

export class StandoffGoalBeamPlacedCase extends StandoffGoalCase {
	private readonly bottomColumn: Pin[];
	private readonly topLeftColumn: Pin[];
	private readonly topRightColumn: Pin[];
	private readonly beam: Beam = new Beam();

	constructor(bottomColumn: Pin[], topLeftColumn: Pin[], topRightColumn: Pin[]) {
		super();
		this.bottomColumn = bottomColumn;
		this.topLeftColumn = topLeftColumn;
		this.topRightColumn = topRightColumn;
	}

	public getBottomColumn(): Pin[] | null {
		return this.bottomColumn;
	}

	public getTopLeftColumn(): Pin[] | null {
		return this.topLeftColumn;
	}

	public getTopRightColumn(): Pin[] | null {
		return this.topRightColumn;
	}

	public getBeam(): Beam | null {
		return this.beam;
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins:
				(isStack(this.bottomColumn, this.beam) ? this.bottomColumn.length : 0) +
				(isStack(this.topLeftColumn, this.beam) ? this.topLeftColumn.length : 0) +
				(isStack(this.topRightColumn, this.beam) ? this.topRightColumn.length : 0),
			connectedBeams: 1,
			twoColorStacks:
				(isTwoColorStack(this.bottomColumn, this.beam) ? 1 : 0) +
				(isTwoColorStack(this.topLeftColumn, this.beam) ? 1 : 0) +
				(isTwoColorStack(this.topRightColumn, this.beam) ? 1 : 0),
			threeColorStacks:
				(isThreeColorStack(this.bottomColumn, this.beam) ? 1 : 0) +
				(isThreeColorStack(this.topLeftColumn, this.beam) ? 1 : 0) +
				(isThreeColorStack(this.topRightColumn, this.beam) ? 1 : 0),
			matchingGoals:
				(isStack(this.bottomColumn, this.beam) ? 1 : 0) +
				(isStack(this.topLeftColumn, this.beam) ? 1 : 0) +
				(isStack(this.topRightColumn, this.beam) ? 1 : 0),
			stacksPlacedOnStandoffGoal:
				(isStack(this.bottomColumn, this.beam) ? 1 : 0) +
				(isStack(this.topLeftColumn, this.beam) ? 1 : 0) +
				(isStack(this.topRightColumn, this.beam) ? 1 : 0)
		};
	}

	public async visualize(scene: Scene, structure: StandoffGoalStructure): Promise<void> {
		let y = 74;
		const rad = (structure.rotation * Math.PI) / 180;

		for (const pin of this.bottomColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(0, y, 0), new THREE.Euler(0, 0, 0));
			y += 60;
		}

		await scene.addBeam(new THREE.Vector3(0, y, 0), new THREE.Euler(0, rad, 0));

		let y2 = y + 110;
		for (const pin of this.topLeftColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(64 * Math.cos(rad), y2, -64 * Math.sin(rad)), new THREE.Euler(0, 0, -Math.PI));
			y2 += 60;
		}

		y2 = y + 110;
		for (const pin of this.topRightColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(-64 * Math.cos(rad), y2, 64 * Math.sin(rad)), new THREE.Euler(0, 0, Math.PI));
			y2 += 60;
		}
	}
}
