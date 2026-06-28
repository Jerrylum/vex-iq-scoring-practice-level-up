import { BeanBag, Structure, ScoringObject } from '../ScoringObject';
import type { Scene } from '../Scene';
import { emptyStructureScoring, scoringForRedFloorGoal, type StructureScoring } from '../Scoring';
import { mulberry32 } from '../utils';
import {
	getInvalidFloorPlacement,
	RED_FLOOR_STACK_POSITIONS,
	type InvalidFloorPlacementVariant,
	type Stack,
	visualizeStack
} from './StackVisualization';

export interface FloorStackPlacement {
	positionIndex: 0 | 1 | 2;
	stack: Stack;
	valid: boolean;
	invalidVariant?: InvalidFloorPlacementVariant;
}

export class RedFloorGoalStructure extends Structure {
	public readonly theCase: RedFloorGoalCase;
	public readonly randomSeed: number;

	constructor(theCase: RedFloorGoalCase, randomSeed: number) {
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

export abstract class RedFloorGoalCase {
	public abstract getPlacements(): FloorStackPlacement[];
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: RedFloorGoalStructure): Promise<void>;
}

function scoredBeanBags(placements: FloorStackPlacement[]): BeanBag[] {
	const bags: BeanBag[] = [];
	for (const placement of placements) {
		if (!placement.valid) {
			continue;
		}
		for (const bag of placement.stack) {
			bags.push(bag);
		}
	}
	return bags;
}

async function visualizePlacements(scene: Scene, structure: RedFloorGoalStructure, placements: FloorStackPlacement[]): Promise<void> {
	for (let i = 0; i < placements.length; i++) {
		const placement = placements[i];
		if (!placement || placement.stack.length === 0) {
			continue;
		}

		const base = RED_FLOOR_STACK_POSITIONS[placement.positionIndex]!;
		const seed = structure.randomSeed + i;

		if (!placement.valid) {
			const bag = placement.stack[0];
			if (!bag) {
				continue;
			}

			const random = mulberry32(seed);
			const variant = placement.invalidVariant ?? (random() < 0.5 ? 'offset' : 'rotated');
			const { position, rotation } = getInvalidFloorPlacement(base, variant, random);
			await scene.addBeanBag(bag.color, position, rotation);
			continue;
		}

		await visualizeStack(scene, base, placement.stack, seed);
	}
}

export class RedFloorGoalNoBeanBagCase extends RedFloorGoalCase {
	public getPlacements(): FloorStackPlacement[] {
		return [];
	}

	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return emptyStructureScoring();
	}

	public async visualize(_scene: Scene, _structure: RedFloorGoalStructure): Promise<void> {}
}

export class RedFloorGoalOneBeanBagCase extends RedFloorGoalCase {
	private readonly placements: FloorStackPlacement[];

	constructor(positionIndex: 0 | 1 | 2, stack: Stack) {
		super();
		if (stack.length !== 1) {
			throw new Error('RedFloorGoalOneBeanBagCase requires exactly 1 bean bag');
		}
		this.placements = [{ positionIndex, stack, valid: true }];
	}

	public getPlacements(): FloorStackPlacement[] {
		return this.placements;
	}

	public getElements(): ScoringObject[] {
		return [...this.placements.flatMap((p) => p.stack)];
	}

	public getScoring(): StructureScoring {
		return scoringForRedFloorGoal(scoredBeanBags(this.placements));
	}

	public async visualize(scene: Scene, structure: RedFloorGoalStructure): Promise<void> {
		await visualizePlacements(scene, structure, this.placements);
	}
}

export class RedFloorGoalMultipleBeanBagsCase extends RedFloorGoalCase {
	private readonly placements: FloorStackPlacement[];

	constructor(placements: FloorStackPlacement[]) {
		super();
		const totalRed = placements.flatMap((p) => p.stack).length;
		if (totalRed < 2 || totalRed > 3) {
			throw new Error('RedFloorGoalMultipleBeanBagsCase requires 2-3 red bean bags total');
		}
		this.placements = placements;
	}

	public getPlacements(): FloorStackPlacement[] {
		return this.placements;
	}

	public getElements(): ScoringObject[] {
		return [...this.placements.flatMap((p) => p.stack)];
	}

	public getScoring(): StructureScoring {
		return scoringForRedFloorGoal(scoredBeanBags(this.placements));
	}

	public async visualize(scene: Scene, structure: RedFloorGoalStructure): Promise<void> {
		await visualizePlacements(scene, structure, this.placements);
	}
}

export class RedFloorGoalMultipleMixedColorBeanBagsCase extends RedFloorGoalCase {
	private readonly placements: FloorStackPlacement[];

	constructor(placements: FloorStackPlacement[]) {
		super();
		this.placements = placements;
	}

	public getPlacements(): FloorStackPlacement[] {
		return this.placements;
	}

	public getElements(): ScoringObject[] {
		return [...this.placements.flatMap((p) => p.stack)];
	}

	public getScoring(): StructureScoring {
		return scoringForRedFloorGoal(scoredBeanBags(this.placements));
	}

	public async visualize(scene: Scene, structure: RedFloorGoalStructure): Promise<void> {
		await visualizePlacements(scene, structure, this.placements);
	}
}

export class RedFloorGoalInvalidPlacementCase extends RedFloorGoalCase {
	private readonly placements: FloorStackPlacement[];

	constructor(placements: FloorStackPlacement[]) {
		super();
		this.placements = placements;
	}

	public getPlacements(): FloorStackPlacement[] {
		return this.placements;
	}

	public getElements(): ScoringObject[] {
		return [...this.placements.flatMap((p) => p.stack)];
	}

	public getScoring(): StructureScoring {
		return scoringForRedFloorGoal(scoredBeanBags(this.placements));
	}

	public async visualize(scene: Scene, structure: RedFloorGoalStructure): Promise<void> {
		await visualizePlacements(scene, structure, this.placements);
	}
}
