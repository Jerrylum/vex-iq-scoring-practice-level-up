import type { PinColor } from './Scene';
import type { Beam, ScoringObject, Pin } from './ScoringObject';

export interface StructureScoring {
	connectedPins: number;
	connectedBeams: number;
	twoColorStacks: number;
	threeColorStacks: number;
	matchingGoals: number;
	stacksPlacedOnStandoffGoal: number;
}

export interface ScenarioScoring {
	structures: StructureScoring[];
	startingPins: number;
	contacted: number;
}

export function isNotTouching(e: ScoringObject): boolean {
	return !e.robot1Contacted && !e.robot2Contacted;
}

export function isStack(pins: Pin[], beam: Beam | null = null): boolean {
	return pins.length >= (beam ? 1 : 2) && pins.every(isNotTouching) && (!beam || isNotTouching(beam));
}

export function isStackMatchingGoal(stack: Pin[], matchColor: PinColor): boolean {
	return isStack(stack) && stack[0]!.color === matchColor;
}

export function isTwoColorStack(pins: Pin[], beam: Beam | null = null): boolean {
	// the stack can be very high, but only contain two colors
	const colors = new Set<string>();
	for (const pin of pins) {
		colors.add(pin.color);
	}
	return colors.size === (beam ? 1 : 2) && isStack(pins, beam);
}

export function isThreeColorStack(stack: Pin[], beam: Beam | null = null): boolean {
	const colors = new Set<string>();
	for (const pin of stack) {
		colors.add(pin.color);
	}
	return colors.size >= (beam ? 2 : 3) && isStack(stack, beam);
}
