import { Resource, Channel, invoke } from '@tauri-apps/api/core';

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
class Update extends Resource {
    constructor(metadata) {
        super(metadata.rid);
        this.available = metadata.available;
        this.currentVersion = metadata.currentVersion;
        this.version = metadata.version;
        this.date = metadata.date;
        this.body = metadata.body;
        this.rawJson = metadata.rawJson;
    }
    /** Download the updater package */
    async download(onEvent, options) {
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
    /** Install downloaded updater package */
    async install() {
        if (!this.downloadedBytes) {
            throw new Error('Update.install called before Update.download');
        }
        await invoke('plugin:updater|install', {
            updateRid: this.rid,
            bytesRid: this.downloadedBytes.rid
        });
        // Don't need to call close, we did it in rust side already
        this.downloadedBytes = undefined;
    }
    /** Downloads the updater package and installs it */
    async downloadAndInstall(onEvent, options) {
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
    async close() {
        await this.downloadedBytes?.close();
        await super.close();
    }
}
/** Check for updates, resolves to `null` if no updates are available */
async function check(options) {
    if (options?.headers) {
        options.headers = Array.from(new Headers(options.headers).entries());
    }
    return await invoke('plugin:updater|check', {
        ...options
    }).then((meta) => (meta.available ? new Update(meta) : null));
}

export { Update, check };
