/**
 * In-app updates for Tauri applications: check the configured endpoints for a new release,
 * download it and install it.
 *
 * @module
 */
import { Resource } from '@tauri-apps/api/core';
/** Options used when checking for updates */
interface CheckOptions {
    /**
     * The headers to send along with the update check request.
     */
    headers?: HeadersInit;
    /**
     * Timeout in milliseconds
     */
    timeout?: number;
    /**
     * A proxy url to be used when checking and downloading updates.
     */
    proxy?: string;
    /**
     * Target identifier for the running application. This is sent to the backend.
     */
    target?: string;
}
/** Options used when downloading an update */
interface DownloadOptions {
    /**
     * The headers to send along with the update download request.
     */
    headers?: HeadersInit;
    /**
     * Timeout in milliseconds
     */
    timeout?: number;
}
/** Options used when installing an update */
interface InstallOptions {
    /**
     * If the Windows installer should restart the app after installed, default is `true`
     */
    restartAfterInstall?: boolean;
}
interface UpdateMetadata {
    rid: number;
    currentVersion: string;
    version: string;
    date?: string;
    body?: string;
    rawJson: Record<string, unknown>;
}
/** Updater download event */
type DownloadEvent = {
    event: 'Started';
    data: {
        contentLength?: number;
    };
} | {
    event: 'Progress';
    data: {
        chunkLength: number;
    };
} | {
    event: 'Finished';
};
/**
 * An update announced by the update server, as returned by {@linkcode check}.
 *
 * It holds a resource on the Rust side, so call {@linkcode Update.close} when you are done with it
 * without installing it.
 *
 * @since 2.0.0
 */
declare class Update extends Resource {
    /**
     * Whether an update is available.
     *
     * @deprecated This is always true, check if the return value is `null` instead when using {@linkcode check}
     */
    available: boolean;
    /**
     * The version of the application that is currently running.
     */
    currentVersion: string;
    /**
     * The version announced by the update server.
     */
    version: string;
    /**
     * The publish date of the update as an RFC 3339 string, when the server provided one.
     */
    date?: string;
    /**
     * The release notes of the update, when the server provided them.
     */
    body?: string;
    /**
     * The raw update manifest returned by the server, useful when it contains
     * additional fields that the updater itself does not handle.
     */
    rawJson: Record<string, unknown>;
    private downloadedBytes?;
    /**
     * Creates an update from the metadata returned by the backend.
     * You should not need to call this yourself, use {@linkcode check} instead.
     *
     * @param metadata The update information returned by the backend, including the resource identifier of the update.
     *
     * @example
     * ```typescript
     * import { check } from '@tauri-apps/plugin-updater';
     * // the update instance is created for you by `check`
     * const update = await check();
     * ```
     */
    constructor(metadata: UpdateMetadata);
    /**
     * Downloads the updater package. Call {@linkcode install} later to install it.
     *
     * @example
     * ```typescript
     * import { check } from '@tauri-apps/plugin-updater';
     *
     * const update = await check();
     * if (update) {
     *   let downloaded = 0;
     *   await update.download((event) => {
     *     if (event.event === 'Progress') {
     *       downloaded += event.data.chunkLength;
     *       console.log(`downloaded ${downloaded} bytes`);
     *     }
     *   });
     *   await update.install();
     * }
     * ```
     *
     * @param onEvent Callback invoked with a `Started` event when the first chunk is received, a `Progress` event for every downloaded chunk and a `Finished` event when the download completes.
     * @param options The headers and the timeout to use for the download request.
     */
    download(onEvent?: (progress: DownloadEvent) => void, options?: DownloadOptions): Promise<void>;
    /**
     * Install downloaded updater package. Must be called after {@linkcode download}.
     *
     * ## Platform-specific:
     *
     * - **Windows:** This function exits the app after launching the updater installer successfully
     * - **macOS / Linux:** You need to relaunch the app to run the newly install version
     *
     * @example
     * ```typescript
     * import { check } from '@tauri-apps/plugin-updater';
     *
     * const update = await check();
     * if (update) {
     *   await update.download();
     *   await update.install();
     * }
     * ```
     *
     * @param options Options for the installation, such as whether the Windows installer should restart the app afterwards.
     */
    install(options?: InstallOptions): Promise<void>;
    /**
     * Downloads the updater package and installs it
     *
     * ## Platform-specific:
     *
     * - **Windows:** This function exits the app after launching the updater installer successfully
     * - **macOS / Linux:** You need to relaunch the app to run the newly install version
     *
     * @example
     * ```typescript
     * import { check } from '@tauri-apps/plugin-updater';
     *
     * const update = await check();
     * if (update) {
     *   await update.downloadAndInstall((event) => {
     *     console.log(event.event);
     *   });
     * }
     * ```
     *
     * @param onEvent Callback invoked with a `Started` event when the first chunk is received, a `Progress` event for every downloaded chunk and a `Finished` event when the download completes.
     * @param options The headers and the timeout to use for the download request, and the installation options.
     */
    downloadAndInstall(onEvent?: (progress: DownloadEvent) => void, options?: DownloadOptions & InstallOptions): Promise<void>;
    /**
     * Releases the update resource and the downloaded bytes held by the backend.
     *
     * @example
     * ```typescript
     * import { check } from '@tauri-apps/plugin-updater';
     *
     * const update = await check();
     * if (update) {
     *   await update.close();
     * }
     * ```
     */
    close(): Promise<void>;
}
/**
 * Checks the configured endpoints for an available update.
 *
 * @example
 * ```typescript
 * import { check } from '@tauri-apps/plugin-updater';
 *
 * const update = await check();
 * if (update) {
 *   console.log(`update ${update.version} is available`);
 *   await update.downloadAndInstall();
 * }
 * ```
 *
 * @param options The headers, timeout, proxy and target to use for the update check request.
 *
 * @returns A promise resolving to the available {@linkcode Update}, or `null` when no update is available.
 *
 * @since 2.0.0
 */
declare function check(options?: CheckOptions): Promise<Update | null>;
export type { CheckOptions, DownloadOptions, DownloadEvent };
export { check, Update };
