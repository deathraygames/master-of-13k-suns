const THING_SHIP = 'ship';
const THING_STATION = 'station';
const THING_DATA_KEYS = {
	ship: 'fleet',
	station: 'stations',
};
const THING_COMPUTED_RATE = {
	ship: 'shipConstructionRate',
	station: 'stationConstructionRate',
};

const SHIP_DETAILS = Object.freeze({
	command: {
		name: 'Command Ship',
		maxHealth: 4000,
		shipConstructionRate: 8,
		stationConstructionRate: 8,
		resourceCollectionRate: 8,
		maxResources: 4,
		queueMax: 2,
	},
	scouts: {
		name: 'Scouts',
		maxHealth: 100,
		scienceRate: 0.1,
	},
	colonizers: {
		name: 'Colonizers',
		maxHealth: 1200,
		maxResources: 8,
		stationConstructionRate: 10
	},
	constructors: {
		name: 'Constructors',
		maxHealth: 400,
		shipConstructionRate: 1,
		stationConstructionRate: 3,
	},
	// battleships: { name: 'Battleships', maxHealth: 800 },
	miners: {
		name: 'Mining Ships',
		maxHealth: 200,
		resourceCollectionRate: 2
	},
	haulers: { name: 'Haulers', maxHealth: 200, maxResources: 8 },
});

const STATION_DETAILS = Object.freeze({
	settlements: { name: 'Settlements',
		maxHealth: 1000, // costs more because they contribute to settled system count
		maxResources: 100,
	},
	shipyards: { name: 'Shipyards',
		maxHealth: 900,
		shipConstructionRate: 10,
		maxResources: 5,
	},
	collectors: { name: 'Collectors',
		maxHealth: 750,
		resourceCollectionRate: 9,
		maxResources: 5,
	},
	laboratory: {
		name: 'Laboratory',
		maxHealth: 1000,
		scienceRate: 1.4,
		resourceCollectionRate: 1,
	},
	administration: {
		name: 'Administration Center',
		maxHealth: 850,
		maxResources: 10,
		queueMax: 3
	},
});

const SHIP_KEYS = Object.keys(SHIP_DETAILS);
const STATION_KEYS = Object.keys(STATION_DETAILS);
const SETTLEMENTS = 'settlements';

const STARTING_SYSTEM_DATA = {
	fleet: {
		command: [SHIP_DETAILS.command.maxHealth],
		scouts: [],
		colonizers: [],
		constructors: [],
		// battleships: [],
		miners: [],
		haulers: [],
	},
	stations: {
		settlements: [STATION_DETAILS.settlements.maxHealth],
		shipyards: [],
		collectors: [],
	},
	resources: 0,
	scienceLeft: 0,
	queue: [],
};

const BLANK_SYSTEM_DATA = {
	fleet: {},
	stations: {},
	resources: 0,
	scienceLeft: 0,
	queue: [
		// contains array like [what, key, index]
	]
};

const STARTING_EMPIRE_DATA = {
	location: '0,0,0',
	lastComputeDateTime: null,
	science: 0,
	transit: [
		// {
		// 	fleet: {},
		// 	from: null,
		// 	to: null,
		// 	progress: 100,
		// },
	],
	space: {
		fleet: {
			haulers: [],
		},
	},
	systems: {
		'0,0,0': STARTING_SYSTEM_DATA,
	},
};

const STARTING_COMPUTED = {
	transit: [
		{
			speed: 0,
		}
	],
	systems: {
		'0,0,0': {
			shipConstructionRate: 0,
			stationConstructionRate: 0,
			settlementRate: 0,
			resourceCollectionRate: 0,
			maxResources: 0,
			scienceRate: 0,
			queueMax: 0,
		},
	},
};

const PROPERTY_LABELS = {
	name: 'Name',
	maxHealth: 'Cost',
	shipConstructionRate: 'Ship Construction Rate',
	stationConstructionRate: 'Station Construction Rate',
	resourceCollectionRate: 'Resource Collection Rate',
	maxResources: 'Max Resources',
	maxCount: 'Max Count',
	queueMax: 'Max Queue Size',
};

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

class Empire {
	constructor(data = STARTING_EMPIRE_DATA) {
		this.data = clone(data);
		// Everything else is computed
		this.computed = clone(STARTING_COMPUTED);
		this.compute();
	}

	static THING_SHIP = THING_SHIP;
	static THING_STATION = THING_STATION;
	static SHIP_KEYS = SHIP_KEYS;
	static STATION_KEYS = STATION_KEYS;
	static PROPERTY_LABELS = PROPERTY_LABELS;

