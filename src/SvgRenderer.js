// Modeled somewhat after star hopper opus's WebglpRenderer

const HTML_METHODS = {
	g: 'getGroupHtml',
	rect: 'getRectangleHtml',
	text: 'getTextHtml',
};

class SvgRenderer {
	constructor() {
		this.svg = null;
		this.size = {
			x: 1000, y: 1000,
		};
	}

	static HTML_METHODS = HTML_METHODS;

	setViewBox() {
		const dims = this.getDimensions();
		this.svg.setAttribute('viewBox', `0 0 ${dims.width} ${dims.height}`);
	}

	getDimensions() {
		return this.svg.getBoundingClientRect();
	}

	static getGroupHtml(objects = []) {
		return (
			`<g>
			${objects.reduce((html, actualOject) => html += SvgRenderer.getObjectShapeHtml(actualOject), '')}
			</g>`
		);
	}

	static getRectangleHtml(obj) {
		return `<rect class="${obj.className || ''}"
			x="${obj.x}" y="${obj.y}"
			width="${obj.size[0]}" height="${obj.size[1]}" />`;
	}

	static getTextHtml(obj) {
		return `<text class="${obj.className || ''}"
			x="${obj.x}" y="${obj.y}">
			${obj.text || ''}</text>`;
	}

	static getObjectShapeHtml(obj) {
		if (obj instanceof Array) {
			return SvgRenderer.getGroupHtml(obj);
		}
		console.log('getObjectShapeHtml', obj);
		return SvgRenderer[HTML_METHODS[obj.type]](obj);
	} 

	draw(objects = [], viewerPosition, zoom) {
		let html = '';
		objects.forEach((obj) => {
			html += SvgRenderer.getObjectShapeHtml(obj);
		});
		console.log('draw', objects);
		this.svg.innerHTML = html;
		// (
		// 	`<polygon points="0 600, 0 450,
		// 	100 400, 0 0, 20 0, 120 400,
		// 	680 400, 780 0, 800 0, 700 400,
		// 	800 450, 800 600" stroke="rgba(255,255,255,0.5)" stroke-width="5" />`
		// );
		this.setViewBox();
	}

	async init(selector = '#svg-display') {
		this.svg = window.document.querySelector(selector);
		return this;
	}
}

export default SvgRenderer;
