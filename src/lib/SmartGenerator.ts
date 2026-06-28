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
import { BlueFloorGoalStructure } from './structure/BlueFloorGoalStructure.js';
import { BlueL1GoalStructure } from './structure/BlueL1GoalStructure.js';
import { BlueL2GoalStructure } from './structure/BlueL2GoalStructure.js';
import { BlueL3GoalStructure } from './structure/BlueL3GoalStructure.js';
import { L4GoalStructure } from './structure/L4GoalStructure.js';
import { RedFloorGoalStructure } from './structure/RedFloorGoalStructure.js';
import { RedL1GoalStructure } from './structure/RedL1GoalStructure.js';
import { RedL2GoalStructure } from './structure/RedL2GoalStructure.js';
import { RedL3GoalStructure } from './structure/RedL3GoalStructure.js';

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

		throw new Error(`Failed to generate ${name}`);
	}

	private randomSeed(): number {
		return Math.floor(Math.random() * 1000000000);
	}

	public generate(): Scenario {
		const l4Goal = this.generateStructure(
			() => generateRandomL4GoalStructureCase(this.difficulty),
			(caseData) => new L4GoalStructure(caseData, this.randomSeed()),
			'L4Goal'
		);

		const redL3Goal = this.generateStructure(
			() => generateRandomRedL3GoalStructureCase(this.difficulty),
			(caseData) => new RedL3GoalStructure(caseData, this.randomSeed()),
			'RedL3Goal'
		);

		const blueL3Goal = this.generateStructure(
			() => generateRandomBlueL3GoalStructureCase(this.difficulty),
			(caseData) => new BlueL3GoalStructure(caseData, this.randomSeed()),
			'BlueL3Goal'
		);

		const redL2Goal = this.generateStructure(
			() => generateRandomRedL2GoalStructureCase(this.difficulty),
			(caseData) => new RedL2GoalStructure(caseData, this.randomSeed()),
			'RedL2Goal'
		);

		const blueL2Goal = this.generateStructure(
			() => generateRandomBlueL2GoalStructureCase(this.difficulty),
			(caseData) => new BlueL2GoalStructure(caseData, this.randomSeed()),
			'BlueL2Goal'
		);

		const redL1Goal = this.generateStructure(
			() => generateRandomRedL1GoalStructureCase(this.difficulty),
			(caseData) => new RedL1GoalStructure(caseData, this.randomSeed()),
			'RedL1Goal'
		);

		const blueL1Goal = this.generateStructure(
			() => generateRandomBlueL1GoalStructureCase(this.difficulty),
			(caseData) => new BlueL1GoalStructure(caseData, this.randomSeed()),
			'BlueL1Goal'
		);

		const redFloorGoal = this.generateStructure(
			() => generateRandomRedFloorGoalStructureCase(this.difficulty),
			(caseData) => new RedFloorGoalStructure(caseData, this.randomSeed()),
			'RedFloorGoal'
		);

		const blueFloorGoal = this.generateStructure(
			() => generateRandomBlueFloorGoalStructureCase(this.difficulty),
			(caseData) => new BlueFloorGoalStructure(caseData, this.randomSeed()),
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
