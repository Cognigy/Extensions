import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * This file contains an example of how you can build nodes whith can
 * have 'child nodes'.
 *
 * The 'randomPath' node essentially rolls the dice and decides randomly
 * which child it wants to execute.
 */

export interface IRandomPathParams extends INodeFunctionBaseParams {
	config: {};
}

export const randomPath = createNodeDescriptor({
	type: "randomPath",
	defaultLabel: "Pick Random Path",

	dependencies: {
		children: ["randomPathLeft", "randomPathRight"]
	},

	function: async ({ cognigy, config, childConfigs }: INodeFunctionBaseParams) => {
		const { api } = cognigy;

		/* roll the dice */
		const random = Math.round(Math.random()); // generate number between 0 and 1

		/* execute left path */
		if (random) {
			const leftPathChild = childConfigs.find(child => child.type === "randomPathLeft");
			if (!leftPathChild) {
				throw new Error("Unable to find 'leftPathChild'. Seems its not attached.");
			}

			api.setNextNode(leftPathChild.id);
			return;
		} else {
			const rightPathChild = childConfigs.find(child => child.type === "randomPathRight");
			if (!rightPathChild) {
				throw new Error("Unable to find 'rightPathChild'. Seems its not attached.");
			}

			api.setNextNode(rightPathChild.id);
			return;
		}
	}
});

/* node definition for 'randomPathLeft' + 'randomPathRight' */

export const randomPathLeft = createNodeDescriptor({
	type: "randomPathLeft",

	parentType: "randomPath",
	defaultLabel: "Left",
	appearance: {
		color: '#2ecc71',
		textColor: 'black',
		variant: 'mini'
	},

	constraints: {
		editable: false,
		deletable: true,
		collapsable: true,
		creatable: true,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	}
});

export const randomPathRight = createNodeDescriptor({
	type: "randomPathRight",

	parentType: "randomPath",

	defaultLabel: "Right",

	appearance: {
		color: '#9b59b6',
		textColor: 'black',
		variant: 'mini'
	},

	constraints: {
		editable: false,
		deletable: true,
		collapsable: true,
		creatable: true,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	}
});