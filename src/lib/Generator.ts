import { BlueBeanBag, RedBeanBag, YellowBeanBag, type BeanBag } from './ScoringObject';
import type { BeanBagColor } from './Scene';
import {
	BlueL1MultipleBeanBagsCase,
	BlueL1MultipleMixedColorBeanBagsCase,
	BlueL1NoBeanBagCase,
	BlueL1OneBeanBagCase,
	type BlueL1GoalCase
} from './structure/BlueL1GoalStructure';
import {
	BlueL2MultipleBeanBagsCase,
	BlueL2MultipleMixedColorBeanBagsCase,
	BlueL2NoBeanBagCase,
	BlueL2OneBeanBagCase,
	type BlueL2GoalCase
} from './structure/BlueL2GoalStructure';
import {
	BlueL3MultipleBeanBagsCase,
	BlueL3MultipleMixedColorBeanBagsCase,
	BlueL3NoBeanBagCase,
	BlueL3OneBeanBagCase,
	type BlueL3GoalCase
} from './structure/BlueL3GoalStructure';
import {
	BlueFloorGoalInvalidPlacementCase,
	BlueFloorGoalMultipleBeanBagsCase,
	BlueFloorGoalMultipleMixedColorBeanBagsCase,
	BlueFloorGoalNoBeanBagCase,
	BlueFloorGoalOneBeanBagCase,
	type BlueFloorGoalCase
} from './structure/BlueFloorGoalStructure';
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
type AllianceColor = 'red' | 'blue';

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

function buildPyramidMixedStack(alliance: AllianceColor): Stack {
	return [...generateBeanBags(alliance, 2, 4), ...generateRandomOtherColor(alliance, 1, 3)];
}

function generateRandomPyramidGoalStructureCase<T>(
	level: Level,
	alliance: AllianceColor,
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
		return factories.one([createBeanBag(Math.random() < 0.5 ? alliance : 'yellow')]);
	}

	if (level === 'medium') {
		if (roll < 0.2) {
			return factories.no();
		}
		if (roll < 0.4) {
			return factories.one([createBeanBag(alliance)]);
		}
		return factories.multiple(generateBeanBags(alliance, 2, 4));
	}

	if (roll < 0.2) {
		return factories.one([createBeanBag(alliance)]);
	}
	if (roll < 0.4) {
		return factories.multiple(generateBeanBags(alliance, 2, 4));
	}
	return factories.mixed(buildPyramidMixedStack(alliance));
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

function buildFloorMixedPlacements(alliance: AllianceColor): FloorStackPlacement[] {
	const bags = [...generateBeanBags(alliance, 2, 3), ...generateRandomOtherColor(alliance, 1, 3)];
	return distributeBeanBagsAcrossStacks(bags);
}

function buildInvalidPlacementCase(alliance: AllianceColor): RedFloorGoalInvalidPlacementCase | BlueFloorGoalInvalidPlacementCase {
	const placements: FloorStackPlacement[] = [];

	for (let i = 0; i < 3; i++) {
		const positionIndex = i as 0 | 1 | 2;

		if (Math.random() < 0.3) {
			const roll = Math.random();
			const color: BeanBagColor =
				alliance === 'red' ? (roll < 0.5 ? 'red' : roll < 0.75 ? 'blue' : 'yellow') : roll < 0.5 ? 'blue' : roll < 0.75 ? 'red' : 'yellow';
			placements.push({
				positionIndex,
				stack: [createBeanBag(color)],
				valid: false,
				invalidVariant: Math.random() < 0.5 ? 'offset' : 'rotated'
			});
		} else {
			const stack = [...generateBeanBags(alliance, 0, 2), ...generateRandomOtherColor(alliance, 0, 2)];
			if (stack.length > 0) {
				placements.push({ positionIndex, stack, valid: true });
			}
		}
	}

	return alliance === 'red' ? new RedFloorGoalInvalidPlacementCase(placements) : new BlueFloorGoalInvalidPlacementCase(placements);
}

function generateRandomFloorGoalStructureCase(alliance: AllianceColor): RedFloorGoalCase | BlueFloorGoalCase {
	const roll = Math.random();

	if (alliance === 'red') {
		if (roll < 0.5) {
			return new RedFloorGoalNoBeanBagCase();
		}
		return new RedFloorGoalOneBeanBagCase(Math.floor(Math.random() * 3) as 0 | 1 | 2, [createBeanBag('red')]);
	}

	if (roll < 0.5) {
		return new BlueFloorGoalNoBeanBagCase();
	}
	return new BlueFloorGoalOneBeanBagCase(Math.floor(Math.random() * 3) as 0 | 1 | 2, [createBeanBag('blue')]);
}

