import * as THREE from 'three';
import type { BeanBag } from '../ScoringObject';
import type { Scene } from '../Scene';
import { mulberry32 } from '../utils';

export type Stack = BeanBag[];

export const BEAN_BAG_HEIGHT = 20;
export const FT = 12 * 25.4;

/** Half the center-to-center spacing for bean bags sharing a level (~100 mm apart). */
const BEAN_BAG_HALF_SPREAD = 50;
const POSITION_JITTER = 4;
const ROTATION_VARIANCE = 0.25;

export const L4_STACK_POSITIONS = [new THREE.Vector3(FT * 0.5, 605, FT), new THREE.Vector3(-FT * 0.5, 605, -FT)];

export const RED_L3_STACK_POSITION = new THREE.Vector3(-FT * 2.75, 200, FT * 3.75);

interface StackSlot {
	x: number;
	z: number;
	y: number;
}

function jitter(random: () => number, amount = POSITION_JITTER): number {
	return (random() - 0.5) * amount;
}

function slot(x: number, z: number, y: number, random: () => number): StackSlot {
	return { x: x + jitter(random), z: z + jitter(random), y };
}

const LEFT_COLUMN = { x: -BEAN_BAG_HALF_SPREAD, z: 0 };
const RIGHT_COLUMN = { x: BEAN_BAG_HALF_SPREAD, z: 0 };

function pickShorterColumn(columnLayers: [number, number], random: () => number): 0 | 1 {
	if (columnLayers[0] < columnLayers[1]) return 0;
	if (columnLayers[1] < columnLayers[0]) return 1;
	return random() < 0.5 ? 0 : 1;
}

function computeStackSlots(count: number, random: () => number): StackSlot[] {
	const slots: StackSlot[] = [];

	if (count === 0) {
		return slots;
	}

	if (count === 1) {
		slots.push(slot(0, 0, 0, random));
		return slots;
	}

	if (count === 2) {
		if (random() < 0.5) {
			slots.push(slot(LEFT_COLUMN.x, LEFT_COLUMN.z, 0, random));
			slots.push(slot(RIGHT_COLUMN.x, RIGHT_COLUMN.z, 0, random));
		} else {
			slots.push(slot(0, 0, 0, random));
			slots.push(slot(0, 0, BEAN_BAG_HEIGHT, random));
		}
		return slots;
	}

	// Three or more: two base bags (one per column), then stack upward within each column.
	slots.push(slot(LEFT_COLUMN.x, LEFT_COLUMN.z, 0, random));
	slots.push(slot(RIGHT_COLUMN.x, RIGHT_COLUMN.z, 0, random));

	const columns = [LEFT_COLUMN, RIGHT_COLUMN] as const;
	// layer index per column — 0 is the base bag already placed; next upper bag uses layer 1
	const columnLayers: [number, number] = [1, 1];

	for (let i = 2; i < count; i++) {
		const col = pickShorterColumn(columnLayers, random);
		const { x, z } = columns[col];
		const layer = columnLayers[col];
		slots.push(slot(x, z, BEAN_BAG_HEIGHT * layer, random));
		columnLayers[col]++;
	}

	return slots;
}

export async function visualizeStack(scene: Scene, basePosition: THREE.Vector3, stack: Stack, seed: number): Promise<void> {
	if (stack.length === 0) {
		return;
	}

	const random = mulberry32(seed);
	const slots = computeStackSlots(stack.length, random);

	for (let i = 0; i < stack.length; i++) {
		const bag = stack[i];
		const slotPos = slots[i];
		if (!bag || !slotPos) {
			continue;
		}

		const position = new THREE.Vector3(basePosition.x + slotPos.x, basePosition.y + slotPos.y, basePosition.z + slotPos.z);
		const rotation = new THREE.Euler((random() - 0.5) * ROTATION_VARIANCE, random() * Math.PI * 2, (random() - 0.5) * ROTATION_VARIANCE);

		await scene.addBeanBag(bag.color, position, rotation);
	}
}
