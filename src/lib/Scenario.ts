import type { ScenarioScoring } from './Scoring';
import type { BlueFloorGoalStructure } from './structure/BlueFloorGoalStructure';
import type { BlueL1GoalStructure } from './structure/BlueL1GoalStructure';
import type { BlueL2GoalStructure } from './structure/BlueL2GoalStructure';
import type { BlueL3GoalStructure } from './structure/BlueL3GoalStructure';
import type { L4GoalStructure } from './structure/L4GoalStructure';
import type { RedFloorGoalStructure } from './structure/RedFloorGoalStructure';
import type { RedL1GoalStructure } from './structure/RedL1GoalStructure';
import type { RedL2GoalStructure } from './structure/RedL2GoalStructure';
import type { RedL3GoalStructure } from './structure/RedL3GoalStructure';

export class Scenario {
	constructor(
		public l4Goal: L4GoalStructure,
		public redL3Goal: RedL3GoalStructure,
		public blueL3Goal: BlueL3GoalStructure,
		public redL2Goal: RedL2GoalStructure,
		public blueL2Goal: BlueL2GoalStructure,
		public redL1Goal: RedL1GoalStructure,
		public blueL1Goal: BlueL1GoalStructure,
		public redFloorGoal: RedFloorGoalStructure,
		public blueFloorGoal: BlueFloorGoalStructure
	) {}

	get structures() {
		return [
			this.l4Goal,
			this.redL3Goal,
			this.blueL3Goal,
			this.redL2Goal,
			this.blueL2Goal,
			this.redL1Goal,
			this.blueL1Goal,
			this.redFloorGoal,
			this.blueFloorGoal
		];
	}

	calculateScoring(): ScenarioScoring {
		return {
			structures: this.structures.map((structure) => structure.getScoring())
		};
	}
}
