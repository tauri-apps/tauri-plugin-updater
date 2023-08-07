/** Options used to check for updates */
interface CheckOptions {
    /**
     * Request headers
     */
    headers?: HeadersInit;
    /**
     * Timeout in seconds
     */
    timeout?: number;
    /**
     * Target identifier for the running application. This is sent to the backend.
     */
    target?: string;
}
interface UpdateMetadata {
    available: boolean;
    currentVersion: string;
    version: string;
    date?: string;
    body?: string;
}
/** Updater download event */
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
    currentVersion: string;
    version: string;
    date?: string;
    body?: string;
    constructor(metadata: UpdateMetadata);
    /** Downloads the updater package and installs it */
    downloadAndInstall(onEvent?: (progress: DownloadEvent) => void): Promise<void>;
}
/** Check for updates, resolves to `null` if no updates are available */
declare function check(options?: CheckOptions): Promise<Update | null>;
export type { CheckOptions, DownloadEvent };
export { check, Update };
