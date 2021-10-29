const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");
const photographer = document.getElementById(
    "photographer"
) as HTMLAnchorElement;
const attribution = document.getElementById("attribution");
let topSitesContainer = document.getElementById("topSitesCenter");
const settingsButton = document.getElementById("settings-button");
const versionElement = document.getElementById("nebula-version");

const hourModeSwitch = document.getElementById(
    "hour-mode-switch"
) as HTMLInputElement;
const topSitesSwitch = document.getElementById(
    "top-sites-switch"
) as HTMLInputElement;
const topSitesCenterPositionSwitch = document.getElementById(
    "top-sites-center-position-switch"
) as HTMLInputElement;
const newBackgroundButton = document.getElementById("new-background-button");
const newBackgroundButtonIcon = document.getElementById(
    "new-background-button-icon"
);

// Please don't use this
const proxyUrl = "https://nebula-unsplash-proxy.hkamran-workers.workers.dev";
const NEBULA_VERSION = "__NEBULA_VERSION__";

const SCREENSHOT_MODE = false;

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

// Initialization
if (container) {
    const lastUpdated = browser.storage.local.get("lastUpdated");

    if (versionElement) {
        versionElement.textContent = NEBULA_VERSION;
    }

    if (getBrowser() == Browsers.WebKit) {
        let icon = document.createElement("link");
        icon.rel = "icon";
        icon.href = "/assets/icons/logo-masked48.png";

        let shortcutIcon = document.createElement("link");
        shortcutIcon.rel = "shortcut icon";
        shortcutIcon.href = "/assets/icons/logo-masked48.png";

        document.head.appendChild(icon);
        document.head.appendChild(shortcutIcon);
    }

    if (!SCREENSHOT_MODE) {
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
    } else {
        container.style.backgroundImage = `url('https://images.unsplash.com/photo-1528353518104-dbd48bee7bc4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3132&q=80')`;
        setAttribution({
            photographer: "Chan Hoi",
            photographerUrl: "https://unsplash.com/@jokerhoi",
            imageUrl: "",
        });
    }
}

// Initialization
setTimeout((): void => {
    const d = new Date();

    if (time) {
        time.classList.remove("opacity-0");

        if (!SCREENSHOT_MODE) {
            getUserHour(
                (twelveHour: boolean) =>
                    (time.textContent = getTime(twelveHour))
            );
        } else {
            time.textContent = "9:45 AM";
        }
    }

    if (date) {
        date.classList.remove("opacity-0");
        if (!SCREENSHOT_MODE) {
            date.textContent = d.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } else {
            date.textContent = "Tuesday, October 19, 2021";
        }
    }

    if (attribution) {
        attribution.classList.remove("opacity-0");
    }

    if (settingsButton) {
        settingsButton.classList.remove("opacity-0");
    }

    if (topSitesContainer) {
        getTopSiteValue().then((topSitesValue: boolean) =>
            topSitesToggle(topSitesValue)
        );
    }
}, 300);

if (!SCREENSHOT_MODE) {
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
}

// Time Mode Switcher Button, Settings Panel
if (
    hourModeSwitch &&
    topSitesSwitch &&
    topSitesCenterPositionSwitch &&
    newBackgroundButton &&
    newBackgroundButtonIcon
) {
    // Initialization
    getUserHour(
        (twelveHour: boolean) => (hourModeSwitch.checked = !twelveHour)
    );

    if (topSitesContainer) {
        topSitesCenterPositionSwitch.checked =
            topSitesContainer.id === "topSitesCenter";
    }

    getTopSiteValue().then(
        (topSitesValue: boolean) => (topSitesSwitch.checked = topSitesValue)
    );

    // Event Listeners
    hourModeSwitch.addEventListener("click", () =>
        getUserHour((twelveHour: boolean) => {
            browser.storage.local.set({
                hourStatus: twelveHour ? "24" : "12",
            });

            if (time) {
                time.textContent = getTime(!twelveHour);
            }
        })
    );

    topSitesSwitch.addEventListener("click", () =>
        getTopSiteValue().then((topSitesValue: boolean) => {
            browser.storage.local.set({ topSites: !topSitesValue });
            topSitesToggle(!topSitesValue);
        })
    );

    topSitesCenterPositionSwitch.addEventListener("click", () => {
        toggleTopSiteContainer().then(
            (newPosition: string) =>
                (topSitesCenterPositionSwitch.checked =
                    newPosition === "center" ? true : false)
        );

        getTopSiteValue().then((topSitesValue: boolean) => {
            if (topSitesValue) {
                unloadTopSites();
                loadTopSites();
            }
        });
    });

    newBackgroundButton.addEventListener("click", () => {
        newBackgroundButtonIcon.classList.add("animate-spin");

        saveNewBackgroundImage((dataUrl: string) => {
            if (container) {
                container.style.backgroundImage = `url('${dataUrl}')`;
                newBackgroundButtonIcon.classList.remove("animate-spin");
            }
        });
    });
}

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

