import { BluePin, OrangePin, RedPin, Resources, Structure, Pin } from './ScoringObject.js';
import type { PinColor } from './Scene.js';
import { StandoffGoalStructure } from './structure/StandoffGoalStructure.js';
import { BeamOnFloorStructure } from './structure/BeamOnFloorStructure.js';
import { FloorGoalStructure } from './structure/FloorGoalStructure.js';
import { BlueSquareGoal } from './structure/BlueSquareGoal.js';
import { RedSquareGoal } from './structure/RedSquareGoal.js';
import { RedTriangleGoal } from './structure/RedTriangleGoal.js';
import { BlueTriangleGoal } from './structure/BlueTriangleGoal.js';
import { StartingPinCase, StartingPinStructure } from './structure/StartingPinStructure.js';
import { StacksOnFloorStructure } from './structure/StacksOnFloorStructure.js';
import { RemainingPinsStructure, generateRemainingPinsCase } from './structure/RemainingPinsStructure.js';
import {
	generateRandomBeamOnFloorStructureCase,
	generateRandomBlueSquareGoalStructureCase,
	generateRandomBlueTriangleGoalStructureCase,
	generateRandomFloorGoalStructureCase,
	generateRandomRedSquareGoalStructureCase,
	generateRandomRedTriangleGoalStructureCase,
	generateRandomStacksOnFloorCase,
	generateRandomStandoffGoalStructureCase,
	generateRandomStartingPinStructureCase
} from './Generator.js';
import { Scenario } from './Scenario.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface AvailableResources {
	red: number;
	blue: number;
	orange: number;
	beams: number;
}

class ResourceTracker {
	private available: AvailableResources;

	constructor() {
		this.available = {
			red: 10,
			blue: 10,
			orange: 16,
			beams: 2
		};
	}

	getAvailable(): AvailableResources {
		return { ...this.available };
	}

	canAfford(pins: Pin[]): boolean {
		const needed = { red: 0, blue: 0, orange: 0 };
		for (const pin of pins) {
			needed[pin.color]++;
		}
		return needed.red <= this.available.red && needed.blue <= this.available.blue && needed.orange <= this.available.orange;
	}

	canAffordBeams(count: number): boolean {
		return count <= this.available.beams;
	}

	use(pins: Pin[], beams: number = 0): void {
		for (const pin of pins) {
			this.available[pin.color]--;
		}
		this.available.beams -= beams;
	}

	getAvailableColors(): PinColor[] {
		const colors: PinColor[] = [];
		if (this.available.red > 0) colors.push('red');
		if (this.available.blue > 0) colors.push('blue');
		if (this.available.orange > 0) colors.push('orange');
		return colors;
	}

	getTotalPinsAvailable(): number {
		return this.available.red + this.available.blue + this.available.orange;
	}
}

function createPinByColor(color: PinColor): Pin {
	switch (color) {
		case 'red':
			return new RedPin();
		case 'blue':
			return new BluePin();
		case 'orange':
			return new OrangePin();
	}
}

function generateColumnWithAvailableColors(availableColors: PinColor[], targetCount: number): Pin[] {
	const pins: Pin[] = [];
	const shuffled = [...availableColors].sort(() => Math.random() - 0.5);

	for (let i = 0; i < targetCount && i < shuffled.length; i++) {
		pins.push(createPinByColor(shuffled[i]!));
	}

	return pins;
}

export class ScenarioGenerator {
	private difficulty: Difficulty;
	private tracker: ResourceTracker;

	constructor(difficulty: Difficulty) {
		this.difficulty = difficulty;
		this.tracker = new ResourceTracker();
	}

	private getMaxAttemptsForStructure(): number {
		return 100;
	}

