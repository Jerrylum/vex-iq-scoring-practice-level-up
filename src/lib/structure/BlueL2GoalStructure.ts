import { BeanBag, Structure, ScoringObject } from '../ScoringObject';
import type { Scene } from '../Scene';
import { emptyStructureScoring, scoringForBlueL2Goal, type StructureScoring } from '../Scoring';
import { BLUE_L2_STACK_POSITION, type Stack, visualizeStack } from './StackVisualization';

export class BlueL2GoalStructure extends Structure {
	public readonly theCase: BlueL2GoalCase;
	public readonly randomSeed: number;

	constructor(theCase: BlueL2GoalCase, randomSeed: number) {
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

export abstract class BlueL2GoalCase {
	public abstract getStack(): Stack;
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: BlueL2GoalStructure): Promise<void>;
}

export class BlueL2NoBeanBagCase extends BlueL2GoalCase {
	public getStack(): Stack {
		return [];
	}

	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return emptyStructureScoring();
	}

	public async visualize(_scene: Scene, _structure: BlueL2GoalStructure): Promise<void> {}
}

export class BlueL2OneBeanBagCase extends BlueL2GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length !== 1) {
			throw new Error('BlueL2OneBeanBagCase requires exactly 1 bean bag');
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
		return scoringForBlueL2Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: BlueL2GoalStructure): Promise<void> {
		await visualizeStack(scene, BLUE_L2_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class BlueL2MultipleBeanBagsCase extends BlueL2GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 2 || stack.length > 3) {
			throw new Error('BlueL2MultipleBeanBagsCase requires 2-3 bean bags');
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
		return scoringForBlueL2Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: BlueL2GoalStructure): Promise<void> {
		await visualizeStack(scene, BLUE_L2_STACK_POSITION, this.stack, structure.randomSeed);
	}
}

export class BlueL2MultipleMixedColorBeanBagsCase extends BlueL2GoalCase {
	private readonly stack: Stack;

	constructor(stack: Stack) {
		super();
		if (stack.length < 3) {
			throw new Error('BlueL2MultipleMixedColorBeanBagsCase requires at least 3 bean bags');
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
		return scoringForBlueL2Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: BlueL2GoalStructure): Promise<void> {
		await visualizeStack(scene, BLUE_L2_STACK_POSITION, this.stack, structure.randomSeed);
	}
}
