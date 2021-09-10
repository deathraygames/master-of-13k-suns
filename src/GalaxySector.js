import PseudoRandom from './PseudoRandom.js';
import GalaxySystem from './GalaxySystem.js';

const SECTOR_COORDINATE_SIZE = 10000;

class GalaxySector {
	constructor(coordinates = [0, 0], galaxySeed = 0) {
		const pr = new PseudoRandom([...coordinates, galaxySeed]);
		this.galaxyPosition = {
			x: coordinates[0],
			y: coordinates[1],
		};
		this.name = coordinates.join(', ');
		// TODO: Base system count on proximity to center
		this.systemCount = pr.getNext(10);
		this.systems = [];
		for(let i = 0; i < this.systemCount; i += 1) {
			const sectorX = pr.getNext(SECTOR_COORDINATE_SIZE);
			const sectorY = pr.getNext(SECTOR_COORDINATE_SIZE);
			const system = new GalaxySystem([sectorX, sectorY], galaxySeed, this, i);
			// TODO: Adjust size based on overlap
			this.systems.push(system);
		}
	}
}

export default GalaxySector;
