import GalaxySector from './GalaxySector.js';

class Galaxy {
	constructor(seed) {
		this.seed = seed;
	}

	getSector(x, y) {
		return new GalaxySector([x, y], this.seed);
	}

	getSystem(x, y, i) {
		const sector = this.getSector(x, y);
		return sector.systems[i];
	}
}

export default Galaxy;
