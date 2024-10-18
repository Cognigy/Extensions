# Intento Enterprise Language Hub

**Author:** [Intento Inc.](https://inten.to)  

## Description
The Intento Enterprise Language Hub provides access to over 20 machine translation systems, including custom models, smart routing mechanisms, and various tweaking abilities for pre- and post-processing. This extension allows you to leverage the Enterprise Language Hub directly within the Cognigy Platform. To use this extension, a commercial API key for Intento MT Hub is required. Please obtain one from [Intento Console](https://console.inten.to).

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
3. [Nodes](#nodes)
    - [Detect Language](#detect-language)
    - [Translate](#translate)
4. [Support](#support)
5. [License](#license)

## Installation
To install or import the Intento Enterprise Language Hub package into your Cognigy.AI platform, follow these steps:
1. Navigate to the Extensions section in the Cognigy.AI interface.
2. Find the Extension in the Cognigy Marketplace or click on "Upload Extension" button and select the Intento Enterprise Language Hub package.
3. Follow the on-screen instructions to complete the installation process.

## Usage
### Basic Usage Instructions
1. Ensure you have a valid Intento API key. You can get one from the [Intento Console](https://console.inten.to).
2. Use the provided nodes to detect languages and translate text within your Cognigy.AI flows.

## Nodes

### Detect Language
This node detects the language of a given text.

#### Input Parameters:
- **Connection**: Intento API key
- **Text**: The text for language detection
- **Language detection provider**: The language detection provider. Supported providers include Google, Support, IBM. Microsoft is set by default.
- **Store location**: The location where the result of language detection should be stored. The language ISO code is returned.

### Translate
This node translates a given text from a source language to a target language.

#### Input Parameters:
- **Connection**: Intento API key
- **Text to translate**: The text string that needs to be translated
- **Source language code**: The language ISO code of the source language (can be empty).
- **Target language code**: The language ISO code of the target language (cannot be empty).
- **Intento routing**: Intento routing table name. Default is Intento best routing.
- **Store location**: The location where the result of the translation should be stored.
- **Additional logging**: Enable additional logging on the Intento backend side (disabled by default). Reveals the text of the payload.
- **Translation Storage**: Enable cache on the Intento backend side.
- **Translation Storage Instance**: Allows filtering Translation Storage entries by instance ID. Default is the Cognigy profile ID.

## Support
For any issues or questions regarding the Intento Enterprise Language Hub, please contact Intento Inc. support at [support@inten.to](mailto:support@inten.to).
