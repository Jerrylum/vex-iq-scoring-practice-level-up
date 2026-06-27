import type { ScenarioScoring } from './Scoring';
import type { Structure } from './ScoringObject';
import type { BeamOnFloorStructure } from './structure/BeamOnFloorStructure';
import type { FloorGoalStructure } from './structure/FloorGoalStructure';
import type { RemainingPinsStructure } from './structure/RemainingPinsStructure';
import type { StandoffGoalStructure } from './structure/StandoffGoalStructure';
import type { StartingPinStructure } from './structure/StartingPinStructure';

export class Scenario {
	constructor(
		public standoffGoal: StandoffGoalStructure,
		public beamOnFloor: BeamOnFloorStructure,
		public floorGoal: FloorGoalStructure,
		public otherStructures: Structure[],
		public startingPin: StartingPinStructure,
		public remainingPins: RemainingPinsStructure
	) {}

	get structures(): Structure[] {
		return [this.standoffGoal, this.beamOnFloor, this.floorGoal, ...this.otherStructures, this.startingPin, this.remainingPins];
	}

	calculateScoring(): ScenarioScoring {
		return {
			structures: this.structures.map((structure) => structure.getScoring()),
			startingPins: 4 - this.startingPin.getElements().length,
			contacted: 0 // Ignored for now
		};
	}
}
