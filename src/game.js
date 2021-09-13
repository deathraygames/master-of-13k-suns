// import SvgRenderer from './SvgRenderer.js';
import Galaxy from './Galaxy.js';
import Empire from './Empire.js';
import { version } from '../package.json';

class Game {
	constructor() {
		this.version = version;
		this.seed = 13312;
		this.loopTickTime = 202; // ms
		this.zoom = 1;
		// this.renderer = new SvgRenderer();
		// this.renderer.init('#display');
		// const dims = this.renderer.getDimensions();
		// this.viewPortSize = [dims.width, dims.height];
		// Could need a big decimal for viewerPosition?
		// https://stackoverflow.com/a/66939244/1766230
		this.viewerPosition = { x: 0, y: 0 };
		this.galaxy = new Galaxy(1000);
		this.empire = new Empire();
		this.timerId = null;
		this.lastTime = 0;
		this.selected = {};
		this.showThingKey = null;
		console.log(this, this.galaxy.getSector(0, 0));
		window.document.addEventListener('DOMContentLoaded', () => this.setup());
	}

	getCurrentSystem() {
		const coords = this.empire.getCurrentCoordinates();
		const sector = this.galaxy.getSector(coords[0], coords[1]);
		return sector.systems[coords[2]];
	}

	loop() {
		const now = window.performance.now();
		const dt = now - this.lastTime;
		this.lastTime = now;
		// console.log(dt); // in milliseconds
		this.empire.advance(dt / 1000.);
		this.draw();
		this.timerId = window.setTimeout(() => this.loop(), this.loopTickTime);
	}

	start() {
		this.lastTime = window.performance.now();
		this.loop();
	}

	stop() {
		window.clearTimeout(this.timerId);
	}

	getLocalStorageKey() {
		return 'mo13ks_empireData';
	}

