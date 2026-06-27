import type { PinColor, Scene } from './Scene';
import type { StructureScoring } from './Scoring';

export abstract class ScoringObject {
	public robot1Contacted = false;
	public robot2Contacted = false;
}

export abstract class Pin extends ScoringObject {
	public readonly color: PinColor;

	constructor(color: PinColor) {
		super();
		this.color = color;
	}
}

export class RedPin extends Pin {
	constructor() {
		super('red');
	}
}

export class BluePin extends Pin {
	constructor() {
		super('blue');
	}
}

export class OrangePin extends Pin {
	constructor() {
		super('orange');
	}
}

export class Beam extends ScoringObject {
	constructor() {
		super();
	}
}

export abstract class Structure {
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene): Promise<void>;
}

export class Resources {
	public readonly redPinsMaxCount = 10;
	public readonly bluePinsMaxCount = 10;
	public readonly orangePinsMaxCount = 16;
	public readonly beamsMaxCount = 2;

	private structures: Structure[] = [];
	private redPinsUsed = 0;
	private bluePinsUsed = 0;
	private orangePinsUsed = 0;
	private beamsUsed = 0;

	public use(structure: Structure): void {
		const elements = structure.getElements();
		let redPinsCount = this.redPinsUsed;
		let bluePinsCount = this.bluePinsUsed;
		let orangePinsCount = this.orangePinsUsed;
		let beamsCount = this.beamsUsed;
		for (const element of elements) {
			if (element instanceof RedPin) {
				redPinsCount++;
				if (redPinsCount > this.redPinsMaxCount) {
					throw new Error('Red pins count exceeds max count');
				}
			}
			if (element instanceof BluePin) {
				bluePinsCount++;
				if (bluePinsCount > this.bluePinsMaxCount) {
					throw new Error('Blue pins count exceeds max count');
				}
			}
			if (element instanceof OrangePin) {
				orangePinsCount++;
				if (orangePinsCount > this.orangePinsMaxCount) {
					throw new Error('Orange pins count exceeds max count');
				}
			}
			if (element instanceof Beam) {
				beamsCount++;
				if (beamsCount > this.beamsMaxCount) {
					throw new Error('Beams count exceeds max count');
				}
			}
		}
		this.redPinsUsed += redPinsCount;
		this.bluePinsUsed += bluePinsCount;
		this.orangePinsUsed += orangePinsCount;
		this.beamsUsed += beamsCount;
		this.structures.push(structure);
	}

	public getRedPinsUsed(): number {
		return this.redPinsUsed;
	}

	public getBluePinsUsed(): number {
		return this.bluePinsUsed;
	}

	public getOrangePinsUsed(): number {
		return this.orangePinsUsed;
	}

	public getBeamsUsed(): number {
		return this.beamsUsed;
	}

	public getStructures(): Structure[] {
		return this.structures;
	}
}
