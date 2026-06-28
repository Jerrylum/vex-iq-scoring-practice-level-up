import type { ScenarioScoring } from './Scoring';
import type { L4GoalStructure } from './structure/L4GoalStructure';
import type { RedFloorGoalStructure } from './structure/RedFloorGoalStructure';
import type { RedL1GoalStructure } from './structure/RedL1GoalStructure';
import type { RedL2GoalStructure } from './structure/RedL2GoalStructure';
import type { RedL3GoalStructure } from './structure/RedL3GoalStructure';

export class Scenario {
	constructor(
		public l4Goal: L4GoalStructure,
		public redL3Goal: RedL3GoalStructure,
		public redL2Goal: RedL2GoalStructure,
		public redL1Goal: RedL1GoalStructure,
		public redFloorGoal: RedFloorGoalStructure
	) {}

	get structures() {
		return [this.l4Goal, this.redL3Goal, this.redL2Goal, this.redL1Goal, this.redFloorGoal];
	}

	calculateScoring(): ScenarioScoring {
		return {
			structures: this.structures.map((structure) => structure.getScoring())
		};
	}
}
