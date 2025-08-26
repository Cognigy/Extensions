/* Node Modules */
import { chromium, Page } from "playwright";;

/**
 * opens a website url in headless chromium using playwright,
 * waits until it's "loaded" and returns the page object
 */
const openPage = async (url: string): Promise<Page> => {
    // Chrome's new headless mode is opt-in so we need to specify the channel
    // https://github.com/microsoft/playwright/issues/33566
    const browser = await chromium.launch({ channel: "chromium" });
    const page = await browser.newPage();
    await page.goto(url);
    await Promise.race([
        page.waitForLoadState("load"),
        waitSeconds(5).then(() => {
            throw new Error("Page load timeout exceeded");
        })
    ]);

    return page;
}

/**
 * extracts the "text" content from a "page" object.
 *
 * this method is encapsulated since it is most likely grow
 * in complexity once we're iterating on the "content isolation"
 */
const getTextContentFromPage = async (page: Page): Promise<string> => {
    return await page.innerText("body");
}

/**
 * uses playwright to trigger a "scroll to bottom"
 * by evaluating code inside the page context
 */
const scrollPageToBottom = async (page: Page) => {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
}

/**
 * waits {duration} seconds before resolving
 */
const waitSeconds = async (duration: number) => new Promise(resolve => {
    setTimeout(resolve, duration * 1000);
});

interface IGetPageTextFromUrlOptions {
    /**
     * the maximum number of retries before page content gets published
     * regardless of stability
     */

    maxRetries: number;
    /**
     * the amount of seconds to wait between content stability checks
     */
    retryInterval: number;

    /**
     * the amount of checks for which the page content has to stay
     * identical before it's considered "stable"
     */
    stabilityThreshold: number;
}

/**
 * retreives the text content of a web page with a given url and returns it as a string
 *
 * features an automated "content stability" check controlled via the`stabilityThreshold`,
 * `retryInterval` and `maxRetries` options.
 */
export const getTextFromWebPage = async (url: string, options: IGetPageTextFromUrlOptions): Promise<string> => {
    const {
        stabilityThreshold = 1,
        retryInterval = .5,
        maxRetries = 0,
    } = options;

    const page = await (async () => {
        try {
            return await openPage(url);
        } catch (error) {
            const message = `Unable to open web page at URL "${url}"`;
            throw new Error(message);
        }
    })();

    let text: string;
    let stability = 0;

    /**
     * continuously checks the content of the web page
     * in a set interval until either the content stayed
     * identical for `stabilityThreshold` amount of checks
     * in sequence or the `maxRetries` limit was reached.
     *
     * between all content checks, scrolls to the bottom
     * of the page to trigger most common "lazy-loading"
     * mechanisms.
     */
    for (let checkCount = 0; checkCount < maxRetries; checkCount++) {
        const currentText = await getTextContentFromPage(page);

        // do we have any content?
        const isEmpty = !text;

        // bump stability if content is equal,
        // otherwise update "last known text"
        // and reset stability
        if (currentText === text) {
            stability++;
        } else {
            stability = 0;
            text = currentText;
        }

        // content is "stable" if it didn't change over the last n checks
        const isStable = stability >= stabilityThreshold;

        // we're done if the content is stable and not empty
        if (isStable && !isEmpty)
            break;

        // if we're about to check again,
        // scroll to bottom and wait for the retry interval
        if (checkCount < maxRetries) {
            await scrollPageToBottom(page);
            await waitSeconds(retryInterval);
        }
    }

    if (!text) {
        console.log(`Found no text content for Web Page '${url}'`);
    } else if (stability < stabilityThreshold) {
        console.log(`Found unstable text content with length '${text.length}' for Web Page '${url}'`);
    } else {
        console.log(`Found text content with length '${text.length}' for Web Page '${url}'`);
    }

    await page.close();

    return text;
}