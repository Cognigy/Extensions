# Best Practices

In order to guarantee a uniform user experiences, we have set up a number of best practices

## 1. Advanced Simplicity

In order to display only the required fields in Cognigy.AI, we use the principle of advanced simplicity. All optional fields should be outsourced to "sections".

### 1.1 Storage Options

In most cases, an extension returns some kind of value -- e.g. an HTTP Request result. Now one needs to decide if the information should be stored in the context of the whole conversation or just in the input object of the next message. Therefore, please add the following code snippet to the fields in your extension's code:

**Fields:**

```js
{
	key: "storeLocation",
	type: "select",
	label: "Where to store the result",
	params: {
		options: [
			{
				label: "Input",
				value: "input"
			},
			{
				label: "Context",
				value: "context"
			}
		],
		required: true
	},
	defaultValue: "input"
},
{
	key: "inputKey",
	type: "cognigyText",
	label: "Input Key to store Result",
	defaultValue: "httprequest",
	condition: {
		key: "storeLocation",
		value: "input"
	}
},
{
	key: "contextKey",
	type: "cognigyText",
	label: "Context Key to store Result",
	defaultValue: "httprequest",
	condition: {
		key: "storeLocation",
		value: "context"
	}
}
```

**Section:**

```js
 {
	key: "storageOption",
	label: "Storage Option",
	defaultCollapsed: false,
	fields: [
		"storeLocation",
		"inputKey",
		"contextKey"
	]
}
```

**Form:**

``` js
 form: [
	{ type: "section", key: "storageOption" },
	],
```

With this choice, one can include the following code to handle the user's decision:

```js
if (storeLocation === "context") {
	api.addToContext(contextKey, resultObject, "simple");
} else {
	api.addToInput(inputKey, resultObject);
}
```

## 2. Outsource Helper Functions

If possible, the function of the extension should only focus on the use of the cognigy API for configuration. All other steps should be outsourced to auxiliary functions. Accordingly, you would create your own function for an HTTP request.

## 3. Connection

Whenever your extension requires an authentication

**Fields:**

```js
{
	key: "connection",
	label: "API Key",
	type: "connection",
	params: {
		connectionType: "api-key",
		required: true
	}
},
```

**Section:**

```js
{
	key: "connectionSection",
	label: "Connection",
	defaultCollapsed: false,
	fields: [
		"connection",
	]
}
```

**Form:**

- First position

```js
form: [
	{ type: "section", key: "connectionSection" },
]
```