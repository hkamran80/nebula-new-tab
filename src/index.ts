const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");
const photographer = document.getElementById(
    "photographer"
) as HTMLAnchorElement;
const attribution = document.getElementById("attribution");
const topSitesContainer = document.getElementById("topSites");
const settingsButton = document.getElementById("settings-button");
const settingsPanelTemplate = document.getElementById(
    "settings-panel-template"
);
const versionElement = document.getElementById("nebula-version");

const hourModeSwitchSelector = ".hour-mode-switch";
const topSitesSwitchSelector = ".top-sites-switch";
const newBackgroundButtonSelector = ".new-background-button";
const newBackgroundButtonAnimationSelector = ".new-background-button--spin";

// Please don't use this
const proxyUrl = "https://nebula-unsplash-proxy.hkamran-workers.workers.dev";
const NEBULA_VERSION = "__NEBULA_VERSION__";

// Initialization
if (container) {
    const lastUpdated = browser.storage.local.get("lastUpdated");

    if (versionElement) {
        versionElement.textContent = NEBULA_VERSION;
    }

    lastUpdated.then(
        ({ lastUpdated }) => {
            // 12 hours
            if (
                new Date().getTime() - new Date(lastUpdated).getTime() >=
                43200000
            ) {
                saveNewBackgroundImage();
            }

            const backgroundImage = browser.storage.local.get([
                "backgroundImage",
                "photographerName",
                "photographerUrl",
            ]);
            backgroundImage.then(
                (data: any) => {
                    if (data.backgroundImage) {
                        container.style.backgroundImage = `url('${data.backgroundImage}')`;

                        setAttribution({
                            photographer: data.photographerName,
                            photographerUrl: data.photographerUrl,
                            imageUrl: "",
                        });
                    } else {
                        saveNewBackgroundImage((dataUrl: string) => {
                            container.style.backgroundImage = `url('${dataUrl}')`;
                        });
                    }
                },
                () =>
                    console.error(
                        "Error occurred when setting background image"
                    )
            );
        },
        () => console.error("Error occurred when getting last updated time")
    );
}

