import { Channel, invoke } from '@tauri-apps/api/tauri';

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
class Update {
    constructor(response) {
        this.response = response;
    }
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
async function check(options) {
    return invoke("plugin:updater|check", { ...options }).then((response) => new Update(response));
}

export { Update, check };
//# sourceMappingURL=index.mjs.map
