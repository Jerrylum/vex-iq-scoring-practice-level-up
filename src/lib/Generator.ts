import { BlueBeanBag, RedBeanBag, YellowBeanBag, type BeanBag } from './ScoringObject';
import type { BeanBagColor } from './Scene';
import {
	L4MultipleBeanBagsCase,
	L4MultipleMixedColorBeanBagsCase,
	L4NoBeanBagCase,
	L4OneBeanBagCase,
	type L4GoalCase
} from './structure/L4GoalStructure';
import {
	RedL1MultipleBeanBagsCase,
	RedL1MultipleMixedColorBeanBagsCase,
	RedL1NoBeanBagCase,
	RedL1OneBeanBagCase,
	type RedL1GoalCase
} from './structure/RedL1GoalStructure';
import {
	RedL2MultipleBeanBagsCase,
	RedL2MultipleMixedColorBeanBagsCase,
	RedL2NoBeanBagCase,
	RedL2OneBeanBagCase,
	type RedL2GoalCase
} from './structure/RedL2GoalStructure';
import {
	RedL3MultipleBeanBagsCase,
	RedL3MultipleMixedColorBeanBagsCase,
	RedL3NoBeanBagCase,
	RedL3OneBeanBagCase,
	type RedL3GoalCase
} from './structure/RedL3GoalStructure';
import {
	RedFloorGoalInvalidPlacementCase,
	RedFloorGoalMultipleBeanBagsCase,
	RedFloorGoalMultipleMixedColorBeanBagsCase,
	RedFloorGoalNoBeanBagCase,
	RedFloorGoalOneBeanBagCase,
	type FloorStackPlacement,
	type RedFloorGoalCase
} from './structure/RedFloorGoalStructure';
import type { Stack } from './structure/StackVisualization';

export type Level = 'easy' | 'medium' | 'hard';

function createBeanBag(color: BeanBagColor): BeanBag {
	switch (color) {
		case 'red':
			return new RedBeanBag();
		case 'blue':
			return new BlueBeanBag();
		case 'yellow':
			return new YellowBeanBag();
	}
}

export function generateBeanBags(color: BeanBagColor, min: number, max: number): BeanBag[] {
	const count = Math.floor(Math.random() * (max - min + 1)) + min;
	return Array.from({ length: count }, () => createBeanBag(color));
}

export function generateRandomOtherColor(exclude: BeanBagColor, min: number, max: number): BeanBag[] {
	const colors: BeanBagColor[] = (['red', 'blue', 'yellow'] as const).filter((c) => c !== exclude);
	const count = Math.floor(Math.random() * (max - min + 1)) + min;
	const bags: BeanBag[] = [];

	for (let i = 0; i < count; i++) {
		const color = colors[Math.floor(Math.random() * colors.length)]!;
		bags.push(createBeanBag(color));
	}

	return bags;
}

function buildL4MixedStack(): Stack {
	return [...generateBeanBags('yellow', 2, 3), ...generateRandomOtherColor('yellow', 1, 2)];
}

function buildRedPyramidMixedStack(): Stack {
	return [...generateBeanBags('red', 2, 3), ...generateRandomOtherColor('red', 1, 3)];
}

function generateRandomRedPyramidGoalStructureCase<T>(
	level: Level,
	factories: {
		no: () => T;
		one: (stack: Stack) => T;
		multiple: (stack: Stack) => T;
		mixed: (stack: Stack) => T;
	}
): T {
	const roll = Math.random();

	if (level === 'easy') {
		if (roll < 0.5) {
			return factories.no();
		}
		return factories.one([createBeanBag(Math.random() < 0.5 ? 'red' : 'yellow')]);
	}

	if (level === 'medium') {
		if (roll < 0.2) {
			return factories.no();
		}
		if (roll < 0.4) {
			return factories.one([createBeanBag('red')]);
		}
		return factories.multiple(generateBeanBags('red', 2, 3));
	}

	if (roll < 0.2) {
		return factories.one([createBeanBag('red')]);
	}
	if (roll < 0.4) {
		return factories.multiple(generateBeanBags('red', 2, 3));
	}
	return factories.mixed(buildRedPyramidMixedStack());
}

function distributeBeanBagsAcrossStacks(bags: BeanBag[]): FloorStackPlacement[] {
	const stacks: Stack[] = [[], [], []];

	for (const bag of bags) {
		const index = Math.floor(Math.random() * 3) as 0 | 1 | 2;
		stacks[index]!.push(bag);
	}

	const placements: FloorStackPlacement[] = [];
	for (let i = 0; i < 3; i++) {
		const stack = stacks[i]!;
		if (stack.length > 0) {
			placements.push({ positionIndex: i as 0 | 1 | 2, stack, valid: true });
		}
	}

	return placements;
}

