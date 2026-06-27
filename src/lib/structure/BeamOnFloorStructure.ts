import * as THREE from 'three';
import { Structure, ScoringObject, Pin, Beam } from '../ScoringObject';
import type { Scene } from '../Scene';
import { mulberry32 } from '../utils';
import { isStack, isThreeColorStack, isTwoColorStack, type StructureScoring } from '../Scoring';

export class BeamOnFloorStructure extends Structure {
	public readonly theCase: BeamOnFloorCase;
	public readonly randomSeed: number;

	constructor(theCase: BeamOnFloorCase, randomSeed: number) {
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

export abstract class BeamOnFloorCase {
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: BeamOnFloorStructure): Promise<void>;
}

export class JustBeamOnFloorCase extends BeamOnFloorCase {
	private readonly beam: Beam = new Beam();

	public getElements(): ScoringObject[] {
		return [this.beam];
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
	public async visualize(scene: Scene, structure: BeamOnFloorStructure): Promise<void> {
		const random = mulberry32(structure.randomSeed);
		const rotate = random() * 360;
		await scene.addBeam(new THREE.Vector3(0, -114, 600), new THREE.Euler(0, rotate, 0));
		return Promise.resolve();
	}
}

export class BeamWithColumnsCase extends BeamOnFloorCase {
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

	public getElements(): ScoringObject[] {
		return [...this.bottomColumn, ...this.topLeftColumn, ...this.topRightColumn, this.beam];
	}

	public getScoring(): StructureScoring {
		if (this.bottomColumn.length === 0) {
			return {
				connectedPins: 0,
				connectedBeams: 0,
				twoColorStacks: 0,
				threeColorStacks: 0,
				matchingGoals: 0,
				stacksPlacedOnStandoffGoal: 0
			};
		} else {
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
				stacksPlacedOnStandoffGoal: 0
			};
		}
	}

	public async visualize(scene: Scene, structure: BeamOnFloorStructure): Promise<void> {
		const random = mulberry32(structure.randomSeed);
		const rotate = random() * 360;
		const dx = random() * 400 - 200;
		const dz = random() * 400 - 200;

		let y = -114;
		for (const pin of this.bottomColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(dx, y, 600 + dz), new THREE.Euler(0, 0, 0));
			y += 60;
		}

		await scene.addBeam(new THREE.Vector3(dx, y, 600 + dz), new THREE.Euler(0, rotate, 0));
		y += 110;

		if (this.bottomColumn.length === 0) {
			y += 4;
		}

		let y2 = y;
		for (const pin of this.topLeftColumn) {
			await scene.addPin(
				pin.color,
				new THREE.Vector3(dx + 64 * Math.cos(rotate), y2, 600 + dz + -64 * Math.sin(rotate)),
				new THREE.Euler(0, 0, -Math.PI)
			);
			y2 += 60;
		}

		y2 = y;
		for (const pin of this.topRightColumn) {
			await scene.addPin(
				pin.color,
				new THREE.Vector3(dx + -64 * Math.cos(rotate), y2, 600 + dz + 64 * Math.sin(rotate)),
				new THREE.Euler(0, 0, Math.PI)
			);
			y2 += 60;
		}
	}
}

export class BeamWithTwoBottomColumnsCase extends BeamOnFloorCase {
	private readonly bottomColumn1: Pin[];
	private readonly bottomColumn2: Pin[];
	private readonly topColumn: Pin[];
	private readonly beam: Beam = new Beam();

	constructor(bottomColumn1: Pin[], bottomColumn2: Pin[], topColumn: Pin[]) {
		super();
		this.bottomColumn1 = bottomColumn1;
		this.bottomColumn2 = bottomColumn2;
		this.topColumn = topColumn;
	}

	public getElements(): ScoringObject[] {
		return [...this.bottomColumn1, ...this.bottomColumn2, ...this.topColumn, this.beam];
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins:
				(isStack(this.bottomColumn1, this.beam) ? this.bottomColumn1.length : 0) +
				(isStack(this.bottomColumn2, this.beam) ? this.bottomColumn2.length : 0) +
				(isStack(this.topColumn, this.beam) ? this.topColumn.length : 0),
			connectedBeams: 1,
			twoColorStacks:
				(isTwoColorStack(this.bottomColumn1, this.beam) ? 1 : 0) +
				(isTwoColorStack(this.bottomColumn2, this.beam) ? 1 : 0) +
				(isTwoColorStack(this.topColumn, this.beam) ? 1 : 0),
			threeColorStacks:
				(isThreeColorStack(this.bottomColumn1, this.beam) ? 1 : 0) +
				(isThreeColorStack(this.bottomColumn2, this.beam) ? 1 : 0) +
				(isThreeColorStack(this.topColumn, this.beam) ? 1 : 0),
			matchingGoals:
				(isStack(this.bottomColumn1, this.beam) ? 1 : 0) +
				(isStack(this.bottomColumn2, this.beam) ? 1 : 0) +
				(isStack(this.topColumn, this.beam) ? 1 : 0),
			stacksPlacedOnStandoffGoal: 0
		};
	}

	public async visualize(scene: Scene, structure: BeamOnFloorStructure): Promise<void> {
		const random = mulberry32(structure.randomSeed);
		const rotate = random() * 360;
		const dx = random() * 400 - 200;
		const dz = random() * 400 - 200;

		let y = -114;
		for (const pin of this.bottomColumn1) {
			await scene.addPin(
				pin.color,
				new THREE.Vector3(dx + 64 * Math.cos(rotate), y, 600 + dz + -64 * Math.sin(rotate)),
				new THREE.Euler(0, 0, 0)
			);
			y += 60;
		}

		y = -114;
		for (const pin of this.bottomColumn2) {
			await scene.addPin(
				pin.color,
				new THREE.Vector3(dx - 64 * Math.cos(rotate), y, 600 + dz + 64 * Math.sin(rotate)),
				new THREE.Euler(0, 0, 0)
			);
			y += 60;
		}

		await scene.addBeam(new THREE.Vector3(dx, y, 600 + dz), new THREE.Euler(0, rotate, 0));
		y += 110;

		for (const pin of this.topColumn) {
			await scene.addPin(pin.color, new THREE.Vector3(dx, y, 600 + dz), new THREE.Euler(0, 0, -Math.PI));
			y += 60;
		}
	}
}
