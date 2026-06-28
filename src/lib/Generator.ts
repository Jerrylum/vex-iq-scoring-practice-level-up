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
	RedL3MultipleBeanBagsCase,
	RedL3MultipleMixedColorBeanBagsCase,
	RedL3NoBeanBagCase,
	RedL3OneBeanBagCase,
	type RedL3GoalCase
} from './structure/RedL3GoalStructure';
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

function buildRedL3MixedStack(): Stack {
	return [...generateBeanBags('red', 2, 3), ...generateRandomOtherColor('red', 1, 3)];
}

export function generateRandomRedL3GoalStructureCase(level: Level): RedL3GoalCase {
	const roll = Math.random();

	if (level === 'easy') {
		if (roll < 0.5) {
			return new RedL3NoBeanBagCase();
		}
		return new RedL3OneBeanBagCase([createBeanBag(Math.random() < 0.5 ? 'red' : 'yellow')]);
	}

	if (level === 'medium') {
		if (roll < 0.2) {
			return new RedL3NoBeanBagCase();
		}
		if (roll < 0.4) {
			return new RedL3OneBeanBagCase([createBeanBag('red')]);
		}
		return new RedL3MultipleBeanBagsCase(generateBeanBags('red', 2, 3));
	}

	if (roll < 0.2) {
		return new RedL3OneBeanBagCase([createBeanBag('red')]);
	}
	if (roll < 0.4) {
		return new RedL3MultipleBeanBagsCase(generateBeanBags('red', 2, 3));
	}
	return new RedL3MultipleMixedColorBeanBagsCase(buildRedL3MixedStack());
}
