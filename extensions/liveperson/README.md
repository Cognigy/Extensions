# LIVEPERSON

With this Extension, one can transfer a chat conversation to a LIVEPERSON human agent.

## Connections

While the "Handover To Agent" Flow Node does not require any credentials, the "Check Live Agent Availability" Node must be authorized to retrieve this information from the system:

- accessToken
- accessTokenSecret
- accountId
- appKey
- secret
- username

Please find more information here: https://developers.liveperson.com/login-service-api-methods-user-login.html

## Node: Check Agent Availability

This Flow Node checks the so-called "Shift Status" API,

<blockquote>
This API allows clients to check whether the requested skill, or all skills of the account, are currently in an active shift — based on the skill's configuration (whether defined on the account level via the account shift scheduler or overriden by the skill's configuration) (2022, https://developers.liveperson.com/shift-status-api-overview.html).
</blockquote>

as well as whether there is an Agent online and available for that specific skill using the "Agent Status" API.

<blockquote>
Returns the current state of logged in agents that are handling messaging conversations with all its related data, including status, number of open conversations, load, skills etc. (2022, https://developers.liveperson.com/agent-metrics-api-methods-agent-status.html).
</blockquote>

In order to do so, the Skill that should be checked, must be selected from a dropdown list. If there is someone available, the "On Online" path will be used, otherwise the "On Offline". In case of an error, the error is saved in the specified storage location.

## Node: Handover To Agent

This Flow Node takes one parameter:
- The name of the Skill that should be transfered to

This Flow Node will request the handover in the LIVEPERSON Agent Desktop.