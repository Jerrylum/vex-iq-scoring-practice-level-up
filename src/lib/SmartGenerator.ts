import { type BeanBag, type Structure } from './ScoringObject.js';
import {
	generateRandomBlueFloorGoalStructureCase,
	generateRandomBlueL1GoalStructureCase,
	generateRandomBlueL2GoalStructureCase,
	generateRandomBlueL3GoalStructureCase,
	generateRandomL4GoalStructureCase,
	generateRandomRedFloorGoalStructureCase,
	generateRandomRedL1GoalStructureCase,
	generateRandomRedL2GoalStructureCase,
	generateRandomRedL3GoalStructureCase
} from './Generator.js';
import { Scenario } from './Scenario.js';
import { BlueFloorGoalStructure, BlueFloorGoalNoBeanBagCase } from './structure/BlueFloorGoalStructure.js';
import { BlueL1GoalStructure, BlueL1NoBeanBagCase } from './structure/BlueL1GoalStructure.js';
import { BlueL2GoalStructure, BlueL2NoBeanBagCase } from './structure/BlueL2GoalStructure.js';
import { BlueL3GoalStructure, BlueL3NoBeanBagCase } from './structure/BlueL3GoalStructure.js';
import { L4GoalStructure, L4NoBeanBagCase } from './structure/L4GoalStructure.js';
import { RedFloorGoalStructure, RedFloorGoalNoBeanBagCase } from './structure/RedFloorGoalStructure.js';
import { RedL1GoalStructure, RedL1NoBeanBagCase } from './structure/RedL1GoalStructure.js';
import { RedL2GoalStructure, RedL2NoBeanBagCase } from './structure/RedL2GoalStructure.js';
import { RedL3GoalStructure, RedL3NoBeanBagCase } from './structure/RedL3GoalStructure.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface AvailableResources {
	red: number;
	blue: number;
	yellow: number;
}

class ResourceTracker {
	private available: AvailableResources;

	constructor() {
		this.available = {
			red: 16,
			blue: 16,
			yellow: 6
		};
	}

	getAvailable(): AvailableResources {
		return { ...this.available };
	}

	canAfford(beanBags: BeanBag[]): boolean {
		const needed = { red: 0, blue: 0, yellow: 0 };
		for (const bag of beanBags) {
			needed[bag.color]++;
		}
		return needed.red <= this.available.red && needed.blue <= this.available.blue && needed.yellow <= this.available.yellow;
	}

	use(beanBags: BeanBag[]): void {
		for (const bag of beanBags) {
			this.available[bag.color]--;
		}
	}
}

export class ScenarioGenerator {
	private difficulty: Difficulty;
	private tracker: ResourceTracker;

	constructor(difficulty: Difficulty) {
		this.difficulty = difficulty;
		this.tracker = new ResourceTracker();
	}

	private getMaxAttemptsForStructure(): number {
		return 100;
	}

	private generateStructure<TCase, TStructure extends Structure>(
		generateCase: () => TCase,
		createStructure: (caseData: TCase) => TStructure,
		createEmptyStructure: () => TStructure,
		name: string
	): TStructure {
		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateCase();
				const structure = createStructure(caseData);
				const elements = structure.getElements().filter((e): e is BeanBag => 'color' in e);

				if (this.tracker.canAfford(elements)) {
					this.tracker.use(elements);
					console.log(`Generated: ${name}`);
					return structure;
				}
			} catch {
				// Try again
			}
		}

		const fallback = createEmptyStructure();
		console.warn(`Generated: ${name} (NoBeanBag fallback)`);
		return fallback;
	}

	private randomSeed(): number {
		return Math.floor(Math.random() * 1000000000);
	}

	public generate(): Scenario {
		const l4Goal = this.generateStructure(
			() => generateRandomL4GoalStructureCase(this.difficulty),
			(caseData) => new L4GoalStructure(caseData, this.randomSeed()),
			() => new L4GoalStructure(new L4NoBeanBagCase(), this.randomSeed()),
			'L4Goal'
		);

		const redL3Goal = this.generateStructure(
			() => generateRandomRedL3GoalStructureCase(this.difficulty),
			(caseData) => new RedL3GoalStructure(caseData, this.randomSeed()),
			() => new RedL3GoalStructure(new RedL3NoBeanBagCase(), this.randomSeed()),
			'RedL3Goal'
		);

		const blueL3Goal = this.generateStructure(
			() => generateRandomBlueL3GoalStructureCase(this.difficulty),
			(caseData) => new BlueL3GoalStructure(caseData, this.randomSeed()),
			() => new BlueL3GoalStructure(new BlueL3NoBeanBagCase(), this.randomSeed()),
			'BlueL3Goal'
		);

		const redL2Goal = this.generateStructure(
			() => generateRandomRedL2GoalStructureCase(this.difficulty),
			(caseData) => new RedL2GoalStructure(caseData, this.randomSeed()),
			() => new RedL2GoalStructure(new RedL2NoBeanBagCase(), this.randomSeed()),
			'RedL2Goal'
		);

		const blueL2Goal = this.generateStructure(
			() => generateRandomBlueL2GoalStructureCase(this.difficulty),
			(caseData) => new BlueL2GoalStructure(caseData, this.randomSeed()),
			() => new BlueL2GoalStructure(new BlueL2NoBeanBagCase(), this.randomSeed()),
			'BlueL2Goal'
		);

		const redL1Goal = this.generateStructure(
			() => generateRandomRedL1GoalStructureCase(this.difficulty),
			(caseData) => new RedL1GoalStructure(caseData, this.randomSeed()),
			() => new RedL1GoalStructure(new RedL1NoBeanBagCase(), this.randomSeed()),
			'RedL1Goal'
		);

		const blueL1Goal = this.generateStructure(
			() => generateRandomBlueL1GoalStructureCase(this.difficulty),
			(caseData) => new BlueL1GoalStructure(caseData, this.randomSeed()),
			() => new BlueL1GoalStructure(new BlueL1NoBeanBagCase(), this.randomSeed()),
			'BlueL1Goal'
		);

		const redFloorGoal = this.generateStructure(
			() => generateRandomRedFloorGoalStructureCase(this.difficulty),
			(caseData) => new RedFloorGoalStructure(caseData, this.randomSeed()),
			() => new RedFloorGoalStructure(new RedFloorGoalNoBeanBagCase(), this.randomSeed()),
			'RedFloorGoal'
		);

		const blueFloorGoal = this.generateStructure(
			() => generateRandomBlueFloorGoalStructureCase(this.difficulty),
			(caseData) => new BlueFloorGoalStructure(caseData, this.randomSeed()),
			() => new BlueFloorGoalStructure(new BlueFloorGoalNoBeanBagCase(), this.randomSeed()),
			'BlueFloorGoal'
		);

		const scenario = new Scenario(l4Goal, redL3Goal, blueL3Goal, redL2Goal, blueL2Goal, redL1Goal, blueL1Goal, redFloorGoal, blueFloorGoal);
		console.log('Resources remaining:', this.tracker.getAvailable());
		console.log(`Total structures generated: ${scenario.structures.length}`);

		return scenario;
	}
}

export function generateScenario(difficulty: Difficulty): Scenario {
	const generator = new ScenarioGenerator(difficulty);
	return generator.generate();
}
