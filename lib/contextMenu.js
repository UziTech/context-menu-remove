"use babel";

import { Disposable } from "atom";
import MenuHelpers from "./MenuHelpers";
import ContextMenuRemoveItemSet from "./ContextMenuRemoveItemSet";
import { validateSelector } from "clear-cut";

function itemsContainLabel(label, items) {
	return items.some(item => {
		if (item.type === "separator") {
			return false;
		}
		if (item.label === label) {
			return true;
		}
		if (item.submenu) {
			return itemsContainLabel(label, item.submenu);
		}
		return false;
	});
}

export default {
	removeItemSets: [],
	SelectorsForLabel: function (label) {
		const itemSets = this.itemSets.filter(itemSet => {
			return itemsContainLabel(label, itemSet.items);
		});
		const selectors = itemSets.map(itemSet => itemSet.selector);
		return [...new Set(selectors)];
	},
	labelsFromSelector: function (selector) {
		return this.labelsFromTemplate(this.templateForSelector(selector));
	},
	labelsFromElement: function (element) {
		return this.labelsFromTemplate(this.templateForElement(element));
	},
	labelsFromTemplate: function (template) {
		return template.map(item => {
			if (item.type === "separator") {
				return "----------";
			}
			if (item.submenu) {
				return {
					label: item.label,
					submenu: this.labelsFromTemplate(item.submenu)
				};
			}
			return item.label;
		});
	},
	templateForSelector: function (selector) {
		return this.templateForElement(document.querySelector(selector));
	},
	templateForEvent: function (event) {
		let template = [];
		let removeItems = [];
		let currentTarget = event.target;

		while (currentTarget !== null) {
			let currentTargetItems = [];
			const matchingItemSets =
				this.itemSets.filter(itemSet => currentTarget.webkitMatchesSelector(itemSet.selector));

			for (let itemSet of matchingItemSets) {
				for (let item of itemSet.items) {
					const itemForEvent = this.cloneItemForEvent(item, event);
					if (itemForEvent) {
						MenuHelpers.merge(currentTargetItems, itemForEvent, itemSet.specificity);
					}
				}
			}

			for (let item of currentTargetItems) {
				MenuHelpers.merge(template, item, false);
			}

			const matchingRemoveItemSets =
				this.removeItemSets.filter(itemSet => currentTarget.webkitMatchesSelector(itemSet.selector));

			for (let itemSet of matchingRemoveItemSets) {
				for (let item of itemSet.items) {
					const itemForEvent = this.cloneItemForEvent(item, event);
					if (itemForEvent) {
						MenuHelpers.merge(removeItems, itemForEvent, false);
					}
				}
			}

			currentTarget = currentTarget.parentElement;
		}

		for (let item of removeItems) {
			MenuHelpers.unmerge(template, item);
		}

		this.pruneRedundantSeparators(template);

		return template;
	},

	pruneRedundantSeparators: function (menu) {
		let keepNextItemIfSeparator = false;
		let index = 0;
		while (index < menu.length) {
			if (menu[index].type === "separator") {
				if (!keepNextItemIfSeparator || (index === (menu.length - 1))) {
					menu.splice(index, 1);
				} else {
					keepNextItemIfSeparator = false;
					index++;
				}
			} else {
				keepNextItemIfSeparator = true;
				index++;
			}
		}
	},

	clear: function () {
		this.activeElement = null;
		this.itemSets = [];
		this.removeItemSets = [];
		return this.add({
			"atom-workspace": [
				{
					label: "Inspect Element",
					command: "application:inspect",
					devMode: true,
					created(event) {
						const { pageX, pageY } = event;
						return this.commandDetail = { x: pageX, y: pageY };
					}
				}
			]
		});
	},

	remove: function (itemsBySelector) {
		let removedItemSets = [];

		for (let selector in itemsBySelector) {
			const items = itemsBySelector[selector];
			validateSelector(selector);
			const itemSet = new ContextMenuRemoveItemSet(selector, items);
			removedItemSets.push(itemSet);
			this.removeItemSets.push(itemSet);
		}

		return new Disposable(_ => {
			for (let itemSet of removedItemSets) {
				this.removeItemSets.splice(this.removeItemSets.indexOf(itemSet), 1);
			}
		});
	}
};
