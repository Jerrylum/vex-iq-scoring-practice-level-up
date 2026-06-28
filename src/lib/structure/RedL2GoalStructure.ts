import { BeanBag, Structure, ScoringObject } from '../ScoringObject';
import type { Scene } from '../Scene';
import { emptyStructureScoring, scoringForRedL2Goal, type StructureScoring } from '../Scoring';
import { RED_L2_STACK_POSITION, type Stack, visualizeStack } from './StackVisualization';

export class RedL2GoalStructure extends Structure {
	public readonly theCase: RedL2GoalCase;
	public readonly randomSeed: number;

	constructor(theCase: RedL2GoalCase, randomSeed: number) {
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

export abstract class RedL2GoalCase {
	public abstract getStack(): Stack;
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: RedL2GoalStructure): Promise<void>;
}

export class RedL2NoBeanBagCase extends RedL2GoalCase {
	public getStack(): Stack {
		return [];
	}

	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return emptyStructureScoring();
	}

	public async visualize(_scene: Scene, _structure: RedL2GoalStructure): Promise<void> {}
}

export class RedL2OneBeanBagCase extends RedL2GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length !== 1) {
			throw new Error('RedL2OneBeanBagCase requires exactly 1 bean bag');
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
		return scoringForRedL2Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: RedL2GoalStructure): Promise<void> {
		await visualizeStack(scene, RED_L2_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class RedL2MultipleBeanBagsCase extends RedL2GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 2 || stack.length > 4) {
			throw new Error('RedL2MultipleBeanBagsCase requires 2-4 bean bags');
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
		return scoringForRedL2Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: RedL2GoalStructure): Promise<void> {
		await visualizeStack(scene, RED_L2_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class RedL2MultipleMixedColorBeanBagsCase extends RedL2GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 3) {
			throw new Error('RedL2MultipleMixedColorBeanBagsCase requires at least 3 bean bags');
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
		return scoringForRedL2Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: RedL2GoalStructure): Promise<void> {
		await visualizeStack(scene, RED_L2_STACK_POSITION, this.stack, structure.randomSeed);
	}
}
