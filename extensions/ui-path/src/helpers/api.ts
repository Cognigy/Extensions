const request = require('request-promise-native');

export const getToken = ({
    clientId,
    userKey
}) => request.post('https://account.uipath.com/oauth/token', {
    body: {
        grant_type: "refresh_token",
        clientId,
        userKey
    },
    json: true
});

export const addQueueItemHelper = (queueItem, {
    account_logical_name,
    service_instance_logical_name,
    access_token
}) => request.post(`https: //platform.uipath.com/${account_logical_name}/${service_instance_logical_name}/odata/Queues/UiPathODataSvc.AddQueueItem`, {
    headers: {
        'Content-Type': 'application/json',
        'X-UIPATH-TenantName': service_instance_logical_name
    },
    auth: {
        'bearer': access_token
    },
    body: queueItem,
    json: true
});

export const getQueueItemHelper = ({
    filter
}, {
    account_logical_name,
    service_instance_logical_name,
    access_token
}) => request.get(`https: //platform.uipath.com/${account_logical_name}/${service_instance_logical_name}/odata/QueueItems`, {
    method: 'GET',
    url: 'https://platform.uipath.com/cognigy/MyService09xh117935/odata/QueueItems',
    headers: {
        'Content-Type': 'application/json',
        'X-UIPATH-TenantName': service_instance_logical_name
    },
    auth: {
        'bearer': access_token
    },
    qs: {
        // '$filter': `QueueDefinitionId eq ${queueDefinitionId} and SpecificContent/ResultId eq ${resultId}`,
        '$filter': filter,
        '$top': '1'
    },
    json: true
});