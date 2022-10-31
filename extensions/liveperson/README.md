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

This Flow Node checks the so-called "Shif Status".

<blockquote>
This API allows clients to check whether the requested skill, or all skills of the account, are currently in an active shift — based on the skill's configuration (whether defined on the account level via the account shift scheduler or overriden by the skill's configuration) (2022, https://developers.liveperson.com/shift-status-api-overview.html).
</blockquote>

In order to do so, the Skill that should be checked, must be selected from a dropdown list. If there is someone available, the following information will be stored to the Input or Context in JSON format:


```json
{
  "liveperson": {
    "liveAgentAvailability": {
      "skillId": "123123",
      "onShift": true,
      "nextOn": null,
      "nextOff": null
    }
  }
}
```

## Node: Handover To Agent

This Flow Node takes three paramers,
1. the message that should be sent to the user as soon as the handover is requested. For example, "I will now try to forward you to a human agent. One moment, please."
2. the name of the Skill that should be transfered to and
3. the message that should be sent if there was an error.

This Flow Node will request the handover in the LIVEPERSON Agent Desktop.