	// TODO: Why does this have to be cloned even through we have an object freeze on it?
	static getShipDetails(key) {
		return SHIP_DETAILS[key] ? clone(SHIP_DETAILS[key]) : null;
	}

	static getStationDetails(key) {
		return STATION_DETAILS[key] ? clone(STATION_DETAILS[key]) : null;
	}

	static getThingDetails(what, key) {
		const methodName = (what === THING_SHIP) ? 'getShipDetails' : 'getStationDetails';
		return Empire[methodName](key);
	}

	static getThingMaxHealth(what, key) {
		return Empire.getThingDetails(what, key).maxHealth || 0;
	}

	getCurrentCoordinates() {
		return this.data.location.split(',').map((str) => Number(str));
	}

	getCurrentSystemKey() {
		return this.data.location;
	}

	getCurrentSystem() {
		return this.data.systems[this.data.location] || {};
	}

	getCurrentFleet() {
		const sys = this.getCurrentSystem();
		return sys.fleet;
	}

	getCurrentStations() {
		const sys = this.getCurrentSystem();
		return sys.stations;
	}

	getSystemThings(systemKey, what) {
		const systemData = this.data.systems[systemKey];
		const things = systemData[THING_DATA_KEYS[what]];
		return things;
	}

	// Note: This will also create a blank array if there is none
	getSystemThingsArray(systemKey, what, key) {
		const systemData = this.data.systems[systemKey];
		const things = systemData[THING_DATA_KEYS[what]];
		if (!things[key]) things[key] = [];
		return things[key];
	}

	setSystemThingsArray(systemKey, what, key, arr = []) {
		const systemData = this.data.systems[systemKey];
		const things = systemData[THING_DATA_KEYS[what]];
		return things[key] = arr;
	}

	getConstructionIndex(systemKey, what, key) {
		const thingArr = this.getSystemThingsArray(systemKey, what, key);
		const maxHealth = Empire.getThingMaxHealth(what, key);
		const constructionIndex = thingArr.findIndex((thingValue) => thingValue < maxHealth);
		return constructionIndex;
	}

	getFirstConstructionIndex(systemKey, what) {
		const things = this.getSystemThings(systemKey, what);
		let constructionKey = null;
		let constructionIndex = -1;
		Object.keys(things).forEach((key) => {
			const i = this.getConstructionIndex(systemKey, what, key);
			if (i === -1) return;
			constructionKey = key;
			constructionIndex = i;
		});
		return { constructionKey, constructionIndex };
	}

	getSettledSystemsCount() {
		return Object.keys(this.data.systems).reduce((systemSum, systemKey) => {
			// const totalCompletedThings = STATION_KEYS.reduce((thingSum, key) => {
			// 	return thingSum + this.getCompletedThingCount(systemKey, THING_STATION, key);
			// }, 0);
			return systemSum + this.getCompletedThingCount(systemKey, THING_STATION, SETTLEMENTS);
		}, 0);
	}

	getExploredSystemsCount() {
		return Object.keys(this.data.systems).length;
	}

	isQueueFull(systemKey) {
		const system = this.getCurrentSystem();
		const systemComputed = this.computed.systems[systemKey];
		return (system.queue.length >= systemComputed.queueMax);
	}

	enqueueThing(what, key) {
		const systemKey = this.getCurrentSystemKey();
		const system = this.getCurrentSystem();
		if (!system.queue) system.queue = [];
		if (this.isQueueFull(systemKey)) return false;
		// We can actually queue it up
		const thingArr = this.getSystemThingsArray(systemKey, what, key);
		let i = 0;
		if (thingArr) {
			thingArr.push(0); // zero health/progress
			i = thingArr.length - 1; // Last index
		} else {
			this.setSystemThingsArray(systemKey, what, key, [0]);
		}
		system.queue.push([what, key, i]);
		return true;
	}
	enqueueShip(key) { return this.enqueueThing(THING_SHIP, key); }
	enqueueStation(key) { return this.enqueueThing(THING_STATION, key); }

	dequeueBuilt() {
		const systemKey = this.getCurrentSystemKey();
		const systemData = this.data.systems[systemKey];
		const { queue } = systemData;
		// Need to loop backwards because we might change indices of items after i
		for(let i = queue.length - 1; i >= 0; i -= 1) {
			const [what, key, index] = queue[i];
			const maxHealth = Empire.getThingMaxHealth(what, key);
			const thingsArr = this.getSystemThingsArray(systemKey, what, key);
			const health = thingsArr[index];
			if (health >= maxHealth) {
				queue.splice(i, 1);
			}
		}
	}

