import { parse, HTMLElement } from 'node-html-parser';

// Type definitions
interface HeadingData {
    title: string;
    hierarchy: string;
    level: number;
    result: string;
}

interface HeadingStackItem {
    level: number;
    text: string;
}

export class ConfluenceHtmlParser {
    private root: HTMLElement;
    private headingStructure: HeadingData[] = [];
    private currentHeading: HeadingData | null = null;
    private headingStack: HeadingStackItem[] = [];
    private result: string = '';
    private targetHeadings: string[];
    private pageName: string = '';
    private hasFoundHeading: boolean = false;

    constructor(html: string, pageName: string, targetHeadings: string[]) {
        this.root = parse(html);
        this.targetHeadings = targetHeadings;
        this.pageName = pageName;
        this.reset();
    }

    private reset(): void {
        this.headingStructure = [];
        this.currentHeading = null;
        this.headingStack = [];
        this.result = '';
        this.hasFoundHeading = false;
    }

    public parse(): HeadingData[] {
        this.reset();
        this.processNodeList(this.root.childNodes);
        this.finalizeCurrentHeading();
        this.cleanupResults();
        return this.headingStructure;
    }

    private processNodeList(nodes: any[]): void {
        if (!nodes) return;

        nodes.forEach(child => {
            if (child.nodeType === 1) { // Element node
                this.processElement(child);
            } else if (child.nodeType === 3) { // Text node
                this.processTextNode(child);
            }
        });
    }

    private processTextNode(node: any): void {
        const text = node.textContent;
        if (text && text.trim()) {
            this.result += text;
        }
    }

    private processElement(element: HTMLElement): void {
        const tagName = element.tagName?.toLowerCase() || '';

        // Check if this is a target heading
        if (this.isTargetHeading(tagName)) {
            this.handleTargetHeading(element, tagName);
            return; // Don't process heading content as regular text
        }

        switch (tagName) {
            case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
                if (!this.isTargetHeading(tagName)) {
                    this.result += '\n';
                    this.processChildren(element);
                    this.result += '\n';
                }
                break;

            case 'p':
                this.processChildren(element);
                this.result += '\n';
                break;

            case 'br':
                this.result += '\n';
                break;

            case 'hr':
                this.result += '\n---\n';
                break;

            case 'a':
                const href = element.getAttribute('href');
                const linkText = element.innerText || element.textContent;
                if (href && linkText?.trim()) {
                    this.result += linkText + " (" + href + ")";
                } else if (linkText?.trim()) {
                    this.result += linkText;
                }
                break;

            case 'blockquote':
                this.result += '\n> ';
                this.processChildren(element);
                this.result += '\n';
                break;

            case 'ol':
            case 'ul':
                this.result += '\n' + this.parseNestedList(element, 0);
                break;

            case 'table':
                this.result += this.parseTable(element);
                break;

            case 'time':
                const datetime = element.getAttribute('datetime');
                if (datetime) {
                    this.result += datetime;
                }
                break;

            default:
                if (element.tagName) {
                    const confluenceResult = ConfluenceElementParser.parseConfluenceElements(element);
                    if (confluenceResult !== null) {
                        this.result += confluenceResult;
                        return; // Don't process children if we handled the element
                    }
                }

                // Only process children if element wasn't handled
                this.processChildren(element);
                break;
        }
    }

    private processChildren(element: HTMLElement): void {
        if (element.childNodes) {
            element.childNodes.forEach(child => {
                if (child.nodeType === 1) { // Element node
                    this.processElement(child as HTMLElement);
                } else if (child.nodeType === 3) { // Text node
                    const text = child.textContent;
                    if (text && text.trim()) {
                        this.result += text;
                    }
                }
            });
        }
    }

    private isTargetHeading(tagName: string): boolean {
        return tagName.match(/^h[1-6]$/) !== null &&
            this.targetHeadings.includes(tagName);
    }

    private handleTargetHeading(element: HTMLElement, tagName: string): void {
        this.saveContentBeforeFirstHeading();
        this.saveCurrentHeading();
        this.createNewHeading(element, tagName);
    }

    private saveContentBeforeFirstHeading(): void {
        if (!this.hasFoundHeading && this.result.trim()) {
            const pageContent: HeadingData = {
                title: this.pageName,
                hierarchy: "",
                level: 0,
                result: this.cleanupText(this.result.trim())
            };
            this.headingStructure.push(pageContent);
            this.result = '';
        }
    }

