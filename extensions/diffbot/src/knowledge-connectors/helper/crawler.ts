import { fetchWithRetry, logMessage } from "./utils";

interface CrawlJobSettings {
  name: string;
  seeds: string[];
  apiUrl: string;

  // Crawling Settings
  urlCrawlPattern?: string[];
  urlCrawlRegEx?: string;
  maxToCrawl?: number;
  maxToCrawlPerSubdomain?: number;
  maxHops?: number;
  crawlDelay?: number;
  obeyRobots?: boolean;
  restrictDomain?: boolean;
  restrictSubdomain?: boolean;
  useProxies?: boolean;
  useCanonical?: boolean;

  // Processing Settings
  urlProcessPattern?: string[];
  urlProcessRegEx?: string;
  pageProcessPattern?: string[];
  maxToProcess?: number;
  maxToProcessPerSubdomain?: number;

  // Custom Headers
  userAgent?: string;
  referer?: string;
  cookie?: string;
  acceptLanguage?: string;
}

interface DiffbotResult {
  title?: string;
  type?: string;
  pageUrl?: string;
  html?: string;
  humanLanguage?: string;
  [key: string]: any; // Allow for additional properties
}

const SUCCESS_JOB_STATUS_CODES = [1, 2, 3, 5, 9];
const FAILED_JOB_STATUS_CODES = [6, 8, 10, 11]; // If Job is paused, it will be considered failed

class DiffbotCrawler {
  private token: string;
  private crawlUrl: string;

  constructor(token: string) {
    this.token = token;
    this.crawlUrl = `https://api.diffbot.com/v3/crawl`;
  }

  /**
   * Create a new crawl job
   */
  async createCrawlJob(settings: CrawlJobSettings): Promise<void> {
    const payload = await this.getPayload(settings);
    const params = new URLSearchParams({ token: this.token });
    await fetchWithRetry(`${this.crawlUrl}?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });
  }

  /**
   * Monitor crawler job and wait for completion, then return the results
   */
  async monitorJobAndGetResults(
    jobName: string,
    checkInterval: number = 5000,
    maxWaitTime: number = 900000,
  ): Promise<DiffbotResult[]> {
    logMessage(`Starting crawl job monitoring: ${jobName}`);
    const startTime = Date.now();
    const maxAttempts = Math.floor(maxWaitTime / checkInterval);

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const {
        jobStatus: { status, message },
      } = (await this.getJobStatus(jobName)).jobs[0];
      if (SUCCESS_JOB_STATUS_CODES.includes(status)) {
        logMessage(`Job ${jobName} completed successfully!`);

        // Return the job data on success
        return await this.getJobData(jobName);
      } else if (FAILED_JOB_STATUS_CODES.includes(status)) {
        throw new Error(`Job ${jobName} failed: ${message}`);
      }

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      logMessage(
        `Job ${jobName} status: ${message} (code: ${status}). Elapsed: ${elapsed}s`,
      );

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    throw new Error(`Job ${jobName} timed out after ${maxWaitTime}ms.`);
  }

  /**
   * Get status of a crawl job
   */
  async getJobStatus(jobName: string): Promise<any> {
    const params = new URLSearchParams({ token: this.token, name: jobName });
    const response = await fetchWithRetry(`${this.crawlUrl}?${params}`);
    return response;
  }

  /**
   * Get crawl job data
   */
  async getJobData(jobName: string): Promise<DiffbotResult[]> {
    const params = new URLSearchParams({ token: this.token });
    const status = await this.getJobStatus(jobName);
    const downloadUrl = status.jobs?.[0].downloadJson;
    return downloadUrl
      ? ((await fetchWithRetry(`${downloadUrl}?${params}`)) as DiffbotResult[])
      : [];
  }

  /**
   * Delete crawl job
   */
  async deleteJob(jobName: string): Promise<void> {
    const params = new URLSearchParams({
      token: this.token,
      name: jobName,
      delete: "1",
    });
    await fetchWithRetry(`${this.crawlUrl}?${params}`);
  }

  /**
   * Prepare payload for creating a crawl job, and set default values
   */
  async getPayload(job: CrawlJobSettings): Promise<URLSearchParams> {
    const patternOptions = [
      "urlCrawlPattern",
      "urlProcessPattern",
      "pageProcessPattern",
    ];
    const booleanOptions = [
      "obeyRobots",
      "restrictDomain",
      "restrictSubdomain",
      "useProxies",
      "useCanonical",
    ];
    const headerMap: Record<string, string> = {
      userAgent: "User-Agent",
      referer: "Referer",
      cookie: "Cookie",
      acceptLanguage: "Accept-Language",
    };

    // Convert all values to strings for form data
    const params = new URLSearchParams();
    Object.entries(job).forEach(([key, value]) => {
      switch (true) {
        case key === "seeds":
          params.append(key, value.join(" "));
          break;
        case patternOptions.includes(key):
          params.append(key, value.join("||"));
          break;
        case booleanOptions.includes(key):
          params.append(key, value ? "1" : "0");
          break;
        case key in headerMap:
          if (value)
            params.append("customHeaders", `${headerMap[key]}:${value}`);
          break;
        default:
          params.append(key, String(value));
      }
    });
    return params;
  }
}

export { DiffbotCrawler, type CrawlJobSettings };
