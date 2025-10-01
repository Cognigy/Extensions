# Cognigy Extensions

## Nodes
In [Cognigy.AI](https://cognigy.com/product/), you can use [Flows](https://docs.cognigy.com/ai/build/flows/overview/) to build custom AI Agents and you might need to integrate a third-party system to store or retrieve data. Extensions let you build JavaScript modules and expose them as [Nodes](https://docs.cognigy.com/ai/build/node-reference/overview/) within Cognigy.AI. There are no restrictions on node modules ([NPM](https://www.npmjs.com/)) or functionality.

## Knowledge Connectors
In [Cognigy.AI](https://cognigy.com/product/), [Knowledge Stores](https://docs.cognigy.com/ai/empower/knowledge-ai/knowledge-store/) are used to store information that your AI Agents can access as context through [Knowledge AI](https://docs.cognigy.com/ai/agents/develop/knowledge-ai/overview/). Extensions allow you to build JavaScript modules and expose them as [Knowledge Connectors](https://docs.cognigy.com/ai/for-devlopers/extensions#knowledge-connectors) within Cognigy.AI. Knowledge Connectors can integrate with any third-party system and fetch data or files from external knowledge bases such as Confluence, SharePoint, and more. There are no restrictions on which Node.js modules ([NPM](https://www.npmjs.com/)) or functionality you can use.

### NPM: @cognigy/extension-tools

[![npm](https://img.shields.io/npm/v/@cognigy/extension-tools/latest.svg)](https://www.npmjs.com/package/@cognigy/extension-tools)

## All you want is to see some example code?

Check out the example extension [right here](./docs/example/).

## Contents

- [Get Started](https://support.cognigy.com/hc/en-us/articles/360016534459)
- [Installation](https://support.cognigy.com/hc/en-us/articles/360016505680)
- [Best Practises](https://support.cognigy.com/hc/en-us/articles/360016505740)
- [New Feature Request](#new-feature-request)
- [Releases](https://support.cognigy.com/hc/en-us/articles/360016409380-Extensions)

## Overview

This repository contains the source code of existing modules which can be used as blueprints for further developments. Therefore, all of them are provided under the [MIT license](./LICENSE).

You are subject to the terms of the third-party providers which you are connecting to when you use Extensions. Cognigy cannot take responsibility for your use of the third-party services, systems or materials. Cognigy.AI Extensions are licensed under the MIT license.

## Approval Process

If you want us to approve your Extension, please note the following approval process:

1. Add a `README.md` to your module and describe all Nodes and Knowledge Connectors in detail.
2. Check your code for hardcoded passwords, tokens or outdated JavaScript/TypeScript usage (e.g. `var foo;`).
3. Create a new Pull Request for your Extension feature branch.
4. Send all information and data, which are required to use the Extension, to the following E-Mail address:
    - support at cognigy.com

**Important:** \
Please note, that Cogngiy does not provide enterprise support for developed Extensions. This repository is licensed under MIT, in which the community is responsible for the shared modules. If you found a bug or want to improve yet developed functionalities, please don't hesitate to create a branch.

### Create a new Extension or fix a bug

In order to create a new Extension, please create a new feature branch:

- `git checkout -b feature/<your-feature>`

If you want to fix an existing module, please create a bug branch:

- `git checkout -b bug/<module-name>`

## New Feature Request

Next to the already published integrations, there are a lot of third-party systems out there that could be integrated into Cognigy.AI 4.0 in the future as well. Therefore, one can follow these steps to request a new Extension if there are no developer resources to develop it on their own:

1. [Check if there is a branch that already implements your requested Extension / feature](https://github.com/Cognigy/Extensions/branches)
2. [Create a new Feature Request](https://github.com/Cognigy/Extensions/issues/new?assignees=&labels=&template=feature_request.md&title=)
