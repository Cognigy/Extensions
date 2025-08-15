import * as TurndownService from 'turndown';

interface HeadingData {
    title: string;
    hierarchy: string;
    result: string;
}

interface HeadingStackItem {
    level: number;
    text: string;
}

export class ConfluenceDataParser {
    private targetHeadingsLevel: number;
    private pageName: string = '';
    private turndownService: TurndownService;
    private html: string;

    /**
     * Constructs a new ConfluenceDataParser instance.
     * @param html The HTML content to parse
     * @param pageName The name of the page
     * @param targetHeadingsLevel The target heading level to extract
     */
    constructor(html: string, pageName: string, targetHeadingsLevel: number) {
        this.html = html
        this.targetHeadingsLevel = targetHeadingsLevel;
        this.pageName = pageName;
        this.initializeTurndownService();
    }

    /**
     * Initializes the TurndownService with custom rules for Confluence content.
     */
    private initializeTurndownService(): void {
        this.turndownService = new TurndownService({
            headingStyle: 'atx',           // Use # ## ### format
            bulletListMarker: '-',         // Use - for bullet points
            emDelimiter: '_',              // Use _emphasis_
            strongDelimiter: '**',         // Use **strong**
            linkStyle: 'inlined',          // Use [text](url) format
            linkReferenceStyle: 'full',    // Full reference links
            blankReplacement: this.handlingForEmptyNode.bind(this)
        });
        this.addConfluenceRules();
    }

    /**
     *  Adds custom rules to the TurndownService for handling Confluence specific elements.
     */
    private addConfluenceRules(): void {

        // Handle Confluence task lists
        this.turndownService.addRule('confluenceTaskList', {
            filter: (node) => node.nodeName === 'AC:TASK-LIST',
            replacement: (content, node) => {
                const element = node as any;
                const tasks = element.querySelectorAll ? element.querySelectorAll('ac\\:task') : [];
                if (tasks && tasks.length > 0) {
                    const taskTexts = Array.from(tasks).map((task: any) => {
                        const status = task.querySelector ? task.querySelector('ac\\:task-status') : null;
                        const body = task.querySelector ? task.querySelector('ac\\:task-body span') : null;
                        const isComplete = status?.textContent === 'complete';
                        const taskText = body ? (body.innerText || body.textContent || '') : '';
                        return `- [${isComplete ? 'x' : ' '}] ${taskText}`;
                    });
                    return `\n${taskTexts.join('\n')}\n`;
                }
                return '';
            }
        });
    }

    /**
     * A callback function passed to TurndownService to handle empty nodes during
     * the conversion process. Handles specific empty nodes like AC:IMAGE and TIME.
     * @param content The content of the node being processed
     * @param node The node being processed
     * @returns A string that represents the content to replace the empty node with
     */
    private handlingForEmptyNode(content, node): string {

        // Handle AC:IMAGE directly in blankReplacement
        if (node.nodeName === 'AC:IMAGE') {

            // Extract caption from ac:caption element (handles nested HTML)
            const captionMatch = node.outerHTML.match(/<ac:caption>(.*?)<\/ac:caption>/);
            let caption = '';
            if (captionMatch) {
                const captionHtml = captionMatch[1];
                caption = captionHtml.replace(/<[^>]*>/g, '').trim();
            }

            return `Image ![*${caption}*]`;
        }

        // Handle TIME directly in blankReplacement,
        // Node: Make sure to check the parent node if parent is also empty,
        // otherwise child node will not be processed
        if (node.nodeName === 'P') {
            const html = node.outerHTML || '';

            // Check if this P element contains a TIME element
            if (html.includes('<time') || html.includes('<TIME')) {

                // Extract datetime from the time element within this P
                const datetimeMatch = html.match(/datetime="([^"]+)"/);
                const datetime = datetimeMatch ? datetimeMatch[1] : 'unknown-date';
                return `${datetime}`;
            }
        }
        return node.isBlock ? '\n\n' : '';
    }

    /**
     * Parses the HTML content and converts the confluence specific elements into a structured format.
     * @returns An array of HeadingData objects, each containing the title, hierarchy, and content of a section.
     */
    public parse(): HeadingData[] {
        const fullMarkdown = this.turndownService.turndown(this.html);
        const lines = fullMarkdown.split('\n');
        const result: HeadingData[] = [];
        let currentContent = '';
        let currentHeading: HeadingData | null = null;
        const headingStack: HeadingStackItem[] = [];

        const saveCurrentSection = () => {
            if (!currentContent.trim()) return;

            const section = currentHeading || { title: this.pageName, hierarchy: "", result: "" };
            section.result = currentContent.trim() + "\n";
            result.push(section);
            currentContent = '';
        };

        for (const line of lines) {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            console.log("line: " + line);
            if (headingMatch && headingMatch[1].length <= this.targetHeadingsLevel) {

                // Save previous section
                saveCurrentSection();

                // Create new heading
                const level = headingMatch[1].length;
                const text = headingMatch[2];

                // Remove all headings at the same level or deeper
                const indexToRemove = headingStack.findIndex(h => h.level >= level);
                if (indexToRemove >= 0) headingStack.splice(indexToRemove);

                // If heading is link, extract text from markdown link format ## [text](url)
                const linkMatch = line.match(/^(#{1,6})\s*\[([^\]]+)\]/);
                const processed_heading = linkMatch ? linkMatch[1] + " " + linkMatch[2] : line

                // Add current heading to stack
                headingStack.push({ level, text: processed_heading });

                currentHeading = {
                    title: processed_heading.replace(/^#+\s*/, ''),
                    hierarchy: headingStack.map(h => h.text).join(' -> '),
                    result: ""
                };
            } else {
                currentContent += line + '\n';
            }
        }

        // Handle final section
        saveCurrentSection();
        return result;
    }
}

export default ConfluenceDataParser;