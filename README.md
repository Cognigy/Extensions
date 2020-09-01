# Cognigy Extensions

In [Cognigy.AI](https://cognigy.com/product/), so-called [Flows](https://docs.cognigy.com/docs/flow) are used to build Conversational.AI. There, it could be the case that one needs to integrate a third-party system to store or retreive data. Extensions enable anyone to build JavaScript modules and to expose them as [Flow Nodes](https://docs.cognigy.com/docs/general-usage-information) within Cognigy. There are no restrictions on node modules ([NPM](https://www.npmjs.com/)) or functionality.


## Contents

- [Get Started](./docs/get-started.md)
- [Installation](./docs/installation.md)
- [Best Practises](./docs/best-practises.md)
- [Releases](RELEASES.md)

## Overview

This repository contains the source code of existing modules which can be used as blueprints for further developments. Therefore, all of them are provided under the [MIT license](./LICENSE).

## Approval Process

If you want us to approve your Extension, please note the following approval process:

1. Add a `README.md` to your module and describe all nodes in detail.
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