    private saveCurrentHeading(): void {
        if (this.currentHeading) {
            this.currentHeading.result = this.cleanupText(this.result.trim());
            this.headingStructure.push(this.currentHeading);
            this.result = '';
        }
    }

    private createNewHeading(element: HTMLElement, tagName: string): void {
        this.hasFoundHeading = true;

        const headingLevel = parseInt(tagName.substring(1));
        const headingText = (element.innerText || element.textContent || "").trim();

        // Update heading stack for hierarchy and build hierarchy string
        this.updateHeadingStack(headingLevel, headingText);
        const hierarchy = this.headingStack.map(h => h.text).join(' -> ');

        this.currentHeading = {
            title: headingText,
            hierarchy: hierarchy,
            level: headingLevel,
            result: ""
        };
    }

    private updateHeadingStack(level: number, text: string): void {
        this.headingStack = this.headingStack.filter(h => h.level < level);
        this.headingStack.push({ level, text });
    }

    private parseNestedList(listElement: HTMLElement, depth: number = 0): string {
        let result = '';
        const listItems = listElement.querySelectorAll(':scope > li') || [];

        listItems.forEach(li => {
            let content = '';
            if (li.childNodes) {
                li.childNodes.forEach(child => {
                    const childElement = child as HTMLElement;
                    const tagName = childElement.tagName?.toLowerCase() || '';
                    if (tagName === 'ol' || tagName === 'ul') {
                        const nestedResult = this.parseNestedList(child as HTMLElement, depth + 1);
                        content += '\n' + nestedResult;
                    } else if (tagName === 'a') {
                        const href = (child as HTMLElement).getAttribute('href');
                        const linkText = child.innerText || child.textContent;
                        content += href ? `${linkText} (${href})` : (linkText || '');
                    } else {
                        content += child.innerText || child.textContent || '';
                    }
                });
            }

            content = content.trim();
            if (content) {
                const indent = '  '.repeat(depth);
                result += `${indent}• ${content}\n`;
            }
        });
        return result;
    }

    private parseTable(tableElement: HTMLElement): string {
        let tableText = '\n';

        // Extract headers
        const headerRow = tableElement.querySelector('tr');
        const headers = headerRow?.querySelectorAll('th') || [];

        if (headers.length > 0) {
            const headerTexts = Array.from(headers).map(th =>
                (th.innerText || th.textContent || '').replace(/\s+/g, ' ').trim()
            );
            tableText += headerTexts.join(' | ') + '\n';
            tableText += headerTexts.map(() => '---').join(' | ') + '\n';
        }

        // Extract data rows
        const rows = tableElement.querySelectorAll('tr') || [];
        Array.from(rows).forEach((row, index) => {
            if (index === 0 && headers.length > 0) return; // Skip header row

            const cells = row.querySelectorAll('td') || [];
            if (cells.length > 0) {
                const cellTexts = Array.from(cells).map(td => {
                    let cellContent = td.innerText || td.textContent || '';

                    // Handle links in cells
                    const links = td.querySelectorAll('a') || [];
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        const linkText = link.innerText || link.textContent;
                        if (href && linkText) {
                            cellContent = cellContent.replace(linkText, `${linkText} (${href})`);
                        }
                    });

                    return cellContent.replace(/\s+/g, ' ').trim() || '-';
                });
                tableText += cellTexts.join(' | ') + '\n';
            }
        });

        return tableText + '\n';
    }

    private finalizeCurrentHeading(): void {
        if (this.currentHeading) {
            this.currentHeading.result = this.cleanupText(this.result.trim());
            this.headingStructure.push(this.currentHeading);
        }
    }

    private cleanupResults(): void {
        this.headingStructure.forEach(headingObj => {
            headingObj.result = this.cleanupText(headingObj.result);
        });
    }

    private cleanupText(text: string): string {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&rsquo;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&nbsp;/g, ' ')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/^\s+|\s+$/g, '');
    }
}

class ConfluenceElementParser {
    static parseConfluenceElements(element: HTMLElement): string | null {
        const tagName = element.tagName?.toLowerCase() || '';

        // Handle Confluence structured macros
        if (tagName === 'ac:structured-macro') {
            return this.parseStructuredMacro(element);
        }

        // Handle Confluence task lists
        if (tagName === 'ac:task-list') {
            return this.parseTaskList(element);
        }

        // Handle ADF extensions
        if (tagName === 'ac:adf-extension') {
            return this.parseADFExtension(element);
        }

        // Handle layout elements
        if (tagName?.startsWith('ac:layout')) {
            return null; // Let it process children normally
        }

        // Handle Confluence images
        if (tagName === 'ac:image') {
            return '[Image]';
        }

        // Handle Confluence links
        if (tagName === 'ac:link') {
            return this.parseConfluenceLink(element);
        }

        return null;
    }

