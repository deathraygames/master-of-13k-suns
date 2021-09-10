const THING_SHIP = 'ship';
const THING_STATION = 'station';
const THING_DATA_KEYS = {
	ship: 'fleet',
	station: 'stations',
};
const SHIP_DETAILS = {
	command: {
		name: 'Command Ship',
		maxHealth: 100,
		shipConstructionRate: 10,
		stationConstructionRate: 10,
		resourceCollectionRate: 10,
		maxResources: 10,
		maxCount: 1,
	},
	scouts: { name: 'Scouts', maxHealth: 100 },
	colonizers: { name: 'Colonizers', maxHealth: 500, maxResources: 8, stationConstructionRate: 10 },
	constructors: { name: 'Constructors', maxHealth: 100, shipConstructionRate: 1, stationConstructionRate: 10 },
	// battleships: { name: 'Battleships', maxHealth: 800 },
	miners: { name: 'Mining Ships', maxHealth: 200, resourceCollectionRate: 2 },
	haulers: { name: 'Haulers', maxHealth: 400, maxResources: 8 },
};

const STATION_DETAILS = {
	settlements: { name: 'Settlements', maxHealth: 500, maxResources: 100 },
	shipyards: { name: 'Shipyards', maxHealth: 900, shipConstructionRate: 10, maxResources: 5, },
	collectors: { name: 'Collectors', maxHealth: 350, resourceCollectionRate: 9, maxResources: 5, },
};

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
};

const BLANK_SYSTEM_DATA = {
	fleet: {},
	stations: {},
	resources: 0,
};

const STARTING_EMPIRE_DATA = {
	location: '0,0,0',
	lastComputeDateTime: null,
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
		},
	},
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
	static ALL_SHIP_KEYS = Object.keys(SHIP_DETAILS);
	static ALL_STATION_KEYS = Object.keys(STATION_DETAILS);

	static getShipDetails(key) {
		return SHIP_DETAILS[key];
	}

	static getStationDetails(key) {
		return STATION_DETAILS[key];
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

	getSystemThingsArray(systemKey, what, key) {
		const systemData = this.data.systems[systemKey];
		const things = systemData[THING_DATA_KEYS[what]];
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

	getExploredSystemsCount() {
		// return Object.keys(this.data.systems).reduce((sum, systemKey) => {
		// 	this.getCompletedThingCount(systemKey, THING_STATION, )
		// 	return sum + ()
		// }, 0);
	}

	enqueueThing(what, key) {
		const systemKey = this.getCurrentSystemKey();
		const thingArr = this.getSystemThingsArray(systemKey, what, key);
		if (!thingArr) {
			this.setSystemThingsArray(systemKey, what, key, [0]);
			return;
		}
		thingArr.push(0);
	}
	enqueueShip(key) { return this.enqueueThing(THING_SHIP, key); }
	enqueueStation(key) { return this.enqueueThing(THING_STATION, key); }

	removeThing(systemKey, what, key) {
		const thingsArr = this.getSystemThingsArray(systemKey, what, key);
		thingsArr.length = 0;
	}

	instaTravel(destination, travelers = []) {
		console.log(destination, travelers);
		const systemKey = this.data.location;
		const { systems } = this.data;
		if (!systems[destination]) systems[destination] = clone(BLANK_SYSTEM_DATA);
		travelers.forEach((who) => {
			const [what, key] = who;
			const thingsArr = this.getSystemThingsArray(systemKey, what, key);
			const thingsArrCopy = clone(thingsArr);
			this.removeThing(systemKey, what, key);
			this.setSystemThingsArray(destination, what, key, thingsArrCopy);
		});
		console.log(systems);
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
			},
			{ ...details }
		);
		return vm;
	}

	getCurrentSystemViewModel() {
		const systemKey = this.data.location;
		const systemData = this.data.systems[systemKey];
		const systemComputed = this.computed.systems[systemKey];
		const systemVm = Object.assign({}, clone(systemData), systemComputed);
		Object.keys(systemVm.fleet).forEach((key) => {
			systemVm.fleet[key] = this.getThingViewModel(systemKey, THING_SHIP, key);
		});
		Object.keys(systemVm.stations).forEach((key) => {
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
		return actualAmount;
	}

	constructFirstThing(systemKey, what, availableResources) {
		const { constructionKey, constructionIndex } = this.getFirstConstructionIndex(systemKey, what);
		if (!constructionKey || constructionIndex === -1) return 0;
		// console.log('Construct first thing', what, constructionKey, constructionIndex);
		const used = this.constructThing(systemKey, what, constructionKey, constructionIndex, availableResources);
		return used;
	}

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
		// Object.keys(systemData.fleet).forEach((shipKey) => {
		// 	const details = Empire.getShipDetails(shipKey);
		// 	valueKeys.forEach((valueKey) => {
		// 		if (!details[valueKey]) return;
		// 		const n = this.getCompletedShipCount(systemKey, shipKey);
		// 		// console.log(shipKey, n, details[valueKey]);
		// 		systemComputed[valueKey] += (n * details[valueKey]);
		// 	});
		// });
		// Object.keys(systemData.stations).forEach((stationKey) => {
		// 	const details = Empire.getStationDetails(stationKey);
		// 	valueKeys.forEach((valueKey) => {
		// 		if (!details[valueKey]) return;
		// 		const n = this.getCompletedStationCount(systemKey, stationKey);
		// 		// console.log(stationKey, n, details[valueKey]);
		// 		systemComputed[valueKey] += (n * details[valueKey]);
		// 	});
		// });
		if (!seconds) return;
		// Handle time-based changes
		
		const resourcesIn = (systemComputed.resourceCollectionRate * seconds);
		let availableResources = systemData.resources + resourcesIn;
		// Build ship
		const availableForShip = Math.min(availableResources, (systemComputed.shipConstructionRate * seconds));
		const usedOnShip = this.constructFirstThing(systemKey, THING_SHIP, availableForShip);
		availableResources -= usedOnShip;
		// Build station
		const availableForStation = Math.min(availableResources, (systemComputed.stationConstructionRate * seconds));
		// console.log(availableResources, systemComputed.stationConstructionRate, seconds);
		const usedOnStation = this.constructFirstThing(systemKey, THING_STATION, availableForStation);
		availableResources -= usedOnStation;
		// Store leftover
		systemData.resources = Math.min(availableResources, systemComputed.maxResources);
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