// Initialization
setTimeout((): void => {
    const d = new Date();

    if (time) {
        time.classList.remove("opacity-0");
        getUserHour(
            (twelveHour: boolean) => (time.textContent = getTime(twelveHour))
        );
    }

    if (date) {
        date.classList.remove("opacity-0");
        date.textContent = d.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    if (attribution) {
        attribution.classList.remove("opacity-0");
    }

    if (settingsButton) {
        settingsButton.classList.remove("opacity-0");
    }

    if (topSitesContainer) {
        getTopSiteValue((topSitesValue: boolean) => {
            topSitesToggle(topSitesValue);
        });
    }
}, 300);

// Intervals
// Time Interval
setInterval((): void => {
    if (time) {
        getUserHour((twelveHour: boolean) => {
            time.textContent = getTime(twelveHour);
        });
    }
    // 1000 ms = 1 second
}, 1000);

// Date Interval
setInterval((): void => {
    if (date) {
        const d = new Date();
        date.textContent = d.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    const lastUpdated = browser.storage.local.get("lastUpdated");
    lastUpdated.then(({ lastUpdated }) => {
        if (
            new Date().getTime() - new Date(lastUpdated).getTime() >=
            86400000
        ) {
            if (container) {
                saveNewBackgroundImage((dataUrl: string) => {
                    container.style.backgroundImage = `url('${dataUrl}')`;
                });
            }
        }
    });
    // 3600000 ms = 1 hour
}, 3600000);

// Time Mode Switcher Button, Settings Panel
if (settingsButton && settingsPanelTemplate) {
    // Settings Panel
    // @ts-ignore
    tippy(settingsButton, {
        content: settingsPanelTemplate.innerHTML,
        allowHTML: true,
        interactive: true,
        onShown(instance: any) {
            getUserHour((twelveHour: boolean) =>
                $(hourModeSwitchSelector).prop("checked", !twelveHour)
            );

            getTopSiteValue((topSitesValue: boolean) =>
                $(topSitesSwitchSelector).prop("checked", topSitesValue)
            );

            $(hourModeSwitchSelector)
                .off("click")
                .on("click", () =>
                    getUserHour((twelveHour: boolean) => {
                        browser.storage.local.set({
                            hourStatus: twelveHour ? "24" : "12",
                        });

                        if (time) {
                            time.textContent = getTime(!twelveHour);
                        }
                    })
                );

            $(topSitesSwitchSelector)
                .off("click")
                .on("click", () =>
                    getTopSiteValue((topSitesValue: boolean) => {
                        browser.storage.local.set({ topSites: !topSitesValue });

                        topSitesToggle(!topSitesValue);
                    })
                );

            $(newBackgroundButtonSelector)
                .off("click")
                .on("click", () => {
                    $(newBackgroundButtonAnimationSelector).addClass(
                        "animate-spin"
                    );

                    saveNewBackgroundImage((dataUrl: string) => {
                        if (container) {
                            container.style.backgroundImage = `url('${dataUrl}')`;
                            $(newBackgroundButtonAnimationSelector).removeClass(
                                "animate-spin"
                            );
                        }
                    });
                });
        },
    });
}

// Functions
function getUserHour(callback: Function): void {
    const hourStatus = browser.storage.local.get("hourStatus");
    hourStatus.then((hourData: any) => {
        if (hourData.hourStatus) {
            callback(hourData.hourStatus === "12");
        } else {
            callback(true);
        }
    });
}

function getTopSiteValue(callback: Function): void {
    const storageData = browser.storage.local.get("topSites");
    storageData.then((storageValue: any) => {
        if (storageValue.topSites) {
            callback(storageValue.topSites === true);
        } else {
            callback(false);
        }
    });
}

function topSitesToggle(topSitesValue: boolean): void {
    if (topSitesValue) {
        unloadTopSites();
        loadTopSites();
    } else {
        unloadTopSites();
    }
}

function unloadTopSites(): void {
    if (topSitesContainer && topSitesContainer.innerHTML !== "") {
        topSitesContainer.textContent = "";
    }
}

function loadTopSites(): void {
    if (getBrowser() === Browsers.Gecko) {
        browser.topSites
            .get({ includeFavicon: true, limit: 5 })
            .then((topSites) => {
                console.debug(topSites);
                topSites.forEach((site) => {
                    const a = document.createElement("a");
                    a.href = site.url;
                    a.title = site.title || "";
                    a.target = "_blank";

                    if (site.favicon) {
                        const img = document.createElement("img");
                        img.className = "w-6";
                        img.src = site.favicon;
                        a.appendChild(img);
                    }

                    if (topSitesContainer) {
                        topSitesContainer.appendChild(a);
                    }
                });
            });
    } else {
        browser.topSites.get().then((topSites) => {
            topSites.slice(0, 5).forEach((site) => {
                const a = document.createElement("a");
                a.href = site.url;
                a.title = site.title || "";
                a.target = "_blank";

                const img = document.createElement("img");
                img.className = "w-6";
                toDataURL(
                    `https://api.faviconkit.com/${new URL(site.url).host}`
                )
                    .then((dataUrl) => (img.src = dataUrl))
                    .catch(
                        () =>
                            (img.src =
                                "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-globe'%3e%3ccircle cx='12' cy='12' r='10'%3e%3c/circle%3e%3cline x1='2' y1='12' x2='22' y2='12'%3e%3c/line%3e%3cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3e%3c/path%3e%3c/svg%3e")
                    );

                a.appendChild(img);

                if (topSitesContainer) {
                    topSitesContainer.appendChild(a);
                }
            });
        });
    }
}

async function getFaviconUrl(host: string): Promise<string> {
    const apiRequest = await fetch(
        `http://favicongrabber.com/api/grab/${host}`
    );

    const apiJson = await apiRequest.json();
    if (apiJson) {
        console.debug(apiJson);
        console.debug(apiJson.icons[0]);
        console.debug(apiJson.icons[0].src);
        return apiJson.icons[0].src;
    }

    throw new Error("Unable to retrieve favicon URL");
}

function getTime(twelveHourTime: boolean): string {
    const d = new Date();

    if (twelveHourTime) {
        return d.toLocaleString("en-us", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    } else {
        return (
            d.getHours().toString() + ":" + padNumber(d.getMinutes().toString())
        );
    }
}

function saveNewBackgroundImage(callback = null as Function | null) {
    const d = new Date();

    getUnsplashImage()
        .then((response) => setAttribution(response))
        .then((response) => response.imageUrl && toDataURL(response.imageUrl))
        .then((dataUrl) => {
            browser.storage.local.set({
                backgroundImage: dataUrl,
                lastUpdated: d.toISOString(),
            });

            if (callback) {
                callback(dataUrl);
            }
        });
}

async function toDataURL(imageUrl: string): Promise<any> {
    let blob = await fetch(imageUrl).then((r) => r.blob());

    let dataUrl = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });

    return dataUrl;
}

async function setAttribution(
    unsplashResponse: UnsplashResponse
): Promise<UnsplashResponse> {
    if (photographer) {
        photographer.href =
            unsplashResponse.photographerUrl +
            "?utm_source=nebula-new-tab&utm_medium=referral";

        photographer.textContent = unsplashResponse.photographer;
    }

    browser.storage.local.set({
        photographerName: unsplashResponse.photographer,
        photographerUrl: unsplashResponse.photographerUrl,
    });

    return unsplashResponse;
}

function padNumber(number: number | string): string {
    return Number(number < 10)
        ? "0" + Number(number).toString()
        : Number(number).toString();
}

async function getUnsplashImage(): Promise<UnsplashResponse> {
    const randomImage = await fetch(`${proxyUrl}/random?collections=935518`);
    const randomImageJson = await randomImage.json();
    const encodedUrl = encodeURIComponent(
        randomImageJson.links.download_location
    );
    const downloadUrl = await fetch(
        `${proxyUrl}/download?downloadUrl=${encodedUrl}`
    );
    const downloadUrlJson = await downloadUrl.json();

    const imageUrl = downloadUrlJson.url;

    return {
        photographer: randomImageJson.user.name,
        photographerUrl: randomImageJson.user.links.html,
        imageUrl,
    } as UnsplashResponse;
}

function getBrowser(): Browsers | null {
    // @ts-ignore
    const browserPrefix = Object.values(
        window.getComputedStyle(document.documentElement, "")
    )
        .join("")
        .match(/-(moz|webkit|ms)/)[1];

    /*
    `moz` - Gecko (Firefox)
    `webkit` - WebKit (Chrome, Safari, Opera, Edge (Chromium))
    `ms` - MS (Internet Explorer, Edge (Trident Engine))
    */
    switch (browserPrefix) {
        case "moz":
            return Browsers.Gecko;
        case "webkit":
            return Browsers.WebKit;
        case "ms":
            return Browsers.MS;
        default:
            return null;
    }
}

// Models
interface UnsplashResponse {
    photographer: string;
    photographerUrl: string;
    imageUrl: string;
}

enum Browsers {
    Gecko,
    WebKit,
    MS,
}
