browser.runtime.onInstalled.addListener(async () => {
    browser.storage.local.set({
        hourStatus: "12",
    });

    await browser.tabs.create({});
});

browser.browserAction.onClicked.addListener(() => browser.tabs.create({}));
