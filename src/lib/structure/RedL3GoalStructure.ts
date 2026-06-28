import { BeanBag, Structure, ScoringObject } from '../ScoringObject';
import type { Scene } from '../Scene';
import { emptyStructureScoring, scoringForRedL3Goal, type StructureScoring } from '../Scoring';
import { RED_L3_STACK_POSITION, type Stack, visualizeStack } from './StackVisualization';

export class RedL3GoalStructure extends Structure {
	public readonly theCase: RedL3GoalCase;
	public readonly randomSeed: number;

	constructor(theCase: RedL3GoalCase, randomSeed: number) {
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

export abstract class RedL3GoalCase {
	public abstract getStack(): Stack;
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: RedL3GoalStructure): Promise<void>;
}

export class RedL3NoBeanBagCase extends RedL3GoalCase {
	public getStack(): Stack {
		return [];
	}

	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return emptyStructureScoring();
	}

	public async visualize(_scene: Scene, _structure: RedL3GoalStructure): Promise<void> {}
}

export class RedL3OneBeanBagCase extends RedL3GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length !== 1) {
			throw new Error('RedL3OneBeanBagCase requires exactly 1 bean bag');
		}
		this.stack = stack;
	}

	public getStack(): Stack {
		return this.stack;
	}

	public getElements(): ScoringObject[] {
		return [...this.stack];
	}

	public getScoring(): StructureScoring {
		return scoringForRedL3Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: RedL3GoalStructure): Promise<void> {
		await visualizeStack(scene, RED_L3_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class RedL3MultipleBeanBagsCase extends RedL3GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 2 || stack.length > 4) {
			throw new Error('RedL3MultipleBeanBagsCase requires 2-4 bean bags');
		}
		this.stack = stack;
	}

	public getStack(): Stack {
		return this.stack;
	}

	public getElements(): ScoringObject[] {
		return [...this.stack];
	}

	public getScoring(): StructureScoring {
		return scoringForRedL3Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: RedL3GoalStructure): Promise<void> {
		await visualizeStack(scene, RED_L3_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class RedL3MultipleMixedColorBeanBagsCase extends RedL3GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 3) {
			throw new Error('RedL3MultipleMixedColorBeanBagsCase requires at least 3 bean bags');
		}
		this.stack = stack;
	}

	public getStack(): Stack {
		return this.stack;
	}

	public getElements(): ScoringObject[] {
		return [...this.stack];
	}

	public getScoring(): StructureScoring {
		return scoringForRedL3Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: RedL3GoalStructure): Promise<void> {
		await visualizeStack(scene, RED_L3_STACK_POSITION, this.stack, structure.randomSeed);
	}
}
