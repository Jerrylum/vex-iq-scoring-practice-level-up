import { type BeanBag, type Structure } from './ScoringObject.js';
import {
	generateRandomL4GoalStructureCase,
	generateRandomRedFloorGoalStructureCase,
	generateRandomRedL1GoalStructureCase,
	generateRandomRedL2GoalStructureCase,
	generateRandomRedL3GoalStructureCase
} from './Generator.js';
import { Scenario } from './Scenario.js';
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
		createStructure: (caseData: TCase) => TStructure
	): TStructure | null {
		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateCase();
				const structure = createStructure(caseData);
				const elements = structure.getElements().filter((e): e is BeanBag => 'color' in e);

				if (this.tracker.canAfford(elements)) {
					this.tracker.use(elements);
					return structure;
				}
			} catch {
				// Try again
			}
		}

		return null;
	}

	private generateL4Goal(): L4GoalStructure | null {
		return this.generateStructure(
			() => generateRandomL4GoalStructureCase(this.difficulty),
			(caseData) => new L4GoalStructure(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateRedL3Goal(): RedL3GoalStructure | null {
		return this.generateStructure(
			() => generateRandomRedL3GoalStructureCase(this.difficulty),
			(caseData) => new RedL3GoalStructure(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateRedL2Goal(): RedL2GoalStructure | null {
		return this.generateStructure(
			() => generateRandomRedL2GoalStructureCase(this.difficulty),
			(caseData) => new RedL2GoalStructure(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateRedL1Goal(): RedL1GoalStructure | null {
		return this.generateStructure(
			() => generateRandomRedL1GoalStructureCase(this.difficulty),
			(caseData) => new RedL1GoalStructure(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateRedFloorGoal(): RedFloorGoalStructure | null {
		return this.generateStructure(
			() => generateRandomRedFloorGoalStructureCase(this.difficulty),
			(caseData) => new RedFloorGoalStructure(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	public generate(): Scenario {
		const l4Goal = this.generateL4Goal();
		if (!l4Goal) {
			throw new Error('Failed to generate L4Goal');
		}
		console.log('Generated: L4Goal');

		const redL3Goal = this.generateRedL3Goal();
		if (!redL3Goal) {
			throw new Error('Failed to generate RedL3Goal');
		}
		console.log('Generated: RedL3Goal');

		const redL2Goal = this.generateRedL2Goal();
		if (!redL2Goal) {
			throw new Error('Failed to generate RedL2Goal');
		}
		console.log('Generated: RedL2Goal');

		const redL1Goal = this.generateRedL1Goal();
		if (!redL1Goal) {
			throw new Error('Failed to generate RedL1Goal');
		}
		console.log('Generated: RedL1Goal');

		const redFloorGoal = this.generateRedFloorGoal();
		if (!redFloorGoal) {
			throw new Error('Failed to generate RedFloorGoal');
		}
		console.log('Generated: RedFloorGoal');

		const scenario = new Scenario(l4Goal, redL3Goal, redL2Goal, redL1Goal, redFloorGoal);
		console.log('Resources remaining:', this.tracker.getAvailable());
		console.log(`Total structures generated: ${scenario.structures.length}`);

		return scenario;
	}
}

export function generateScenario(difficulty: Difficulty): Scenario {
	const generator = new ScenarioGenerator(difficulty);
	return generator.generate();
}
