import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IABNode extends INodeFunctionBaseParams {
	config: {
		contextGroupKey: string;
        enableContextKey: boolean;
		groupPercentage: number;
    };
}

export const ABConfiguration = createNodeDescriptor({
	type: "AB Configuration",
	defaultLabel: "AB Configuration",
	preview: {
		key: "contextGroupKey",
		type: "text"
	},
    fields: [
        {
            key: "groupPercentage",
            label: "Set an aproximate percentage of traffic you would like sent to flow B.  As an example, setting the slider to 80 will send aproximately 80% of traffic to the B group.",
            type: "slider",
            params: {
                min: 0,
                max: 100,
                step: 5,
                default: 50
            }
        }
    ],
    appearance: {
        color: "#659fc4",
        textColor: "#333"
    },
	function: async ({ cognigy, config, childConfigs }: IABNode) => {
		const { api } = cognigy;

        let existingGroup = api.getContext('ABGroup'),
			currentGroup = '';
        const userSplit = config.groupPercentage;

        if (existingGroup) {
            // Has the user already been assigned to a group?
            currentGroup = existingGroup;
        } else {
            // Create a random nubmer between 0 (floor) and 100
            let randomNumber = Math.floor(Math.random() * 100);

            // Compares the number the user was assigned to the split that was set.  If the number is greater then the usersplit number they go to Group A, otherwise they go to Group B
            if (randomNumber > userSplit) {
                currentGroup = "A";
            } else {
                currentGroup = "B";
            }

			// Store the users group so we can refer to it later.
			api.addToContext('ABGroup', currentGroup, 'simple');
        }
	}
});

export const FlowSeperator = createNodeDescriptor({
	type: "Flow Seperator",
	defaultLabel: "AB Group Seperator",
	preview: {
		key: "contextGroupKey",
		type: "text"
	},
    appearance: {
        color: "#659fc4",
        textColor: "#333"
    },
    dependencies: {
        children: ["GroupA", "GroupB"]
    },
	function: async ({ cognigy, config, childConfigs }: IABNode) => {
		const { api } = cognigy;

        let userGroup = api.getContext('ABGroup');

        if (userGroup) {
			// Set the next node based on the users group.  I'm doing a switch because I'm thinking about adding more groups.
			switch (userGroup) {
				case "A":
					const GroupAChild = childConfigs.find(child => child.type === "GroupA");

					if (!GroupAChild) {
						throw new Error("Group A node is missing.");
					}

					api.setNextNode(GroupAChild.id);
					break;

				default:
					const GroupBChild = childConfigs.find(child => child.type === "GroupB");

					if (!GroupBChild) {
						throw new Error("Group B node is missing.");
					}

					api.setNextNode(GroupBChild.id);
					break;
			}
        } else {
			// Log that now configuration was set when this was run
            api.log('debug', 'AB Flow Seperator run without configuration');
        }
	}
});

export const GroupA = createNodeDescriptor({
	type: "GroupA",
	parentType: "FlowSeperator",
	defaultLabel: "Group A",
	appearance: {
		color: '#659fc4',
		textColor: '#ffffff',
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

export const GroupB = createNodeDescriptor({
	type: "GroupB",
	parentType: "FlowSeperator",
	defaultLabel: "Group B",
	appearance: {
		color: '#de5539',
		textColor: '#ffffff',
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