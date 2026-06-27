import * as THREE from 'three';
import { Structure, ScoringObject, Pin } from '../ScoringObject';
import type { Scene } from '../Scene';
import { isStack, isThreeColorStack, isTwoColorStack, type StructureScoring } from '../Scoring';

export class StacksOnFloorStructure extends Structure {
	public readonly theCase: StacksOnFloorCase;

	constructor(theCase: StacksOnFloorCase) {
		super();
		this.theCase = theCase;
	}

	public getElements(): ScoringObject[] {
		return this.theCase.getElements();
	}

	public getScoring(): StructureScoring {
		return this.theCase.getScoring();
	}

	public visualize(scene: Scene): Promise<void> {
		return this.theCase.visualize(scene, this);
	}
}

export class StacksOnFloorCase {
	constructor(private readonly stacks: Pin[][]) {}

	public getElements(): ScoringObject[] {
		const elements: ScoringObject[] = [];
		for (const stack of this.stacks) {
			elements.push(...stack);
		}
		return elements;
	}

	public getScoring(): StructureScoring {
		return {
			connectedPins: this.stacks.reduce((acc, stack) => acc + (isStack(stack) ? stack.length : 0), 0),
			connectedBeams: 0,
			twoColorStacks: this.stacks.reduce((acc, stack) => acc + (isTwoColorStack(stack) ? 1 : 0), 0),
			threeColorStacks: this.stacks.reduce((acc, stack) => acc + (isThreeColorStack(stack) ? 1 : 0), 0),
			matchingGoals: 0,
			stacksPlacedOnStandoffGoal: 0
		};
	}

	public async visualize(scene: Scene, structure: StacksOnFloorStructure): Promise<void> {
		const basePosition = new THREE.Vector3(0, -114, -600);
		const stackSpacing = 12 * 25.4; // 12 inches in mm
		const pinHeight = 60; // mm, approximate height of a pin

		// Calculate starting X position to center the stacks
		const totalWidth = (this.stacks.length - 1) * stackSpacing;
		const startX = -totalWidth / 2;

		for (let i = 0; i < this.stacks.length; i++) {
			const stack = this.stacks[i];
			if (!stack) continue;

			const stackX = startX + i * stackSpacing;

			for (let j = 0; j < stack.length; j++) {
				const pin = stack[j];
				if (!pin) continue;

				const yPosition = j * pinHeight;

				await scene.addPin(pin.color, new THREE.Vector3(stackX, basePosition.y + yPosition, basePosition.z), new THREE.Euler(0, 0, 0));
			}
		}
	}
}
