import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import {
    convertDurationFromSecondsToMillis,
    convertWhisperText,
    delay,
    normalizeData,
    normalizeSipHeaders,
    normalizeText,
    normalizeUserToUserInformation,
} from "../helpers/util"
import t from "../translations"
import {
    transferCallFields,
    transferCallForm,
    TransferCallInputs,
    transferCallSections,
} from "../common/transferCall"
import { generalSection, generalSectionFormElement } from "../common/shared"

interface IBridgeCallInputs extends TransferCallInputs {
    headNumber: string
    extensionLength: number
}

export interface IBridgeCallParams extends INodeFunctionBaseParams {
    config: IBridgeCallInputs
}

const headNumberFieldKey: keyof IBridgeCallInputs = "headNumber"

export const bridgeCallNode = createNodeDescriptor({
    type: "bridge",
    defaultLabel: t.bridge.nodeLabel,
    summary: t.bridge.nodeSummary,
    appearance: {
        color: "green",
    },
    tags: ["service"],
    behavior: {
        entrypoint: true,
    },
    fields: [
        {
            type: "cognigyText",
            key: headNumberFieldKey,
            label: t.bridge.inputHeadNumberLabel,
            description: t.bridge.inputHeadNumberDescription,
            params: {
                required: true,
                placeholder: '+E.164 format, e.g. "+49721480848680"',
            },
        },
        {
            type: "number",
            key: "extensionLength",
            label: t.bridge.inputExtensionLengthLabel,
            description: t.bridge.inputExtensionLengthDescription,
            defaultValue: 1,
            params: {
                required: true,
                min: 0,
                max: 5,
            },
        },
        ...transferCallFields,
    ],
    preview: {
        key: headNumberFieldKey,
        type: "text",
    },
    sections: [generalSection([headNumberFieldKey, "extensionLength"]), ...transferCallSections],
    form: [generalSectionFormElement, ...transferCallForm],
    function: async ({ cognigy, config }: IBridgeCallParams) => {
        const { api } = cognigy

        const payload = {
            status: "bridge",
            headNumber: normalizeText(config.headNumber),
            extensionLength: config.extensionLength,
            callerId: normalizeText(config.callerId),
            customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
            userToUserInformation: normalizeUserToUserInformation(config.userToUserInformation),
            ringTimeout: convertDurationFromSecondsToMillis(config.ringTimeout),
            acceptAnsweringMachines: config.acceptAnsweringMachines,
            data: normalizeData(api, config.data),
            whispering: convertWhisperText(config.whisperingText),
            experimentalEnableRingingTone: config.experimentalEnableRingingTone,
        }

        return delay(100, () => {
            api.say("", payload)
            if (config.endFlow) {
                api.stopExecution()
            }
        })
    },
})
