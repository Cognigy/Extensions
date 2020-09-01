# Get Started

In this tutorial we want to show you how to develop your first Extension, which you can upload and install in your existing Cognigy.AI agent. 

## Requirements 

However, in order to start this tutorial, you need the following requirements:

- Basic TypeScript / JavaScript knowledge
- A code editor
    - We recommend using [Visual Studio Code](https://code.visualstudio.com/?wt.mc_id=DX_841432)
- An existing Cogngiy.AI [agent](https://docs.cognigy.com/v4.0/docs/projects)
    - If you don't have an agent yet, but want to get familiar with Cognigy, we provide registering in our [Free Trial Cloud](https://signup.cognigy.ai). It is totally free and the best way to get in touch with our product.

## Create the module structure

Every Extension has the same folder and file structure:

``` bash
module-name/
    README.md
    src/
        nodes/
            reverseSay.ts
        module.ts
    package.json
    package-lock.json
    tslint.json
    tsconfig.json
    icon.png
```

This structure includes all required resources to **build** and **upload** the Extension to Cognigy.AI. The `README.md` is used to show the code's content. Thus, other developers or interested usrs can get familiar with the functionality. The entire source code of our exposed [Flow Nodes](https://docs.cognigy.com/v4.0/docs/flow-nodes) is located in the `src/nodes/` folder, in which the next four files (`package.json`, `package-lock.json`, `tslint.json`, `tsconfig.json`) are used to create the Javascript module and check it for mistakes. The icon is required to show the module's logo in Cognigy. In most cases, the icon shows the logo of the third-party software product which we are integrating with. 

**Notes:**
- The `icon.png` needs to have the following dimensions:
    - 64x64 Pixels

**The example structure can be copied from the [Extension Example](./example)**.


## Develop an Extension

We want to introduce you to these new concepts now.

### Install NPM @cognigy/extension-tools

In order to provide all functions and types to create and develop an Extension, we published the ['@cognigy/extension-tools' NPM package](https://www.npmjs.com/package/@cognigy/extension-tools). Therefore, please install it globally on your computer:

- `npm i -g @cognigy/extension-tools`

### Use the createNodeDescriptor() Method

The method `createNodeDescriptor` is one of the most central methods exposed by the 'extension-tools' package. If one wants to build a new extension, we advice to put the source code of a single `flow-node` into a separate file, unless you are crafting nodes that contain child-nodes (see example/src/nodes/randomPath).

Defining a node essentially looks like this (you can find this example in 'example/src/nodes/reverseSay):

```typescript
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

// The interface defines which values the Extension can use in the function below.
export interface IReverseSayParams extends INodeFunctionBaseParams {
	config: {
		text: string;
	}
}

export const reverseSay = createNodeDescriptor({
	type: "reverseSay",
	defaultLabel: "Simple Reverse Say",
	fields: [
		{
			key: "text",
			label: "The text you want to reverse.",
			type: "cognigyText",
			params: {
				required: true
			}
		}
	],

	function: async ({ cognigy, config }: IReverseSayParams) => {
		const { api } = cognigy;
		const { text } = config;

		// Reverse the input text
		const reversedText = text.split("").reverse().join();

		// Execute a SAY Node to output the reversed text to the user
		api.say(reversedText);
	}
});
```

Let's analyze the different peaces we can see in the code-window above:
```typescript
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
```

Here we are just importing the `createNodeDescriptor` method from the extension-tools package. We are also importing a Typescript interface we want to use.

```typescript
export interface IReverseSayParams extends INodeFunctionBaseParams {
	config: {
		text: string;
	}
}
```

In this part of the node-code we are crafting a `new Typescript interface` for the config (the arguments) of the new flow-node. We advise you to do this for your nodes as you will have a better developer experience when you are actually creating the `code` (aka the `function`) of your flow-node. Make sure that you extend on our `INodeFunctionBaseParams` interface - this will give you access to:
- **cognigy** object with sub-properties:
  - **api**: This exposes the APi your flow-nodes can use.
  - **input**: The Cognigy Input Object, this is a proxy so you can set/get values.
  - **context**: The Cognigy Context Object, this is a proxy so you can set/get values.
  - **profile**; The Cognigy Contact Profijle Object, this is a proxy so you can set/get values.
- **nodeId** the actual id of the node that is being executed
- **config** this is the config/arguments of your node - that's why you should overwrit this in your own Interface
- **childConfigs[]** these are the config objects of all children, in case your node has children

```typescript
export const reverseSay = createNodeDescriptor({
	type: "reverseSay",
	defaultLabel: "Simple Reverse Say",
	fields: [
		{
			key: "text",
			label: "The text you want to reverse.",
			type: "cognigyText",
			params: {
				required: true
			}
		}
	],
	fields: [
		{
			key: "text",
			label: "The text you want to reverse.",
			type: "cognigyText"
		}
	],

	function: async ({ cognigy, config }: IReverseSayParams) => {
		const { api } = cognigy;
		const { text } = config;

		// Reverse the input text
		const reversedText = text.split("").reverse().join();

		// Execute a SAY Node to output the reversed text to the user
		api.say(reversedText);
	}
});
```

---

### Additional Definitions

Now comes the actual definition & implementation of your flow-node. You essentially pass in an object into `createNodeDescriptor` and it will create a full node-descriptor for you. The method will fill-up properties you don't set with safe default values. Let's discuss some of the properties you have to set:
- **type**: This is the `type` of your node. It needs to a unique string in your extension.
- **defaults**: These are the default values for your Node. If a new flow-node gets created, it will get these defaults. You must set the `label` and the `config` object.
- **fields**: This section defines the user interface which will get generated for your node-config. You have to add a `field definition` per key in your `config` object. You reference the `key in your config` using the `key` property in the field definition. The label is used in the UI as well. The type gives you a variety of possibilities - you can e.g. say that your field should be of type `cognigyText` or e.g. of type json or toggle.
- **function**: This actually contains the code of your flow-node. Ensure that you add the `async` keyword. The execution engine will always `await` the execution of your node. We have full Typescript support, please e.g. check the typings of the **cognigy** object as we don't have full documentation, yet.

#### createExtension

Whereas the `createNodeDescriptor` method essentially just fills-up default-values for your flow-nodes, it's the `createExtension` methods job to bundle all nodes and connection definitions into one large object which will then be passed into the Cognigy.AI system.

Make sure that you are using the `default export ` syntax for the createExtensions return-value as we need to be able to find the complete object.

I suggest that you always create a `module.ts` file which essentially looks like the one in `example/src/module.ts`. Please only import all nodes and connections into this file and assign them to the payload you pass into the create extension method.

#### Connections

In Cognigy 3 we have introduced the concept of `Secrets` which allow you to store configuration in a secure way. Secrets do no longer directly exist in Cognigy 4, but where replaced with `Connections`.

The new part is, that there is a strong relationship between a flow-node which needs a connection and the connection itself. Connections are essentially Secrets and store key/value pairs - so-called fields in an encrypted way.

If you want to use a connection within a node, you have to do the following:
- add a **field** with **type: connection** to your flow-node, you can see this in 'example/src/nodes/executeCognigyApiRequest.ts'
  ```typescript
  {
      key: "connection",
      label: "The api-key connection which should be used.",
      type: "connection",
      params: {
          connectionType: "api-key" // this needs to match the connections 'type' property
      }
  }
  ```
- create a connection definition, see 'example/src/connections/'
- add the **connection** into your **createExtensions** call - if you miss it there, it will not be there.

You have to ensure that the `params.connectionType` in your flow-node field definition maps to a connection and a proper `type` of the connection. You can define multiple connections within a single extension and the `type` field is used to find the correct connections that satisfy the fields your node requires.