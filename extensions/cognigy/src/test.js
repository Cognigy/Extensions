const { openPage, getTextFromWebPage } = require('/home/falak/Workspace/Extentions2/extensions/cognigy/build/knowledge-connectors/parser/webContentParser.js');


// (async () => {
//     const url = "https://en.wikipedia.org/wiki/Main_Page";
//     try {
//         return await openPage(url);
//     } catch (error) {
//         const message = `Unable to open web page at URL "${url}"`;
//         throw new Error(error.message);
//     }
// })();


const testOpenPage = async () => {
    console.log("🧪 Starting openPage tests...");

    const testCases = [
        "https://en.wikipedia.org/wiki/Main_Page",
        "https://example.com",
        "https://httpbin.org/html"
    ];

    for (const url of testCases) {
        try {
            console.log(`\n📋 Testing: ${url}`);
            const page = await openPage(url);
            console.log("✅ Page opened successfully");

            const title = await page.title();
            console.log(`📑 Page title: ${title}`);

            await page.close();
            console.log("🔒 Page closed");
        } catch (error) {
            console.error(`❌ Failed for ${url}:`, error.message);
        }
    }
};

const testGetTextFromWebPage = async () => {
    console.log("\n🧪 Testing getTextFromWebPage...");

    try {
        const url = "https://example.com";
        const options = {
            maxRetries: 3,
            retryInterval: 0.5,
            stabilityThreshold: 1
        };

        const text = await getTextFromWebPage(url, options);
        console.log(`✅ Text extracted successfully. Length: ${text.length}`);
        console.log(`📄 First 100 chars: ${text.substring(0, 100)}...`);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
};

// Run tests
(async () => {
    await testOpenPage();
    await testGetTextFromWebPage();
    process.exit(0);
})();