async function getTopSiteContainer(): Promise<void> {
    const storageResponse = await browser.storage.local.get(
        "topSitesContainer"
    );

    if (storageResponse.topSitesContainer !== "topLeft") {
        if (document.getElementById("topSitesCenter")) {
            topSitesContainer = document.getElementById("topSitesCenter");
        }
    } else {
        if (document.getElementById("topSitesTopLeft")) {
            topSitesContainer = document.getElementById("topSitesTopLeft");
        }
    }
}

async function toggleTopSiteContainer(): Promise<string> {
    const currentPosition =
        topSitesContainer?.id === "topSitesCenter" ? "center" : "topLeft";

    let newPosition = "";
    if (currentPosition !== "topLeft") {
        newPosition = "topLeft";
    } else {
        newPosition = "center";
    }

    browser.storage.local.set({ topSitesContainer: newPosition });

    return newPosition;
}

async function getTopSiteValue(): Promise<boolean> {
    await getTopSiteContainer();

    const storageResponse = await browser.storage.local.get("topSites");
    return storageResponse.topSites ? storageResponse.topSites === true : false;
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
    const topSitesCenter = document.getElementById("topSitesCenter");
    const topSitesTopLeft = document.getElementById("topSitesTopLeft");

    if (topSitesCenter && topSitesCenter.innerHTML !== "") {
        topSitesCenter.textContent = "";
    }

    if (topSitesTopLeft && topSitesTopLeft.innerHTML !== "") {
        topSitesTopLeft.textContent = "";
    }
}

function loadTopSites(): void {
    if (topSitesContainer) {
        const linkClassNames =
            topSitesContainer.id === "topSitesCenter"
                ? "p-4 bg-black bg-opacity-75 rounded-lg"
                : "";
        const imgClassNames =
            topSitesContainer.id === "topSitesCenter" ? "w-8" : "w-6";
        const maxTopSites = topSitesContainer.id === "topSitesCenter" ? 20 : 5;

        // Firefox-based Browsers
        if (getBrowser() === Browsers.Gecko) {
            browser.topSites
                .get({
                    includeFavicon: true,
                    limit: maxTopSites,
                })
                .then((topSites) => {
                    if (
                        topSitesContainer &&
                        topSitesContainer.id === "topSitesCenter"
                    ) {
                        topSitesContainer.classList.add(
                            topSites.length >= 1 && topSites.length < 5
                                ? `grid-cols-${topSites.length}`
                                : "grid-cols-5"
                        );
                    }

                    topSites.forEach((site) => {
                        const a = document.createElement("a");
                        a.href = site.url;
                        a.title = site.title || "";
                        a.target = "_blank";
                        a.className = linkClassNames;

                        if (site.favicon) {
                            const img = document.createElement("img");
                            img.className = imgClassNames;
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
                if (
                    topSitesContainer &&
                    topSitesContainer.id === "topSitesCenter"
                ) {
                    topSitesContainer.classList.add(
                        topSites.length >= 1 && topSites.length < 5
                            ? `grid-cols-${topSites.length}`
                            : "grid-cols-5"
                    );
                }

                topSites.slice(0, maxTopSites).forEach((site) => {
                    const a = document.createElement("a");
                    a.href = site.url;
                    a.title = site.title || "";
                    a.target = "_blank";
                    a.className = linkClassNames;

                    const img = document.createElement("img");
                    img.className = imgClassNames;
                    getFavicon(
                        new URL(site.url).host,
                        (dataUrl: string) => (img.src = dataUrl)
                    );

                    a.appendChild(img);

                    if (topSitesContainer) {
                        topSitesContainer.appendChild(a);
                    }
                });
            });
        }
    }
}

function getFavicon(siteHost: string, callback: Function): void {
    browser.storage.local.get("topSitesFavicons").then(
        (storageResponse) => {
            if (
                storageResponse.topSitesFavicons &&
                Object.keys(storageResponse.topSitesFavicons).indexOf(
                    siteHost
                ) !== -1
            ) {
                callback(storageResponse.topSitesFavicons[`${siteHost}`]);
            } else {
                toDataURL(`https://api.faviconkit.com/${siteHost}`)
                    .then((dataUrl) => {
                        browser.storage.local.set({
                            topSitesFavicons: {
                                ...storageResponse.topSitesFavicons,
                                [siteHost]: dataUrl,
                            },
                        });
                        callback(dataUrl);
                    })
                    .catch(() =>
                        callback(
                            "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-globe'%3e%3ccircle cx='12' cy='12' r='10'%3e%3c/circle%3e%3cline x1='2' y1='12' x2='22' y2='12'%3e%3c/line%3e%3cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3e%3c/path%3e%3c/svg%3e"
                        )
                    );
            }
        },
        () =>
            toDataURL(`https://api.faviconkit.com/${siteHost}`)
                .then((dataUrl) => {
                    browser.storage.local.set({
                        topSitesFavicons: { [siteHost]: dataUrl },
                    });
                    callback(dataUrl);
                })
                .catch(() =>
                    callback(
                        "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-globe'%3e%3ccircle cx='12' cy='12' r='10'%3e%3c/circle%3e%3cline x1='2' y1='12' x2='22' y2='12'%3e%3c/line%3e%3cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3e%3c/path%3e%3c/svg%3e"
                    )
                )
    );
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
