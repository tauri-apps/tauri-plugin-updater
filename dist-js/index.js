import { Channel, invoke } from '@tauri-apps/api/core';

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
class Update {
    constructor(metadata) {
        this.currentVersion = metadata.currentVersion;
        this.version = metadata.version;
        this.date = metadata.date;
        this.body = metadata.body;
    }
    /** Downloads the updater package and installs it */
    async downloadAndInstall(onEvent) {
        const channel = new Channel();
        if (onEvent != null) {
            channel.onmessage = onEvent;
        }
        return invoke("plugin:updater|download_and_install", {
            onEvent: channel,
        });
    }
}
/** Check for updates, resolves to `null` if no updates are available */
async function check(options) {
    if (options?.headers) {
        options.headers = Array.from(new Headers(options.headers).entries());
    }
    return invoke("plugin:updater|check", { ...options }).then((meta) => (meta.available ? new Update(meta) : null));
}

export { Update, check };
