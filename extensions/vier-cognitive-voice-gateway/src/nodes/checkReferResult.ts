import { INodeFunctionBaseParams, createNodeDescriptor } from "@cognigy/extension-tools"
import t from "../translations"
import { commonChildNodeFields } from "../common/shared"

export const checkReferResultNode = createNodeDescriptor({
    type: "referService",
    defaultLabel: t.referService.nodeLabel,
    summary: t.referService.nodeSummary,
    appearance: {
        color: "blue",
    },
    behavior: {
        entrypoint: true,
    },
    tags: ["logic"],
    dependencies: {
        children: ["onReferSuccess", "onReferFailure", "onReferDefault"],
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

        const onSuccessChild = childByType("onReferSuccess")
        const onFailureChild = childByType("onReferFailure")
        const onDefaultChild = childByType("onReferDefault")

        switch (cognigy.input.data.status) {
            case "termination":
                api.setNextNode(onSuccessChild.id)
                break
            case "refer-failure":
                api.setNextNode(onFailureChild.id)
                break
            default:
                api.setNextNode(onDefaultChild.id)
                break
        }
    },
})

export const onReferSuccess = createNodeDescriptor({
    type: "onReferSuccess",
    parentType: "refer",
    defaultLabel: t.shared.childSuccessLabel,
    ...commonChildNodeFields,
})

export const onReferFailure = createNodeDescriptor({
    type: "onReferFailure",
    parentType: "refer",
    defaultLabel: t.shared.childFailureLabel,
    ...commonChildNodeFields,
})

export const onReferDefault = createNodeDescriptor({
    type: "onReferDefault",
    parentType: "refer",
    defaultLabel: t.shared.childDefaultLabel,
    ...commonChildNodeFields,
})
