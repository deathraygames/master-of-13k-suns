const RUNNING_INCREMENT = 8;
const MULTIPLIER = 10001;
const SEED_NORMALIZER = 999999;

class PseudoRandom {
	constructor(seeds = [0]) {
		if (typeof seeds === 'number') {
			this.seeds = [seeds];
			this.seed = seeds;
		} else {
			this.seeds = [...seeds];
			this.seed = PseudoRandom.getSeedFromArray(seeds);
		}
		this.runningSeed = this.seed;
		this.i = 0;
	}

	/** Get a pseudo random number */
	static get(n) {
		// From http://stackoverflow.com/a/19303725/1766230
		// via https://github.com/rocket-boots/rocket-boots/blob/master/scripts/rocketboots/Dice.js
		return PseudoRandom.chop(Math.sin(n) * MULTIPLIER);
	}

	/** Chop off the integer and leave the decimals */
	static chop(n) {
		return n - Math.floor(n);
	}

	static normalize(rand, n) {
		return (Math.floor(rand * n) + 1);
	}

	static getSeedFromArray(seeds = [0], normalizer = SEED_NORMALIZER) {
		const r = seeds.reduce((sum, seed) => PseudoRandom.get(seed + sum + RUNNING_INCREMENT), 0);
		return PseudoRandom.normalize(r, normalizer);
	}

	/** Increment the running seed */
	next(r) {
		const direction = (r > 0.5) ? 1 : -1;
		this.runningSeed += PseudoRandom.normalize(r, SEED_NORMALIZER) * direction;
		this.i += 1;
	}

	/** Get the current random value, optionally normalized, and then increment the running seed */
	getNext(normalizer = 0) {
		const r = PseudoRandom.get(this.runningSeed);
		this.next(r);
		if (normalizer) return PseudoRandom.normalize(r, normalizer);
		return r;
	}

	/** Get the current random value, optionally normalized */
	get(normalizer = 0) {
		const r = PseudoRandom.get(this.runningSeed);
		if (normalizer) return PseudoRandom.normalize(r, normalizer);
		return r;
	}

	getNextBell(n) { // bell curve around zero, from -n to +n
		const a = this.getNext();
		const b = this.getNext();
		return (n * (a - b));
	}

	getNormalizedArray(maxValues = []) {
		return maxValues.map((n) => this.getNext(n));
	}
}

export default PseudoRandom;
