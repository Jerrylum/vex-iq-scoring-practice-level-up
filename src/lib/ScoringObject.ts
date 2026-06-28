import type { BeanBagColor, Scene } from './Scene';
import type { StructureScoring } from './Scoring';

export abstract class ScoringObject {
	public robot1Contacted = false;
	public robot2Contacted = false;
}

export abstract class BeanBag extends ScoringObject {
	public readonly color: BeanBagColor;

	constructor(color: BeanBagColor) {
		super();
		this.color = color;
	}
}

export class RedBeanBag extends BeanBag {
	constructor() {
		super('red');
	}
}

export class BlueBeanBag extends BeanBag {
	constructor() {
		super('blue');
	}
}

export class YellowBeanBag extends BeanBag {
	constructor() {
		super('yellow');
	}
}

export abstract class Structure {
	public abstract getElements(): ScoringObject[];
	public abstract getScoring(): StructureScoring;
	public abstract visualize(scene: Scene): Promise<void>;
}

export class Resources {
	public readonly redBeanBagsMaxCount = 16;
	public readonly blueBeanBagsMaxCount = 16;
	public readonly yellowBeanBagsMaxCount = 6;

	private structures: Structure[] = [];
	private redBeanBagsUsed = 0;
	private blueBeanBagsUsed = 0;
	private yellowBeanBagsUsed = 0;

	public use(structure: Structure): void {
		const elements = structure.getElements();
		let redCount = this.redBeanBagsUsed;
		let blueCount = this.blueBeanBagsUsed;
		let yellowCount = this.yellowBeanBagsUsed;

		for (const element of elements) {
			if (element instanceof RedBeanBag) {
				redCount++;
				if (redCount > this.redBeanBagsMaxCount) {
					throw new Error('Red bean bags count exceeds max count');
				}
			}
			if (element instanceof BlueBeanBag) {
				blueCount++;
				if (blueCount > this.blueBeanBagsMaxCount) {
					throw new Error('Blue bean bags count exceeds max count');
				}
			}
			if (element instanceof YellowBeanBag) {
				yellowCount++;
				if (yellowCount > this.yellowBeanBagsMaxCount) {
					throw new Error('Yellow bean bags count exceeds max count');
				}
			}
		}

		this.redBeanBagsUsed = redCount;
		this.blueBeanBagsUsed = blueCount;
		this.yellowBeanBagsUsed = yellowCount;
		this.structures.push(structure);
	}

	public getRedBeanBagsUsed(): number {
		return this.redBeanBagsUsed;
	}

	public getBlueBeanBagsUsed(): number {
		return this.blueBeanBagsUsed;
	}

	public getYellowBeanBagsUsed(): number {
		return this.yellowBeanBagsUsed;
	}

	public getStructures(): Structure[] {
		return this.structures;
	}
}

export function countBeanBags(elements: ScoringObject[]): { red: number; blue: number; yellow: number } {
	const counts = { red: 0, blue: 0, yellow: 0 };
	for (const element of elements) {
		if (element instanceof RedBeanBag) counts.red++;
		else if (element instanceof BlueBeanBag) counts.blue++;
		else if (element instanceof YellowBeanBag) counts.yellow++;
	}
	return counts;
}