	save() {
		window.localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(this.empire.data));
		this.getElt('save-load-info').innerText = `Saved data from ${this.empire.data.lastComputeDateTime}`;
	}

	load() {
		try {
			const empireDataString = window.localStorage.getItem(this.getLocalStorageKey());
			const empireData = JSON.parse(empireDataString);
			this.empire = new Empire(empireData);
			this.getElt('save-load-info').innerText = `Loaded data from ${empireData.lastComputeDateTime}`;
			this.refresh();
		} catch (err) {
			window.alert(`Load failed\n${err}`);
			console.error(err);
		}
	}

	new() {
		window.location.reload();
	}

	getElt(id) {
		return window.document.getElementById(id);
	}

	setText(id, text) {
		this.getElt(id).innerText = text;
	}

	addClick(id, listener) {
		this.getElt(id).addEventListener('click', listener);
	}

	toggleSelection(what, key) {
		const selectedKey = `${what}_${key}`;
		this.selected[selectedKey] = !Boolean(this.selected[selectedKey]);
		this.draw();
	}

	clearSelected() {
		this.selected = {};
	}

	isSelected(what, key) {
		return this.selected[`${what}_${key}`];
	}

	getSelected() {
		return Object.keys(this.selected).map((selectedKey) => {
			if (!this.selected[selectedKey]) return null;
			const arr = selectedKey.split('_');
			return arr;
		});
	}

	getSelectedCount() {
		return Object.keys(this.selected).reduce((sum, selectedKey) => {
			return sum + (this.selected[selectedKey] ? 1 : 0);
		}, 0);
	}

	toggleListInfo(itemElt, key) {
		itemElt.classList.toggle('show-info');
		this.showThingKey = (this.showThingKey === key) ? null : key;
	}

	handleListClick(event, what, id) {
		const buildButton = event.target.closest('.build-button');
		const thing = event.target.closest('.thing');
		if (!thing) return;
		const { key } = thing.dataset;
		if (!key) {
			console.warn('No key', thing);
			return;
		}
		if (buildButton) {
			this.empire.enqueueThing(what, key);
			return;
		}
		if (event.target.className === 'travel-toggle') {
			this.toggleSelection(what, key);
			return;
		}
		this.toggleListInfo(thing, key);
		// console.log(event.target, thing, buildButton);
	}

	refresh() {
		this.clearSelected();
		this.drawSystem();
		this.draw();
	}

	travel(destination) {
		const coords = destination.split(',').map((n) => Number(n));
		const system = this.galaxy.getSystem(coords[0], coords[1], coords[2]);
		this.empire.instaTravel(destination, this.getSelected(), system);
		this.refresh();
	}

	handleSystemListClick(event) {
		const travelButton = event.target.closest('.travel-button');
		const systemElt = event.target.closest('.system');
		if (!systemElt) return;
		const { key } = systemElt.dataset;
		if (travelButton && key) {
			this.travel(key);
		}
	}

	setupEvents() {
		this.addClick('station-list', (event) => this.handleListClick(event, Empire.THING_STATION));
		this.addClick('fleet-list', (event) => this.handleListClick(event, Empire.THING_SHIP));
		this.addClick('system-list', (event) => this.handleSystemListClick(event));
		this.addClick('save-game', () => this.save());
		this.addClick('load-game', () => this.load());
		this.addClick('new-game', () => this.new());
		// window.addEventListener('wheel', (e) => e.deltaY);
	}

	setup() {
		this.setupEvents();
		this.empire.advance(1);
		this.getElt('seed').innerText = this.seed;
		this.getElt('version').innerText = this.version;
		this.refresh();
		this.start();
	}

	static formatNumber(n) {
		if (typeof n !== 'number') return n;
		const displayNumber = (n < 30) ? Math.floor(n * 10) / 10 : Math.floor(n);
		return displayNumber.toLocaleString();
	}

	drawStats(systemVm) {
		const keys = Object.keys(systemVm);
		keys.forEach((key) => {
			const elt = this.getElt(key);
			if (!elt) return;
			const n = systemVm[key];
			elt.innerText = Game.formatNumber(n);
		});
		this.setText('empire-science', Game.formatNumber(this.empire.data.science));
	}

	static getProgressBarHtml(percent, num, den) {
		return (
			`<div class="progress" style="width: ${percent}%">
				${Game.formatNumber(percent)}%
				(${Game.formatNumber(num)}/${Game.formatNumber(den)})
			</div>`
		);
	}

	getThingInfoHtml(what, key) {
		const details = Empire.getThingDetails(what, key);
		if (!details) return 'N/A';
		delete details.name;
		let html = '';
		for(let stat in details) {
			const label = Empire.PROPERTY_LABELS[stat] || stat;
			html += `<div>${label}: ${details[stat]}</div>`;
		}
		return html; // JSON.stringify(details);
	}


	getListItemsHtml(what, allKeys = [], things = [], options = {}) {
		let html = '';
		allKeys.forEach((key) => {
			const thing = things[key] || {};
			const n = thing.completedCount || 0;
			const total = thing.totalCount || n;
			const isShown = (key === this.showThingKey);
			const isSelected = this.isSelected(what, key);
			const isBuilding = (total > n);
			const outOf = (isBuilding) ? `/${total}` : '';
			const health = thing.health || 0;
			const maxHealth = thing.maxHealth || 0;
			const progressPercent = (things[key]) ? things[key].progressPercent : 0;
			const classes = ['thing'];
			if (n <= 0) classes.push('none');
			if (isBuilding) classes.push('building');
			if (isSelected) classes.push('selected');
			if (isShown) classes.push('show-info');
			html += (
				`<li class="${classes.join(' ')}" data-key="${key}">
					<span class="thing-name">${thing.name || key}</span>
					<span class="thing-count">${n}${outOf}</span>
					<span>
						<button type="button" class="build-button"
							${thing.canBuild ? '' : 'disabled="disabled"'}>+</button>
					</span>
					${options.showTravelToggle ? `<span>
						<input type="checkbox" class="travel-toggle"
							${isSelected ? 'checked="checked"' : ''}
							${n <= 0 ? 'disabled="disabled"' : ''} />
						</span>` : ''}
					${isBuilding ? `<div class="build-progress">${Game.getProgressBarHtml(progressPercent, health, maxHealth)}</div>` : ''}
					<div class="thing-info">
						${this.getThingInfoHtml(what, key)}
					</div>
				</li>`
			);
		});
		return html;
	}

	getSystemItemsHtml(galacticSystems, travelFleetCount) {
		// console.log(galacticSystems, systemVm);
		let html = '';
		galacticSystems.forEach((system) => {
			const key = [
				system.sector.galaxyPosition.x,
				system.sector.galaxyPosition.y,
				system.sectorSystemIndex,
			].join(',');
			html += (
				`<li class="system" data-key="${key}">
					<span>${system.name}
						<br>
						<span class="system-list-sector">Sector ${system.sector.name}</span>
					</span>
					<!-- <span>Distance: xxxx</span> -->
					<span>
						<button type="button"
							class="travel-button"
							${travelFleetCount <= 0 ? 'disabled="disabled"' : ''}
							>☄️</button>
					</span>
				</li>`
			);
		});
		return html;
	}

	drawStations(systemVm) {
		const { stations } = systemVm;
		this.getElt('station-list').innerHTML = this.getListItemsHtml(
			Empire.THING_STATION, Empire.STATION_KEYS, stations
		);
	}

	drawFleet(systemVm) {
		const { fleet } = systemVm;
		this.getElt('fleet-list').innerHTML = this.getListItemsHtml(
			Empire.THING_SHIP, Empire.SHIP_KEYS, fleet, { showTravelToggle: true }
		);
	}

	drawTravel(systemVm) {
		// TODO: If in transit show a different interface
		const travelFleetCount = this.getSelectedCount();
		this.getElt('travel').classList.toggle('ready', travelFleetCount > 0);
		this.setText('selected-count', travelFleetCount);
		const systems = this.getNearbySystems();
		this.getElt('system-list').innerHTML = this.getSystemItemsHtml(systems, travelFleetCount);
	}

	drawSystem() {
		const system = this.getCurrentSystem();
		const sc = system.spectralClassification;
		this.setText('system-name', system.name);
		console.log(sc);
		this.getElt('spectral').innerHTML = (
			`<span style="color: ${sc.drawColor}">
				${sc.tempClass}${sc.numeral}${sc.luminosityClass}
				${sc.luminosityName}
			</span>`
		);
		this.setText('planet-count', system.planetCount);
		this.setText('sector-coords', system.sectorCoordinates.join(', '));
		this.setText('sector-name', system.sector.name);
		this.setText('explored-count', this.empire.getExploredSystemsCount());
		this.setText('settled-count', this.empire.getSettledSystemsCount());
	}

	getSystemDrawingObjects(system) {
		return {
			type: 'rect',
			x: 0,
			y: 0,
			size: [10, 10],
			className: 'sector-grid',
		};
	}

	getSectorDrawingObjects(x, y) {
		const sector = this.galaxy.getSector(x, y);
		const objs = [
			{
				type: 'rect',
				x: x * 100,
				y: y * 100,
				size: [100, 100],
				className: 'sector-grid',
			},
			{
				type: 'text',
				x: x * 100,
				y: y * 100,
				text: `${x}, ${y}`,
				className: 'sector-coords',
			},
		];
		if (true) { // TODO: Show based on zoom
			sector.systems.forEach((system) => 
				objs.push(this.getSystemDrawingObjects(system))
			);
		}
		return objs;
	}

	getVisibleThings() {
		// TODO: Based on zoom and viewerposition and viewPortSize
		const min = { x: -10, y: -10 };
		const max = { x: 10, y: 10 };
		const things = [];
		for(let y = min.y; y <= max.y; y += 1) {
			for(let x = min.x; x <= max.x; x += 1) {
				things.push(this.getSectorDrawingObjects(x, y));
			}
		}
		// TODO: Based on zoom and viewerposition, get the relavant
		// sectors, systems, planets, etc.
		return things;
	}

	getNearbySectors() {
		const coords = this.empire.getCurrentCoordinates();
		const min = { x: -1, y: -1 };
		const max = { x: 1, y: 1 };
		const sectors = [];
		for(let y = min.y; y <= max.y; y += 1) {
			for(let x = min.x; x <= max.x; x += 1) {
				const sector = this.galaxy.getSector(coords[0] + x, coords[1] + y);
				sectors.push(sector);
			}
		}
		return sectors;
	}

	getNearbySystems() {
		const sectors = this.getNearbySectors();
		let systems = [];
		sectors.forEach((sector) => {
			systems = systems.concat(sector.systems);
		});
		return systems;
	}

	draw() {
		// this.renderer.draw(this.getVisibleThings(), this.viewerPosition, this.zoom);

		const systemVm = this.empire.getCurrentSystemViewModel();
		this.drawStats(systemVm);
		this.drawStations(systemVm);
		this.drawFleet(systemVm);
		this.drawTravel(systemVm);
	}
}

window.g = new Game();
window.g.Game = Game;
window.g.Empire = Empire;
