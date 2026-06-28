import { BeanBag, Structure, ScoringObject, YellowBeanBag } from '../ScoringObject';
import type { Scene } from '../Scene';
import { emptyStructureScoring, scoringForL4Goal, type StructureScoring } from '../Scoring';
import { L4_STACK_POSITIONS, type Stack, visualizeStack } from './StackVisualization';

export class L4GoalStructure extends Structure {
	public readonly theCase: L4GoalCase;
	public readonly randomSeed: number;

	constructor(theCase: L4GoalCase, randomSeed: number) {
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

export abstract class L4GoalCase {
	public abstract getStacks(): [Stack, Stack];
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene, structure: L4GoalStructure): Promise<void>;
}

export class L4NoBeanBagCase extends L4GoalCase {
	public getStacks(): [Stack, Stack] {
		return [[], []];
	}

	public getElements(): ScoringObject[] {
		return [];
	}

	public getScoring(): StructureScoring {
		return emptyStructureScoring();
	}

	public async visualize(_scene: Scene, _structure: L4GoalStructure): Promise<void> {}
}

export class L4OneBeanBagCase extends L4GoalCase {
	private readonly platformIndex: number;
	private readonly stack: Stack;

	constructor(platformIndex: number) {
		super();
		this.platformIndex = platformIndex;
		this.stack = [new YellowBeanBag()];
	}

	public getStacks(): [Stack, Stack] {
		const stacks: [Stack, Stack] = [[], []];
		stacks[this.platformIndex] = this.stack;
		return stacks;
	}

	public getElements(): ScoringObject[] {
		return [...this.stack];
	}

	public getScoring(): StructureScoring {
		return scoringForL4Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: L4GoalStructure): Promise<void> {
		const stacks = this.getStacks();
		for (let i = 0; i < stacks.length; i++) {
			const stack = stacks[i];
			if (stack && stack.length > 0) {
				await visualizeStack(scene, L4_STACK_POSITIONS[i]!, stack, structure.randomSeed + i);
			}
		}
	}
}

export class L4MultipleBeanBagsCase extends L4GoalCase {
	private readonly stacks: [Stack, Stack];

	constructor(stack0: Stack, stack1: Stack) {
		super();
		this.stacks = [stack0, stack1];
	}

	public getStacks(): [Stack, Stack] {
		return this.stacks;
	}

	public getElements(): ScoringObject[] {
		return [...this.stacks[0], ...this.stacks[1]];
	}

	public getScoring(): StructureScoring {
		return scoringForL4Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: L4GoalStructure): Promise<void> {
		for (let i = 0; i < this.stacks.length; i++) {
			const stack = this.stacks[i];
			if (stack.length > 0) {
				await visualizeStack(scene, L4_STACK_POSITIONS[i]!, stack, structure.randomSeed + i);
			}
		}
	}
}

export class L4MultipleMixedColorBeanBagsCase extends L4GoalCase {
	private readonly stacks: [Stack, Stack];

	constructor(stack0: Stack, stack1: Stack) {
		super();
		this.stacks = [stack0, stack1];
	}

	public getStacks(): [Stack, Stack] {
		return this.stacks;
	}

	public getElements(): ScoringObject[] {
		return [...this.stacks[0], ...this.stacks[1]];
	}

	public getScoring(): StructureScoring {
		return scoringForL4Goal(this.getElements().filter((e): e is BeanBag => e instanceof BeanBag));
	}

	public async visualize(scene: Scene, structure: L4GoalStructure): Promise<void> {
		for (let i = 0; i < this.stacks.length; i++) {
			const stack = this.stacks[i];
			if (stack.length > 0) {
				await visualizeStack(scene, L4_STACK_POSITIONS[i]!, stack, structure.randomSeed + i);
			}
		}
	}
}
