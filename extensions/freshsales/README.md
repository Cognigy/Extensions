# Freshsales

This Extension can be used for managing tickets in [Freshsales](https://www.freshworks.com/de/crm/sales/). As source of the exposed Flow Nodes, the [Freshsales API](https://developers.freshworks.com/crm/api/#introduction) is used.

## Connection

In order to authenticate the virtual agent to establish a connection with Freshdesk, the **subdomain** and **API KEY** must be provided:

- API Key
  - [How to find your API Key](https://developers.freshworks.com/crm/api/#authentication)
- Subdomain
  - The value can be found in the URL of the Freshdesk instance, e.g. https:// `company` .freshdesk.com

## Node: Search

This Flow Node searches for Contacts, Accounts, Deals or Users in Freshsales.

Result:

```json
[{
	"id": "1",
	"type": "contact",
	"name": "James Sampleton (sample)",
	"email": "jamessampleton@gmail.com",
	"avatar": "https://lh3.googleusercontent.com/-DbQggdfJ2_w/Vi4cRujEXKI/AAAAAAAAABs/-Byl2CFY3lI/w140-h140-p/Image3.png"
}]
```

## Node: Get Info

Based on the search result, more detailed information can be retrieved by using the `id` as parameter. Therefore, the result of this Flow Node could be the detailed Contact, Account or Deal.