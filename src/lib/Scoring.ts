import type { BeanBagColor } from './Scene';
import type { BeanBag, ScoringObject } from './ScoringObject';

/** Scored bean bag counts per goal tier (by position, not raw color totals). */
export interface StructureScoring {
	redL3Goal: number; // red + yellow
	redL2Goal: number; // red + yellow
	redL1Goal: number; // red + yellow
	redFloorGoal: number; // red + yellow
	blueL3Goal: number; // blue + yellow
	blueL2Goal: number; // blue + yellow
	blueL1Goal: number; // blue + yellow
	blueFloorGoal: number; // blue + yellow
	yellowL4Goal: number; // yellow only
}

export const GOAL_POINTS = {
	redFloorGoal: 1,
	blueFloorGoal: 1,
	redL1Goal: 3,
	blueL1Goal: 3,
	redL2Goal: 6,
	blueL2Goal: 6,
	redL3Goal: 12,
	blueL3Goal: 12,
	yellowL4Goal: 16
} as const satisfies Record<keyof StructureScoring, number>;

export interface ScenarioScoring {
	structures: StructureScoring[];
}

export function emptyStructureScoring(): StructureScoring {
	return {
		redL3Goal: 0,
		redL2Goal: 0,
		redL1Goal: 0,
		redFloorGoal: 0,
		blueL3Goal: 0,
		blueL2Goal: 0,
		blueL1Goal: 0,
		blueFloorGoal: 0,
		yellowL4Goal: 0
	};
}

export function calculateScenarioPoints(scoring: StructureScoring): number {
	let total = 0;
	for (const key of Object.keys(GOAL_POINTS) as (keyof StructureScoring)[]) {
		total += scoring[key] * GOAL_POINTS[key];
	}
	return total;
}

export function isNotTouching(e: ScoringObject): boolean {
	return !e.robot1Contacted && !e.robot2Contacted;
}

export function isScoredColorForRedGoal(color: BeanBagColor): boolean {
	return color === 'red' || color === 'yellow';
}

export function isScoredColorForBlueGoal(color: BeanBagColor): boolean {
	return color === 'blue' || color === 'yellow';
}

export function isScoredColorForL4Goal(color: BeanBagColor): boolean {
	return color === 'yellow';
}

export function countScoredBeanBagsForRedGoal(beanBags: BeanBag[]): number {
	return beanBags.filter((bag) => isScoredColorForRedGoal(bag.color)).length;
}

export function countScoredBeanBagsForBlueGoal(beanBags: BeanBag[]): number {
	return beanBags.filter((bag) => isScoredColorForBlueGoal(bag.color)).length;
}

export function countScoredInL4Goal(beanBags: BeanBag[]): number {
	return beanBags.filter((bag) => isScoredColorForL4Goal(bag.color)).length;
}

export function scoringForRedL3Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), redL3Goal: countScoredBeanBagsForRedGoal(beanBags) };
}

export function scoringForRedL2Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), redL2Goal: countScoredBeanBagsForRedGoal(beanBags) };
}

export function scoringForRedL1Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), redL1Goal: countScoredBeanBagsForRedGoal(beanBags) };
}

export function scoringForRedFloorGoal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), redFloorGoal: countScoredBeanBagsForRedGoal(beanBags) };
}

export function scoringForL4Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), yellowL4Goal: countScoredInL4Goal(beanBags) };
}

export function scoringForBlueL3Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), blueL3Goal: countScoredBeanBagsForBlueGoal(beanBags) };
}

export function scoringForBlueL2Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), blueL2Goal: countScoredBeanBagsForBlueGoal(beanBags) };
}

export function scoringForBlueL1Goal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), blueL1Goal: countScoredBeanBagsForBlueGoal(beanBags) };
}

export function scoringForBlueFloorGoal(beanBags: BeanBag[]): StructureScoring {
	return { ...emptyStructureScoring(), blueFloorGoal: countScoredBeanBagsForBlueGoal(beanBags) };
}
