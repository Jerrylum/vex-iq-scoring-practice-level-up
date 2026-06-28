import { BeanBag, Structure, ScoringObject } from '../ScoringObject';
import type { Scene } from '../Scene';
import { emptyStructureScoring, scoringForBlueL1Goal, type StructureScoring } from '../Scoring';
import { BLUE_L1_STACK_POSITION, type Stack, visualizeStack } from './StackVisualization';

export class BlueL1GoalStructure extends Structure {
	public readonly theCase: BlueL1GoalCase;
	public readonly randomSeed: number;

	constructor(theCase: BlueL1GoalCase, randomSeed: number) {
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

export abstract class BlueL1GoalCase {
	public abstract getStack(): Stack;
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: BlueL1GoalStructure): Promise<void>;
}

export class BlueL1NoBeanBagCase extends BlueL1GoalCase {
	public getStack(): Stack {
		return [];
	}

	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return emptyStructureScoring();
	}

	public async visualize(_scene: Scene, _structure: BlueL1GoalStructure): Promise<void> {}
}

export class BlueL1OneBeanBagCase extends BlueL1GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length !== 1) {
			throw new Error('BlueL1OneBeanBagCase requires exactly 1 bean bag');
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
		return scoringForBlueL1Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: BlueL1GoalStructure): Promise<void> {
		await visualizeStack(scene, BLUE_L1_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class BlueL1MultipleBeanBagsCase extends BlueL1GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 2 || stack.length > 3) {
			throw new Error('BlueL1MultipleBeanBagsCase requires 2-3 bean bags');
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
		return scoringForBlueL1Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: BlueL1GoalStructure): Promise<void> {
		await visualizeStack(scene, BLUE_L1_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class BlueL1MultipleMixedColorBeanBagsCase extends BlueL1GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 3) {
			throw new Error('BlueL1MultipleMixedColorBeanBagsCase requires at least 3 bean bags');
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
		return scoringForBlueL1Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: BlueL1GoalStructure): Promise<void> {
		await visualizeStack(scene, BLUE_L1_STACK_POSITION, this.stack, structure.randomSeed);
	}
}
