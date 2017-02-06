"use babel";
/* globals atom */

import Atom, {
	CompositeDisposable,
	Disposable,
} from "atom";
import contextMenu from "./contextMenu";

function createDisposable(prop) {
	if (typeof atom.contextMenu[prop] === "undefined") {
		return new Disposable(_ => delete atom.contextMenu[prop]);
	}

	const oldProp = atom.contextMenu[prop];
	return new Disposable(_ => atom.contextMenu[prop] = oldProp);
}

export default {

	/**
	 * Activate package
	 * @return {void}
	 */
	activate() {
		this.disposables = new CompositeDisposable();
		for (let prop in contextMenu) {
			this.disposables.add(createDisposable(prop));
			atom.contextMenu[prop] = contextMenu[prop];
		}

		let configDisposable = null;

		this.disposables.add(atom.config.observe("context-menu-remove.remove", (value) => {
			if (configDisposable) {
				configDisposable.dispose();
			}
			configDisposable = atom.contextMenu.remove(value);
		}));

	},

	/**
	 * Deactivate package
	 * @return {void}
	 */
	deactivate() {
		this.disposables.dispose();
	},
};