	removeThing(systemKey, what, key) {
		const thingsArr = this.getSystemThingsArray(systemKey, what, key);
		thingsArr.length = 0;
	}

	makeNewSystem(systemKey, galaxySystem) {
		this.data.systems[systemKey] = clone(BLANK_SYSTEM_DATA);
		const MAX_SYSTEM_SCIENCE = 1000;
		this.data.systems[systemKey].scienceLeft = Math.ceil(galaxySystem.dna[0] * MAX_SYSTEM_SCIENCE);
	}

	instaTravel(destination, travelers = [], galaxySystem) {
		console.log(destination, travelers);
		const systemKey = this.data.location;
		const { systems } = this.data;
		if (!systems[destination]) this.makeNewSystem(destination, galaxySystem);
		travelers.forEach((who) => {
			const [what, key] = who;
			const thingsArr = this.getSystemThingsArray(systemKey, what, key);
			const thingsArrCopy = clone(thingsArr);
			this.removeThing(systemKey, what, key);
			this.setSystemThingsArray(destination, what, key, thingsArrCopy);
		});
		// console.log(systems);
		this.data.location = destination;
	}

	getThingViewModel(systemKey, what, key) {
		// const systemData = this.data.systems[systemKey];
		const thingsArr = this.getSystemThingsArray(systemKey, what, key);
		const completedCount = this.getCompletedThingCount(systemKey, what, key);
		const totalCount = thingsArr ? thingsArr.length : 0;
		const constructionIndex = this.getConstructionIndex(systemKey, what, key);
		const maxHealth = Empire.getThingMaxHealth(what, key);
		const details = Empire.getThingDetails(what, key);
		const canBuild = !this.isQueueFull(systemKey);
		// health only for construction item -- might be undefined
		const health = thingsArr[constructionIndex] || 0;
		// console.log(key, thingsArr, health, maxHealth);
		let progressPercent = 0;
		if (constructionIndex > -1) {
			if (maxHealth) {
				progressPercent = (health / maxHealth) * 100;
			}
		}
		const vm = Object.assign(
			{
				completedCount,
				incompletedCount: totalCount - completedCount,
				totalCount, // desired amount
				progressPercent,
				health,
				maxHealth,
				cost: maxHealth,
				canBuild,
			},
			{ ...details }
		);
		// if (what === THING_STATION) console.log('station vm', vm);
		return vm;
	}

	getCurrentSystemViewModel() {
		const systemKey = this.data.location;
		const systemData = this.data.systems[systemKey];
		const systemComputed = this.computed.systems[systemKey];
		const systemVm = Object.assign({}, clone(systemData), clone(systemComputed));
		Object.keys(SHIP_DETAILS).forEach((key) => {
			systemVm.fleet[key] = this.getThingViewModel(systemKey, THING_SHIP, key);
		});
		Object.keys(STATION_DETAILS).forEach((key) => {
			systemVm.stations[key] = this.getThingViewModel(systemKey, THING_STATION, key);
		});
		return systemVm;
	}

	getCompletedThingCount(systemKey, what, key) {
		// const systemData = this.data.systems[systemKey];
		// const ships = systemData.fleet[key];
		const things = this.getSystemThings(systemKey, what);
		const thingsArr = things[key];
		if (!(thingsArr instanceof Array)) return 0;
		const maxHealth = Empire.getThingMaxHealth(what, key);
		const totalCount = thingsArr.reduce((count, shipValue) => {
			// console.log(shipValue, maxHealth);
			return count + ((shipValue >= maxHealth) ? 1 : 0);
		}, 0);
		return totalCount;
	}

	// getCompletedStationCount(systemKey, stationKey) {
	// 	const systemData = this.data.systems[systemKey];
	// 	const station = systemData.stations[stationKey];
	// 	if (!(station instanceof Array)) return 0;
	// 	const totalCount = station.reduce((count, stationValue) => {
	// 		const maxHealth = Empire.getThingMaxHealth(THING_STATION, stationKey);
	// 		// console.log(stationValue, maxHealth);
	// 		return count + (stationValue >= maxHealth) ? 1 : 0;
	// 	}, 0);
	// 	return totalCount;
	// }