function generateRandomFloorGoalStructureCaseMedium(alliance: AllianceColor): RedFloorGoalCase | BlueFloorGoalCase {
	const roll = Math.random();

	if (roll < 0.2) {
		return alliance === 'red' ? new RedFloorGoalNoBeanBagCase() : new BlueFloorGoalNoBeanBagCase();
	}
	if (roll < 0.4) {
		const positionIndex = Math.floor(Math.random() * 3) as 0 | 1 | 2;
		return alliance === 'red'
			? new RedFloorGoalOneBeanBagCase(positionIndex, [createBeanBag('red')])
			: new BlueFloorGoalOneBeanBagCase(positionIndex, [createBeanBag('blue')]);
	}
	return alliance === 'red'
		? new RedFloorGoalMultipleBeanBagsCase(distributeBeanBagsAcrossStacks(generateBeanBags('red', 2, 3)))
		: new BlueFloorGoalMultipleBeanBagsCase(distributeBeanBagsAcrossStacks(generateBeanBags('blue', 2, 3)));
}

function generateRandomFloorGoalStructureCaseHard(alliance: AllianceColor): RedFloorGoalCase | BlueFloorGoalCase {
	const roll = Math.random();

	if (roll < 0.2) {
		return alliance === 'red'
			? new RedFloorGoalMultipleBeanBagsCase(distributeBeanBagsAcrossStacks(generateBeanBags('red', 2, 3)))
			: new BlueFloorGoalMultipleBeanBagsCase(distributeBeanBagsAcrossStacks(generateBeanBags('blue', 2, 3)));
	}
	if (roll < 0.6) {
		return alliance === 'red'
			? new RedFloorGoalMultipleMixedColorBeanBagsCase(buildFloorMixedPlacements('red'))
			: new BlueFloorGoalMultipleMixedColorBeanBagsCase(buildFloorMixedPlacements('blue'));
	}
	return buildInvalidPlacementCase(alliance);
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
	return generateRandomPyramidGoalStructureCase(level, 'red', {
		no: () => new RedL3NoBeanBagCase(),
		one: (stack) => new RedL3OneBeanBagCase(stack),
		multiple: (stack) => new RedL3MultipleBeanBagsCase(stack),
		mixed: (stack) => new RedL3MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomBlueL3GoalStructureCase(level: Level): BlueL3GoalCase {
	return generateRandomPyramidGoalStructureCase(level, 'blue', {
		no: () => new BlueL3NoBeanBagCase(),
		one: (stack) => new BlueL3OneBeanBagCase(stack),
		multiple: (stack) => new BlueL3MultipleBeanBagsCase(stack),
		mixed: (stack) => new BlueL3MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomRedL2GoalStructureCase(level: Level): RedL2GoalCase {
	return generateRandomPyramidGoalStructureCase(level, 'red', {
		no: () => new RedL2NoBeanBagCase(),
		one: (stack) => new RedL2OneBeanBagCase(stack),
		multiple: (stack) => new RedL2MultipleBeanBagsCase(stack),
		mixed: (stack) => new RedL2MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomBlueL2GoalStructureCase(level: Level): BlueL2GoalCase {
	return generateRandomPyramidGoalStructureCase(level, 'blue', {
		no: () => new BlueL2NoBeanBagCase(),
		one: (stack) => new BlueL2OneBeanBagCase(stack),
		multiple: (stack) => new BlueL2MultipleBeanBagsCase(stack),
		mixed: (stack) => new BlueL2MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomRedL1GoalStructureCase(level: Level): RedL1GoalCase {
	return generateRandomPyramidGoalStructureCase(level, 'red', {
		no: () => new RedL1NoBeanBagCase(),
		one: (stack) => new RedL1OneBeanBagCase(stack),
		multiple: (stack) => new RedL1MultipleBeanBagsCase(stack),
		mixed: (stack) => new RedL1MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomBlueL1GoalStructureCase(level: Level): BlueL1GoalCase {
	return generateRandomPyramidGoalStructureCase(level, 'blue', {
		no: () => new BlueL1NoBeanBagCase(),
		one: (stack) => new BlueL1OneBeanBagCase(stack),
		multiple: (stack) => new BlueL1MultipleBeanBagsCase(stack),
		mixed: (stack) => new BlueL1MultipleMixedColorBeanBagsCase(stack)
	});
}

export function generateRandomRedFloorGoalStructureCase(level: Level): RedFloorGoalCase {
	if (level === 'easy') {
		return generateRandomFloorGoalStructureCase('red') as RedFloorGoalCase;
	}
	if (level === 'medium') {
		return generateRandomFloorGoalStructureCaseMedium('red') as RedFloorGoalCase;
	}
	return generateRandomFloorGoalStructureCaseHard('red') as RedFloorGoalCase;
}

export function generateRandomBlueFloorGoalStructureCase(level: Level): BlueFloorGoalCase {
	if (level === 'easy') {
		return generateRandomFloorGoalStructureCase('blue') as BlueFloorGoalCase;
	}
	if (level === 'medium') {
		return generateRandomFloorGoalStructureCaseMedium('blue') as BlueFloorGoalCase;
	}
	return generateRandomFloorGoalStructureCaseHard('blue') as BlueFloorGoalCase;
}
