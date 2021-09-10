import GalaxySector from "./GalaxySector";

class Galaxy {
	constructor(seed) {
		this.seed = seed;
	}

	getSector(x, y) {
		return new GalaxySector([x, y], this.seed);
	}
}

export default Galaxy;