	private generateStandoffGoal(): StandoffGoalStructure | null {
		// Standoff goal always needs at least 1 beam
		if (!this.tracker.canAffordBeams(1)) {
			return null;
		}

		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateRandomStandoffGoalStructureCase(this.difficulty);
				const structure = new StandoffGoalStructure(caseData, Math.floor(Math.random() * 360));

				const elements = structure.getElements();
				const pins = elements.filter((e) => e instanceof Pin) as Pin[];
				const beamCount = elements.filter((e) => !(e instanceof Pin)).length;

				if (this.tracker.canAfford(pins) && this.tracker.canAffordBeams(beamCount)) {
					this.tracker.use(pins, beamCount);
					return structure;
				}
			} catch (e) {
				// Try again
			}
		}

		return null;
	}

	private generateBeamOnFloor(): BeamOnFloorStructure | null {
		// Beam on floor needs at least 1 beam
		if (!this.tracker.canAffordBeams(1)) {
			return null;
		}

		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateRandomBeamOnFloorStructureCase(this.difficulty);
				const structure = new BeamOnFloorStructure(caseData, Math.floor(Math.random() * 1000000000));

				const elements = structure.getElements();
				const pins = elements.filter((e) => e instanceof Pin) as Pin[];
				const beamCount = elements.filter((e) => !(e instanceof Pin)).length;

				if (this.tracker.canAfford(pins) && this.tracker.canAffordBeams(beamCount)) {
					this.tracker.use(pins, beamCount);
					return structure;
				}
			} catch (e) {
				// Try again
			}
		}

		return null;
	}

	private generateFloorGoal(): FloorGoalStructure | null {
		const availableColors = this.tracker.getAvailableColors();
		if (availableColors.length === 0) return null;

		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateRandomFloorGoalStructureCase(this.difficulty);
				const structure = new FloorGoalStructure(caseData, Math.floor(Math.random() * 1000000000));

				const elements = structure.getElements();
				const pins = elements.filter((e) => e instanceof Pin) as Pin[];

				if (this.tracker.canAfford(pins)) {
					this.tracker.use(pins);
					return structure;
				}
			} catch (e) {
				// Try again
			}
		}

		// If random generation fails, try to create a simpler structure with available resources
		return this.generateSimpleFloorGoal();
	}

	private generateSimpleFloorGoal(): FloorGoalStructure | null {
		const availableColors = this.tracker.getAvailableColors();
		if (availableColors.length === 0) return null;

		// Try with decreasing complexity
		for (let pinCount = 3; pinCount >= 1; pinCount--) {
			try {
				const pins = generateColumnWithAvailableColors(availableColors, pinCount);
				if (pins.length > 0 && this.tracker.canAfford(pins)) {
					// Create a simple case manually
					const simpleCaseData = generateRandomFloorGoalStructureCase('easy');
					const structure = new FloorGoalStructure(simpleCaseData, Math.floor(Math.random() * 1000000000));

					this.tracker.use(pins);
					return structure;
				}
			} catch (e) {
				continue;
			}
		}

		return null;
	}

	private generateBlueSquareGoal(): Structure | null {
		return this.generateGoalStructure(
			() => generateRandomBlueSquareGoalStructureCase(this.difficulty),
			(caseData) => new BlueSquareGoal(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateRedSquareGoal(): Structure | null {
		return this.generateGoalStructure(
			() => generateRandomRedSquareGoalStructureCase(this.difficulty),
			(caseData) => new RedSquareGoal(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateRedTriangleGoal(): Structure | null {
		return this.generateGoalStructure(
			() => generateRandomRedTriangleGoalStructureCase(this.difficulty),
			(caseData) => new RedTriangleGoal(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateBlueTriangleGoal(): Structure | null {
		return this.generateGoalStructure(
			() => generateRandomBlueTriangleGoalStructureCase(this.difficulty),
			(caseData) => new BlueTriangleGoal(caseData, Math.floor(Math.random() * 1000000000))
		);
	}

	private generateGoalStructure(generateCase: () => any, createStructure: (caseData: any) => Structure): Structure | null {
		const availableColors = this.tracker.getAvailableColors();
		if (availableColors.length === 0) return null;

		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateCase();
				const structure = createStructure(caseData);

				const elements = structure.getElements();
				const pins = elements.filter((e) => e instanceof Pin) as Pin[];

				if (this.tracker.canAfford(pins)) {
					this.tracker.use(pins);
					return structure;
				}
			} catch (e) {
				// Try again
			}
		}

		return null;
	}

	private generateStacksOnFloor(): StacksOnFloorStructure | null {
		const availableColors = this.tracker.getAvailableColors();
		if (availableColors.length === 0) return null;

		const available = this.tracker.getAvailable();

		try {
			const caseData = generateRandomStacksOnFloorCase(this.difficulty, available.red, available.blue, available.orange);
			const structure = new StacksOnFloorStructure(caseData);

			const elements = structure.getElements();
			const pins = elements.filter((e) => e instanceof Pin) as Pin[];

			if (this.tracker.canAfford(pins)) {
				this.tracker.use(pins);
				return structure;
			}
		} catch (e) {
			console.warn('Failed to generate stacks on floor:', e);
		}

		return null;
	}

	private generateStartingPin(): StartingPinStructure | null {
		const availableColors = this.tracker.getAvailableColors();
		if (availableColors.length === 0) {
			return new StartingPinStructure(new StartingPinCase(false, false, false, false));
		}

		for (let attempt = 0; attempt < this.getMaxAttemptsForStructure(); attempt++) {
			try {
				const caseData = generateRandomStartingPinStructureCase(this.difficulty);
				const structure = new StartingPinStructure(caseData);

				const elements = structure.getElements();
				const pins = elements.filter((e) => e instanceof Pin) as Pin[];

				if (this.tracker.canAfford(pins)) {
					this.tracker.use(pins);
					return structure;
				}
			} catch (e) {
				// Try again
			}
		}

		return new StartingPinStructure(new StartingPinCase(false, false, false, false));
	}

	public generate(): Scenario {
		// 1. Generate Standoff Goal (highest priority - uses beam)
		const standoff = this.generateStandoffGoal();
		if (standoff) {
			console.log('Generated: StandoffGoal');
		} else {
			console.warn('Failed to generate StandoffGoal');
			throw new Error('Failed to generate StandoffGoal');
		}

		// 2. Generate Beam on Floor (second priority - uses beam)
		const beamOnFloor = this.generateBeamOnFloor();
		if (beamOnFloor) {
			console.log('Generated: BeamOnFloor');
		} else {
			console.warn('Failed to generate BeamOnFloor');
			throw new Error('Failed to generate BeamOnFloor');
		}

		// 3. Generate Floor Goal
		const floorGoal = this.generateFloorGoal();
		if (floorGoal) {
			console.log('Generated: FloorGoal');
		} else {
			console.warn('Failed to generate FloorGoal');
			throw new Error('Failed to generate FloorGoal');
		}

		// 4-8. Generate Square Goals, Triangle Goals, and Stacks on Floor (order randomized)
		const goalGenerators = [
			{ name: 'BlueSquareGoal', fn: () => this.generateBlueSquareGoal() },
			{ name: 'RedSquareGoal', fn: () => this.generateRedSquareGoal() },
			{ name: 'RedTriangleGoal', fn: () => this.generateRedTriangleGoal() },
			{ name: 'BlueTriangleGoal', fn: () => this.generateBlueTriangleGoal() },
			{ name: 'StacksOnFloor', fn: () => this.generateStacksOnFloor() }
		];

		// Shuffle to randomize order
		goalGenerators.sort(() => Math.random() - 0.5);

		const otherStructures: Structure[] = [];
		for (const generator of goalGenerators) {
			const goal = generator.fn();
			if (goal) {
				otherStructures.push(goal);
				console.log(`Generated: ${generator.name}`);
			} else {
				console.warn(`Failed to generate ${generator.name}`);
			}
		}

		// 9. Generate Starting Pin
		const startingPin = this.generateStartingPin();
		if (startingPin) {
			console.log('Generated: StartingPin');
		} else {
			console.warn('Failed to generate StartingPin');
			throw new Error('Failed to generate StartingPin');
		}

		// 10. Generate Remaining Pins (last - displays all unused orange pins)
		const available = this.tracker.getAvailable();
		const caseData = generateRemainingPinsCase(available.orange);
		const remainingPins = new RemainingPinsStructure(caseData);
		const elements = remainingPins.getElements();
		const pins = elements.filter((e) => e instanceof Pin) as Pin[];
		// Use the remaining orange pins
		this.tracker.use(pins);
		console.log(`Generated: RemainingPins (${available.orange} orange pins)`);

		const scenario = new Scenario(standoff, beamOnFloor, floorGoal, otherStructures, startingPin, remainingPins);

		const finalAvailable = this.tracker.getAvailable();
		console.log('Resources remaining:', finalAvailable);
		console.log(`Total structures generated: ${scenario.structures.length}/10`);

		return scenario;
	}
}

export function generateScenario(difficulty: Difficulty): Scenario {
	const generator = new ScenarioGenerator(difficulty);
	return generator.generate();
}
