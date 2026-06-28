import type { ScenarioScoring } from './Scoring';
import type { L4GoalStructure } from './structure/L4GoalStructure';
import type { RedL3GoalStructure } from './structure/RedL3GoalStructure';

export class Scenario {
	constructor(
		public l4Goal: L4GoalStructure,
		public redL3Goal: RedL3GoalStructure
	) {}

	get structures() {
		return [this.l4Goal, this.redL3Goal];
	}

	calculateScoring(): ScenarioScoring {
		return {
			structures: this.structures.map((structure) => structure.getScoring())
		};
	}
}
