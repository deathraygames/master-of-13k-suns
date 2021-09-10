import PseudoRandom from './PseudoRandom.js';
import StarName from './StarName.js';

// from galGen
const LUMINOSITY_CLASSES = [
	{ name: 'hypergiant', luminosityClass: 'Ia+' },
	{ name: 'luminous supergiant', luminosityClass: 'Ia' },
	{ name: 'intermediate luminous superigant', luminosityClass: 'Iab' },
	{ name: 'less luminous supergiant', luminosityClass: 'Ib' },
	{ name: 'bright giant', luminosityClass: 'II' },
	{ name: 'normal giant', luminosityClass: 'III' },
	{ name: 'subgiant', luminosityClass: 'IV' },
	{ name: 'dwarf (main-sequence star)', luminosityClass: 'V' },
	{ name: 'subdwarf', luminosityClass: 'sd' },
	{ name: 'white dwarf', luminosityClass: 'D' },
];
const MAX_LUMINOSITY_LEVEL = LUMINOSITY_CLASSES.length - 1;
const TEMP_CLASSES = [
	{
		tempClass: 'O',
		color: 'blue',
		rgb: [100,100,255]
	},{
		tempClass: 'B',
		color: 'blue white',
		rgb: [150,200,255]
	},{
		tempClass: 'A',
		color: 'white',
		rgb: [255,255,255]
	},{
		tempClass: 'F',
		color: 'yellow white',
		rgb: [255,255,100]
	},{
		tempClass: 'G',
		color: 'yellow',
		rgb: [255,255,100]
	},{
		tempClass: 'K',
		color: 'orange',
		rgb: [255,200,100]
	},{
		tempClass: 'M',
		color: 'red',
		rgb: [255,100,100]
	}
];
const MAX_HEAT_LEVEL = 700; // 7 Classes * 10 numerals * 10 fractions

class GalaxySystem {
	constructor(coordinates = [0, 0], galaxySeed = 0, sector, sectorSystemIndex) {
		this.sector = sector;
		this.sectorSystemIndex = sectorSystemIndex;
		this.sectorCoordinates = coordinates;
		const seeds = [...coordinates, galaxySeed];
		const pr = new PseudoRandom(seeds);
		this.sunSize = pr.getNext(1000);
		this.planetCount = pr.getNext(20);
		this.name = (new StarName(seeds)).toString();
		this.heatLevel = Math.floor(Math.abs(pr.getNextBell(MAX_HEAT_LEVEL)));
		this.luminosityLevel = pr.getNext(MAX_LUMINOSITY_LEVEL + 1) - 1; // index integer between 0 and max
		this.spectralClassification = GalaxySystem.getSpectralClassification(this.heatLevel, this.luminosityLevel);
		this.dna = this.createDna(pr);
	}

	createDna(pr) {
		this.dna = [];
		for(let i = 0; i < 12; i += 1) {
			this.dna.push(pr.getNext());
		}
		return this.dna;
	}

	static getSpectralClassification(heatLevel, luminosityLevel) { // from galGen
		let i = 6 - Math.floor(heatLevel / 100); /* 10 * 10 */
		let sc = { ...TEMP_CLASSES[i] };
		let lc = LUMINOSITY_CLASSES[luminosityLevel];
		sc.drawColor = `rgb(${sc.rgb[0]}, ${sc.rgb[1]}, ${sc.rgb[2]})`;
		sc.numeral = Math.floor(heatLevel / 7) / 10;
		sc.luminosityClass = lc.luminosityClass;
		sc.luminosityName = lc.name;
		return sc;
	}
}

export default GalaxySystem;
