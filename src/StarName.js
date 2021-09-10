import PseudoRandom from "./PseudoRandom";

const SYLLABLES = [
	'a', 'agg',	'atta',	'akk',
	'bah', 'boo',
	'coru',	'cron',	'corell', 'cu',
	'dago',	'do',
	'er', 'ej',
	'fra',
	'ga',
	'hun', 'ho',
	'ian', 'ill', 'iter',
	'jar', 'jup',
	'ko',
	'lu', 'lo',
	'ma', 'mer',
	'na', 'ne',	'nep', 'nil', 'nt',
	'ool', 'ol', 'org', 
	'po', 'plu',
	'qua',
	'ra', 'ry',	'rel', 'rg',
	'sat', 'sun', 'sca',
	'ta', 'to',	'th', 'tu',	'ter',
	'ul', 'urn', 'us',
	'ven', 'vu', 'vel',
	'win',
	'xen', 'xo',
	'yo',
	'za', 'zo'
];
const DEFAULT_SEEDS = [1, 2, 3];

class StarName {
	constructor(seeds) {
		// if (!seeds) this.name = StarName.getRandomName();
		// else this.name = StarName.getProceduralName(seeds);
		this.name = StarName.getProceduralName(seeds);
	}

	toString() {
		return this.name;
	}

	static getProceduralName(seeds = DEFAULT_SEEDS) {
		const pr = new PseudoRandom(seeds);
		let syllablesNumber = pr.getNext(3) + 1; // integer between 2 and 4
		let name = '';
		while (syllablesNumber--) {
			const i = pr.getNext(SYLLABLES.length) - 1;
			name += SYLLABLES[i];
		}
		name = name.charAt(0).toUpperCase() + name.slice(1);
		return name;
	}

	// static getRandomName() {
	// 	let syllablesNumber = g.dice.getRandomIntegerBetween(2,4);
	// 	let name = '';
	// 	while (syllablesNumber--) {
	// 		name += g.dice.selectRandom(SYLLABLES);
	// 	}
	// 	name = name.charAt(0).toUpperCase() + name.slice(1);
	// 	return name;
	// }
}

export default StarName;