function buildFloorMixedPlacements(): FloorStackPlacement[] {
	const bags = [...generateBeanBags('red', 2, 3), ...generateRandomOtherColor('red', 1, 3)];
	return distributeBeanBagsAcrossStacks(bags);
}

function buildInvalidPlacementCase(): RedFloorGoalInvalidPlacementCase {
	const placements: FloorStackPlacement[] = [];

	for (let i = 0; i < 3; i++) {
		const positionIndex = i as 0 | 1 | 2;

		if (Math.random() < 0.3) {
			const roll = Math.random();
			const color: BeanBagColor = roll < 0.5 ? 'red' : roll < 0.75 ? 'blue' : 'yellow';
			placements.push({
				positionIndex,
				stack: [createBeanBag(color)],
				valid: false,
				invalidVariant: Math.random() < 0.5 ? 'offset' : 'rotated'
			});
		} else {
			const stack = [...generateBeanBags('red', 0, 2), ...generateRandomOtherColor('red', 0, 2)];
			if (stack.length > 0) {
				placements.push({ positionIndex, stack, valid: true });
			}
		}
	}

	return new RedFloorGoalInvalidPlacementCase(placements);
}

export function generateRandomL4GoalStructureCase(level: Level): L4GoalCase {
	const roll = Math.random();

	if (level === 'easy') {
		if (roll < 0.5) {
			return new L4NoBeanBagCase();
		}
		return new L4OneBeanBagCase(Math.floor(Math.random() * 2));
	}

	if (level === 'medium') {
		if (roll < 0.2) {
			return new L4NoBeanBagCase();
		}
		if (roll < 0.4) {
			return new L4OneBeanBagCase(Math.floor(Math.random() * 2));
		}
		return new L4MultipleBeanBagsCase(generateBeanBags('yellow', 2, 3), generateBeanBags('yellow', 2, 3));
	}

	if (roll < 0.4) {
		return new L4MultipleBeanBagsCase(generateBeanBags('yellow', 2, 3), generateBeanBags('yellow', 2, 3));
	}

	return new L4MultipleMixedColorBeanBagsCase(buildL4MixedStack(), buildL4MixedStack());
}

export function generateRandomRedL3GoalStructureCase(level: Level): RedL3GoalCase {
	return generateRandomRedPyramidGoalStructureCase(level, {
		no: () => new RedL3NoBeanBagCase(),
		one: (stack) => new RedL3OneBeanBagCase(stack),
		multiple: (stack) => new RedL3MultipleBeanBagsCase(stack),
		mixed: (stack) => new RedL3MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomRedL2GoalStructureCase(level: Level): RedL2GoalCase {
	return generateRandomRedPyramidGoalStructureCase(level, {
		no: () => new RedL2NoBeanBagCase(),
		one: (stack) => new RedL2OneBeanBagCase(stack),
		multiple: (stack) => new RedL2MultipleBeanBagsCase(stack),
		mixed: (stack) => new RedL2MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomRedL1GoalStructureCase(level: Level): RedL1GoalCase {
	return generateRandomRedPyramidGoalStructureCase(level, {
		no: () => new RedL1NoBeanBagCase(),
		one: (stack) => new RedL1OneBeanBagCase(stack),
		multiple: (stack) => new RedL1MultipleBeanBagsCase(stack),
		mixed: (stack) => new RedL1MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomRedFloorGoalStructureCase(level: Level): RedFloorGoalCase {
	const roll = Math.random();

	if (level === 'easy') {
		if (roll < 0.5) {
			return new RedFloorGoalNoBeanBagCase();
		}
		return new RedFloorGoalOneBeanBagCase(Math.floor(Math.random() * 3) as 0 | 1 | 2, [createBeanBag('red')]);
	}

	if (level === 'medium') {
		if (roll < 0.2) {
			return new RedFloorGoalNoBeanBagCase();
		}
		if (roll < 0.4) {
			return new RedFloorGoalOneBeanBagCase(Math.floor(Math.random() * 3) as 0 | 1 | 2, [createBeanBag('red')]);
		}
		return new RedFloorGoalMultipleBeanBagsCase(distributeBeanBagsAcrossStacks(generateBeanBags('red', 2, 3)));
	}

	if (roll < 0.2) {
		return new RedFloorGoalMultipleBeanBagsCase(distributeBeanBagsAcrossStacks(generateBeanBags('red', 2, 3)));
	}
	if (roll < 0.6) {
		return new RedFloorGoalMultipleMixedColorBeanBagsCase(buildFloorMixedPlacements());
	}
	return buildInvalidPlacementCase();
}
