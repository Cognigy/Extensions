/**
 * Type definitions for CXone Extension
 */

import { INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * CXone connection configuration
 */
export interface CXoneConnection {
    environmentUrl: string;
    accessKeyId: string;
    accessKeySecret: string;
    clientId: string;
    clientSecret: string;
}

/**
 * Cognigy API interface
 * Note: INodeExecutionAPI is not exported from @cognigy/extension-tools,
 * so we define a compatible interface based on what we actually use
 */
export interface CognigyApi {
    log?: (level: string, text: string) => void;
    addToContext?: (key: string, value: any, mode: string) => void;
    output?: (text: string | null, data?: any) => void;
    [key: string]: any; // Allow other properties from INodeExecutionAPI
}

/**
 * Cognigy context structure
 */
export interface CognigyContext {
    cxoneEncryptedToken?: string;
    cxoneTokenTimestamp?: number;
    cxoneTokenUrl?: string;
    cxoneApiUrl?: string;
    transcript?: ConversationItem[];
    [key: string]: any;
}

/**
 * Cognigy input structure
 */
export interface CognigyInput {
    channel?: string;
    transcript?: ConversationItem[];
    data?: any;
    [key: string]: any;
}

/**
 * Handover action type
 */
export type HandoverAction = "End" | "Escalate";

/**
 * Channel type detection
 */
export type ChannelType = "voice" | "chat" | "webchat" | "testchat";

/**
 * CXone token response from OAuth endpoint
 */
export interface CXoneTokenResponse {
    access_token: string;
    id_token: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    [key: string]: any;
}

/**
 * Decoded JWT token structure
 */
export interface DecodedJWTToken {
    iss: string;
    tenantId: string;
    [key: string]: any;
}

/**
 * OpenID configuration response
 */
export interface CXoneOpenIdConfigResponse {
    token_endpoint: string;
    [key: string]: any;
}

/**
 * CXone configuration response
 */
export interface CXoneConfigResponse {
    api_endpoint: string;
    [key: string]: any;
}

/**
 * Conversation item for transcript transformation
 */
export interface ConversationItem {
    role: "user" | "assistant";
    type: "input" | "output";
    payload: {
        text?: string | null;
        data?: any;
    };
    timestamp: number;
}

/**
 * Handover node configuration
 */
export interface HandoverNodeConfig {
    action: HandoverAction;
    contactId: string;
    spawnedContactId: string;
    businessNumber: string;
    optionalParamsObject?: any[];
    connection: CXoneConnection;
}

/**
 * Handover node parameters
 */
export interface HandoverNodeParams extends INodeFunctionBaseParams {
    config: HandoverNodeConfig;
}

/**
 * Send signal node configuration
 */
export interface SendSignalNodeConfig {
    contactId: string;
    signalParams: string[];
    connection: CXoneConnection;
}

/**
 * Send signal node parameters
 */
export interface SendSignalNodeParams extends INodeFunctionBaseParams {
    config: SendSignalNodeConfig;
}

