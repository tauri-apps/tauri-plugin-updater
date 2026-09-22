import { Resource, Channel, invoke } from '@tauri-apps/api/core';

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * In-app updates for Tauri applications: check the configured endpoints for a new release,
 * download it and install it.
 *
 * @module
 */
/**
 * An update announced by the update server, as returned by {@linkcode check}.
 *
 * It holds a resource on the Rust side, so call {@linkcode Update.close} when you are done with it
 * without installing it.
 *
 * @since 2.0.0
 */
class Update extends Resource {
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
    constructor(metadata) {
        super(metadata.rid);
        this.available = true;
        this.currentVersion = metadata.currentVersion;
        this.version = metadata.version;
        this.date = metadata.date;
        this.body = metadata.body;
        this.rawJson = metadata.rawJson;
    }
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
    async download(onEvent, options) {
        convertToRustHeaders(options);
        const channel = new Channel();
        if (onEvent) {
            channel.onmessage = onEvent;
        }
        const downloadedBytesRid = await invoke('plugin:updater|download', {
            onEvent: channel,
            rid: this.rid,
            ...options
        });
        this.downloadedBytes = new Resource(downloadedBytesRid);
    }
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
    async install(options) {
        if (!this.downloadedBytes) {
            throw new Error('Update.install called before Update.download');
        }
        await invoke('plugin:updater|install', {
            updateRid: this.rid,
            bytesRid: this.downloadedBytes.rid,
            ...options
        });
        // Don't need to call close, we did it in rust side already
        this.downloadedBytes = undefined;
    }
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
    async downloadAndInstall(onEvent, options) {
        convertToRustHeaders(options);
        const channel = new Channel();
        if (onEvent) {
            channel.onmessage = onEvent;
        }
        await invoke('plugin:updater|download_and_install', {
            onEvent: channel,
            rid: this.rid,
            ...options
        });
    }
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
    async close() {
        await this.downloadedBytes?.close();
        await super.close();
    }
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
async function check(options) {
    convertToRustHeaders(options);
    const metadata = await invoke('plugin:updater|check', {
        ...options
    });
    return metadata ? new Update(metadata) : null;
}
/**
 * Converts the headers in options to be an {@linkcode Array<[string, string]>} which is what the Rust side expects
 */
function convertToRustHeaders(options) {
    if (options?.headers) {
        options.headers = Array.from(new Headers(options.headers).entries());
    }
}

export { Update, check };
