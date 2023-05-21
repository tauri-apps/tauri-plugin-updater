interface CheckOptions {
    /**
     * Request headers
     */
    headers?: Record<string, unknown>;
    /**
     * Timeout in seconds
     */
    timeout?: number;
    /**
     * Target identifier for the running application. This is sent to the backend.
     */
    target?: string;
}
interface UpdateResponse {
    available: boolean;
    currentVersion: string;
    latestVersion: string;
    date?: string;
    body?: string;
}
type DownloadEvent = {
    event: "Started";
    data: {
        contentLength?: number;
    };
} | {
    event: "Progress";
    data: {
        chunkLength: number;
    };
} | {
    event: "Finished";
};
declare class Update {
    response: UpdateResponse;
    constructor(response: UpdateResponse);
    downloadAndInstall(onEvent?: (progress: DownloadEvent) => void): Promise<void>;
}
declare function check(options?: CheckOptions): Promise<Update>;
export type { CheckOptions, UpdateResponse, DownloadEvent };
export { check, Update };
