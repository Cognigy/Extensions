import { JSDOM } from "jsdom";
import { convert } from 'html-to-text';

/**
 * Opens a website URL using fetch and JSDOM,
 * extracts text content using html-to-text
 */
export const getTextFromWebPage = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html, {url, pretendToBeVisual: true });

        // Convert to text using html-to-text with better options
        const textContent = convert(dom.window.document.body.innerHTML, {
            wordwrap: false,
            preserveNewlines: false,
            selectors: [
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' },
                { selector: 'nav', format: 'skip' },
                { selector: '.navigation', format: 'skip' },
                { selector: 'ul', options: { itemPrefix: '• ' } },
                { selector: 'ol', options: { itemPrefix: '' } }
            ]
        });

        dom.window.close();
        return textContent;

    } catch (error) {
        throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
    }
};