    private static parseStructuredMacro(element: HTMLElement): string {
        const macroName = element.getAttribute('ac:name');

        switch (macroName) {
            case 'code':
                return this.parseCodeMacro(element);
            case 'expand':
                return this.parseExpandMacro(element);
            case 'status':
                return this.parseStatusMacro(element);
            case 'info':
            case 'note':
            case 'tip':
            case 'warning':
                return this.parsePanelMacro(element, macroName);
            case 'panel':
                return this.parseCustomPanelMacro(element);
            default:
                return '';
        }
    }

    private static parseCodeMacro(element: HTMLElement): string {
        const cdata = element.querySelector('ac\\:plain-text-body');
        if (cdata?.innerHTML) {
            const codeContent = cdata.innerHTML.match(/CDATA\[([\s\S]*?)\]/);
            if (codeContent) {
                return `\n\`\`\`\n${codeContent[1]}\n\`\`\`\n`;
            }
        }
        return '';
    }

    private static parseExpandMacro(element: HTMLElement): string {
        const titleParam = element.querySelector('ac\\:parameter[ac\\:name="title"]');
        const richBody = element.querySelector('ac\\:rich-text-body');
        const title = titleParam?.innerText || '';
        const content = richBody?.innerText || richBody?.textContent || '';
        return title ? `\n**${title}**\n${content}\n` : `\n${content}\n`;
    }

    private static parseStatusMacro(element: HTMLElement): string {
        const statusTitle = element.querySelector('ac\\:parameter[ac\\:name="title"]');
        if (statusTitle) {
            const titleText = statusTitle.innerText || statusTitle.textContent || '';
            return titleText ? titleText.trim() : '';
        }
        return '';
    }

    private static parsePanelMacro(element: HTMLElement, macroName: string): string {
        const panelBody = element.querySelector('ac\\:rich-text-body');
        const panelContent = panelBody?.innerText || panelBody?.textContent || '';
        return `\n${macroName.toUpperCase()}: ${panelContent}\n`;
    }

    private static parseCustomPanelMacro(element: HTMLElement): string {
        const customPanelBody = element.querySelector('ac\\:rich-text-body');
        const customPanelContent = customPanelBody?.innerText || customPanelBody?.textContent || '';
        return `\nPANEL: ${customPanelContent}\n`;
    }

    private static parseTaskList(element: HTMLElement): string {
        const tasks = element.querySelectorAll('ac\\:task-body span') || [];
        if (tasks.length > 0) {
            const taskTexts = Array.from(tasks).map(task =>
                `• ${task.innerText || task.textContent || ''}`
            );
            return `\n${taskTexts.join('\n')}\n`;
        }
        return '';
    }

    private static parseADFExtension(element: HTMLElement): string {
        const decisionList = element.querySelector('ac\\:adf-node[type="decision-list"]');
        if (decisionList) {
            const decisions = decisionList.querySelectorAll('ac\\:adf-content') || [];
            if (decisions.length > 0) {
                const decisionTexts = Array.from(decisions).map(decision =>
                    `• ${decision.innerText || decision.textContent || ''}`
                );
                return `\n${decisionTexts.join('\n')}\n`;
            }
            // Fallback to HTML list
            const fallback = element.querySelector('ac\\:adf-fallback');
            return fallback?.innerText || fallback?.textContent || '';
        }

        const panel = element.querySelector('ac\\:adf-node[type="panel"]');
        if (panel) {
            const panelContent = panel.querySelector('ac\\:adf-content');
            return panelContent ? `\nPANEL: ${panelContent.innerText || panelContent.textContent || ''}\n` : '';
        }

        return '';
    }

    private static parseConfluenceLink(element: HTMLElement): string {
        const userLink = element.querySelector('ri\\:user');
        if (userLink) {
            return '[User]';
        }

        const pageLink = element.querySelector('ri\\:page');
        if (pageLink) {
            const contentTitle = pageLink.getAttribute('ri:content-title');
            const linkBody = element.querySelector('ac\\:link-body');
            const linkText = linkBody?.innerText || linkBody?.textContent || '';
            return contentTitle ? `${linkText} (Internal: ${contentTitle})` : linkText;
        }

        return '';
    }
}

export default ConfluenceHtmlParser;