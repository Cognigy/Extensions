import { createNodeDescriptor } from "@cognigy/extension-tools";

/**
 * Child nodes attached to handoverToCXone and sendCxoneSignal, providing
 * dedicated success / failure branches. On failure, the parent node writes
 * the error details to context (see each parent's function) before routing
 * to the onError child, so downstream logic can branch on the error.
 */

export const onSuccessHandover = createNodeDescriptor({
    type: "onSuccessHandover",
    parentType: "handoverToCXone",
    defaultLabel: "On Success",
    appearance: {
        color: "#d4f4dd",
        textColor: "#000000",
        variant: "mini"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: { whitelist: [] }
        }
    }
});

export const onErrorHandover = createNodeDescriptor({
    type: "onErrorHandover",
    parentType: "handoverToCXone",
    defaultLabel: "On Failure",
    appearance: {
        color: "#fcd4d4",
        textColor: "#000000",
        variant: "mini"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: { whitelist: [] }
        }
    }
});

export const onSuccessSignal = createNodeDescriptor({
    type: "onSuccessSignal",
    parentType: "sendCxoneSignal",
    defaultLabel: "On Success",
    appearance: {
        color: "#d4f4dd",
        textColor: "#000000",
        variant: "mini"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: { whitelist: [] }
        }
    }
});

export const onErrorSignal = createNodeDescriptor({
    type: "onErrorSignal",
    parentType: "sendCxoneSignal",
    defaultLabel: "On Failure",
    appearance: {
        color: "#fcd4d4",
        textColor: "#000000",
        variant: "mini"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: { whitelist: [] }
        }
    }
});