	constructThing(systemKey, what, key, index, availableResources) {
		const things = this.getSystemThings(systemKey, what);
		const thingsArr = things[key];
		const maxHealth = Empire.getThingMaxHealth(what, key);
		// How much would we like to build? (all)
		const desiredAmount = maxHealth - thingsArr[index];
		// How much can we actually build given the available resources?
		const actualAmount = Math.min(desiredAmount, availableResources);
		// console.log('Construct thing', what, key, thingsArr, 'desired', desiredAmount, 'actual', actualAmount);
		thingsArr[index] += actualAmount; // Do the build
		if (thingsArr[index] >= maxHealth) {
			this.dequeueBuilt();
		}
		return actualAmount;
	}

	// constructFirstThing(systemKey, what, availableResources) {
	// 	const { constructionKey, constructionIndex } = this.getFirstConstructionIndex(systemKey, what);
	// 	if (!constructionKey || constructionIndex === -1) return 0;
	// 	// console.log('Construct first thing', what, constructionKey, constructionIndex);
	// 	const used = this.constructThing(systemKey, what, constructionKey, constructionIndex, availableResources);
	// 	return used;
	// }

	computeSystem(systemKey, seconds = 0) {
		const systemData = this.data.systems[systemKey];
		if (!this.computed.systems[systemKey]) this.computed.systems[systemKey] = {};
		const systemComputed = this.computed.systems[systemKey];
		systemComputed.resourceCollectionRate = 1;
		systemComputed.maxResources = 100;
		// What values will be calculate from ships and stations?
		const valueKeys = [
			'shipConstructionRate',
			'stationConstructionRate',
			'resourceCollectionRate',
			'maxResources',
			'scienceRate',
			'queueMax',
		];
		// Start at zero, and increase
		valueKeys.forEach((valueKey) => {
			systemComputed[valueKey] = 0;
		});
		[THING_SHIP, THING_STATION].forEach((what) => {
			const things = this.getSystemThings(systemKey, what);
			Object.keys(things).forEach((thingKey) => {
				const details = Empire.getThingDetails(what, thingKey);
				const n = this.getCompletedThingCount(systemKey, what, thingKey);
				if (n === 0) return;
				valueKeys.forEach((valueKey) => {
					if (!details[valueKey]) return;
					// console.log('\tAdding', (n * details[valueKey]), valueKey, 'from', thingKey, n)
					systemComputed[valueKey] += (n * details[valueKey]);
				});
			});
		});
		if (!seconds) return;
		// Handle time-based changes
		
		const resourcesIn = (systemComputed.resourceCollectionRate * seconds);
		let availableResources = systemData.resources + resourcesIn;
		/*
		// Build ship (OLD way)
		const availableForShip = Math.min(availableResources, (systemComputed.shipConstructionRate * seconds));
		const usedOnShip = this.constructFirstThing(systemKey, THING_SHIP, availableForShip);
		availableResources -= usedOnShip;
		// Build station (OLD way)
		const availableForStation = Math.min(availableResources, (systemComputed.stationConstructionRate * seconds));
		const usedOnStation = this.constructFirstThing(systemKey, THING_STATION, availableForStation);
		availableResources -= usedOnStation;
		*/
		
		// Build from Queue (NEW way)
		if (systemData.queue && systemData.queue.length > 0) {
			systemData.queue.forEach((queueItem) => {
				const [what, key, index] = queueItem;
				// How much is really available given the construction rate?
				const whatRate = THING_COMPUTED_RATE[what];
				const constructionRate = (systemComputed[whatRate] * seconds);
				// FIXME: Construction rate based on type of thing should be dimished if there
				// are multiple of them being produced.
				const availableForItem = Math.min(availableResources, constructionRate);
				const used = this.constructThing(systemKey, what, key, index, availableForItem);
				availableResources -= used;
			});
		}
		systemComputed.queueSize = systemData.queue.length;

		// Store leftover
		systemData.resources = Math.min(availableResources, systemComputed.maxResources);

		const actualScienceRate = Math.min(systemComputed.scienceRate, systemData.scienceLeft);
		systemData.scienceLeft -= actualScienceRate;
		this.data.science += actualScienceRate;
		// console.log(systemComputed.scienceRate, systemData.scienceLeft);
	}

	compute(seconds = 0) {
		this.data.lastComputeDateTime = new Date();
		Object.keys(this.data.systems).forEach((systemKey) => this.computeSystem(systemKey, seconds));
	}

	advance(seconds = 1) {
		this.compute(seconds);
	}
}

export default Empire;
