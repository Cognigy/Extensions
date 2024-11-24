import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import t from "../translations"
import { commonChildNodeFields } from "../common/shared"

export const checkOutboundResultNode = createNodeDescriptor({
    type: "outboundService",
    defaultLabel: t.outboundService.nodeLabel,
    summary: t.outboundService.nodeSummary,
    appearance: {
        color: "blue",
    },
    behavior: {
        entrypoint: true,
    },
    tags: ["logic"],
    dependencies: {
        children: [
            "onOutboundSuccess",
            "onOutboundFailure",
            "onOutboundTermination",
            "onOutboundDefault",
        ],
    },

    function: async ({ cognigy, childConfigs }: INodeFunctionBaseParams) => {
        const { api } = cognigy

        function childByType(type: string) {
            const child = childConfigs.find(child => child.type === type)
            if (!child) {
                throw new Error(`Unable to find '${child}'. Seems its not attached.`)
            }
            return child
        }

        const onSuccessChild = childByType("onOutboundSuccess")
        const onFailureChild = childByType("onOutboundFailure")
        const onTerminateChild = childByType("onOutboundTermination")
        const onDefaultChild = childByType("onOutboundDefault")

        switch (cognigy.input.data.status) {
            case "outbound-success":
                api.setNextNode(onSuccessChild.id)
                break
            case "outbound-failure":
                api.setNextNode(onFailureChild.id)
                break
            case "termination":
                api.setNextNode(onTerminateChild.id)
                break
            default:
                api.setNextNode(onDefaultChild.id)
                break
        }
    },
})

export const onOutboundSuccess = createNodeDescriptor({
    type: "onOutboundSuccess",
    parentType: "outbound",
    defaultLabel: t.shared.childSuccessLabel,
    ...commonChildNodeFields,
})

export const onOutboundFailure = createNodeDescriptor({
    type: "onOutboundFailure",
    parentType: "outbound",
    defaultLabel: t.shared.childFailureLabel,
    ...commonChildNodeFields,
})

export const onOutboundTermination = createNodeDescriptor({
    type: "onOutboundTermination",
    parentType: "outbound",
    defaultLabel: t.shared.childTerminationLabel,
    ...commonChildNodeFields,
})

export const onOutboundDefault = createNodeDescriptor({
    type: "onOutboundDefault",
    parentType: "outbound",
    defaultLabel: t.shared.childDefaultLabel,
    ...commonChildNodeFields,
})
