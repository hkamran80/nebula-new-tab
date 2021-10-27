"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");
const photographer = document.getElementById("photographer");
const attribution = document.getElementById("attribution");
let topSitesContainer = document.getElementById("topSitesCenter");
const settingsButton = document.getElementById("settings-button");
const versionElement = document.getElementById("nebula-version");
const hourModeSwitch = document.getElementById("hour-mode-switch");
const topSitesSwitch = document.getElementById("top-sites-switch");
const topSitesCenterPositionSwitch = document.getElementById("top-sites-center-position-switch");
const newBackgroundButton = document.getElementById("new-background-button");
const newBackgroundButtonIcon = document.getElementById("new-background-button-icon");
// Please don't use this
const proxyUrl = "https://nebula-unsplash-proxy.hkamran-workers.workers.dev";
const NEBULA_VERSION = "__NEBULA_VERSION__";
const SCREENSHOT_MODE = false;
var Browsers;
(function (Browsers) {
    Browsers[Browsers["Gecko"] = 0] = "Gecko";
    Browsers[Browsers["WebKit"] = 1] = "WebKit";
    Browsers[Browsers["MS"] = 2] = "MS";
})(Browsers || (Browsers = {}));
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
        lastUpdated.then(({ lastUpdated }) => {
            // 12 hours
            if (new Date().getTime() - new Date(lastUpdated).getTime() >=
                43200000) {
                saveNewBackgroundImage();
            }
            const backgroundImage = browser.storage.local.get([
                "backgroundImage",
                "photographerName",
                "photographerUrl",
            ]);
            backgroundImage.then((data) => {
                if (data.backgroundImage) {
                    container.style.backgroundImage = `url('${data.backgroundImage}')`;
                    setAttribution({
                        photographer: data.photographerName,
                        photographerUrl: data.photographerUrl,
                        imageUrl: "",
                    });
                }
                else {
                    saveNewBackgroundImage((dataUrl) => {
                        container.style.backgroundImage = `url('${dataUrl}')`;
                    });
                }
            }, () => console.error("Error occurred when setting background image"));
        }, () => console.error("Error occurred when getting last updated time"));
    }
    else {
        container.style.backgroundImage = `url('https://images.unsplash.com/photo-1528353518104-dbd48bee7bc4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3132&q=80')`;
        setAttribution({
            photographer: "Chan Hoi",
            photographerUrl: "https://unsplash.com/@jokerhoi",
            imageUrl: "",
        });
    }
}
// Initialization
setTimeout(() => {
    const d = new Date();
    if (time) {
        time.classList.remove("opacity-0");
        if (!SCREENSHOT_MODE) {
            getUserHour((twelveHour) => (time.textContent = getTime(twelveHour)));
        }
        else {
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
        }
        else {
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
        getTopSiteValue().then((topSitesValue) => topSitesToggle(topSitesValue));
    }
}, 300);
if (!SCREENSHOT_MODE) {
    // Intervals
    // Time Interval
    setInterval(() => {
        if (time) {
            getUserHour((twelveHour) => {
                time.textContent = getTime(twelveHour);
            });
        }
        // 1000 ms = 1 second
    }, 1000);
    // Date Interval
    setInterval(() => {
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
            if (new Date().getTime() - new Date(lastUpdated).getTime() >=
                86400000) {
                if (container) {
                    saveNewBackgroundImage((dataUrl) => {
                        container.style.backgroundImage = `url('${dataUrl}')`;
                    });
                }
            }
        });
        // 3600000 ms = 1 hour
    }, 3600000);
}
// Time Mode Switcher Button, Settings Panel
if (hourModeSwitch &&
    topSitesSwitch &&
    topSitesCenterPositionSwitch &&
    newBackgroundButton &&
    newBackgroundButtonIcon) {
    // Initialization
    getUserHour((twelveHour) => (hourModeSwitch.checked = !twelveHour));
    if (topSitesContainer) {
        topSitesCenterPositionSwitch.checked =
            topSitesContainer.id === "topSitesCenter";
    }
    getTopSiteValue().then((topSitesValue) => (topSitesSwitch.checked = topSitesValue));
    // Event Listeners
    hourModeSwitch.addEventListener("click", () => getUserHour((twelveHour) => {
        browser.storage.local.set({
            hourStatus: twelveHour ? "24" : "12",
        });
        if (time) {
            time.textContent = getTime(!twelveHour);
        }
    }));
    topSitesSwitch.addEventListener("click", () => getTopSiteValue().then((topSitesValue) => {
        browser.storage.local.set({ topSites: !topSitesValue });
        topSitesToggle(!topSitesValue);
    }));
    topSitesCenterPositionSwitch.addEventListener("click", () => {
        toggleTopSiteContainer().then((newPosition) => (topSitesCenterPositionSwitch.checked =
            newPosition === "center" ? true : false));
        getTopSiteValue().then((topSitesValue) => {
            if (topSitesValue) {
                unloadTopSites();
                loadTopSites();
            }
        });
    });
    newBackgroundButton.addEventListener("click", () => {
        newBackgroundButtonIcon.classList.add("animate-spin");
        saveNewBackgroundImage((dataUrl) => {
            if (container) {
                container.style.backgroundImage = `url('${dataUrl}')`;
                newBackgroundButtonIcon.classList.remove("animate-spin");
            }
        });
    });
}
function getUserHour(callback) {
    const hourStatus = browser.storage.local.get("hourStatus");
    hourStatus.then((hourData) => {
        if (hourData.hourStatus) {
            callback(hourData.hourStatus === "12");
        }
        else {
            callback(true);
        }
    });
}
function getTopSiteContainer() {
    return __awaiter(this, void 0, void 0, function* () {
        const storageResponse = yield browser.storage.local.get("topSitesContainer");
        if (storageResponse.topSitesContainer !== "topLeft") {
            if (document.getElementById("topSitesCenter")) {
                topSitesContainer = document.getElementById("topSitesCenter");
            }
        }
        else {
            if (document.getElementById("topSitesTopLeft")) {
                topSitesContainer = document.getElementById("topSitesTopLeft");
            }
        }
    });
}
function toggleTopSiteContainer() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentPosition = (topSitesContainer === null || topSitesContainer === void 0 ? void 0 : topSitesContainer.id) === "topSitesCenter" ? "center" : "topLeft";
        let newPosition = "";
        if (currentPosition !== "topLeft") {
            newPosition = "topLeft";
        }
        else {
            newPosition = "center";
        }
        browser.storage.local.set({ topSitesContainer: newPosition });
        return newPosition;
    });
}
function getTopSiteValue() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getTopSiteContainer();
        const storageResponse = yield browser.storage.local.get("topSites");
        return storageResponse.topSites ? storageResponse.topSites === true : false;
    });
}
function topSitesToggle(topSitesValue) {
    if (topSitesValue) {
        unloadTopSites();
        loadTopSites();
    }
    else {
        unloadTopSites();
    }
}
function unloadTopSites() {
    const topSitesCenter = document.getElementById("topSitesCenter");
    const topSitesTopLeft = document.getElementById("topSitesTopLeft");
    if (topSitesCenter && topSitesCenter.innerHTML !== "") {
        topSitesCenter.textContent = "";
    }
    if (topSitesTopLeft && topSitesTopLeft.innerHTML !== "") {
        topSitesTopLeft.textContent = "";
    }
}
function loadTopSites() {
    if (topSitesContainer) {
        const linkClassNames = topSitesContainer.id === "topSitesCenter"
            ? "p-4 bg-black bg-opacity-75 rounded-lg"
            : "";
        const imgClassNames = topSitesContainer.id === "topSitesCenter" ? "w-8" : "w-6";
        const maxTopSites = topSitesContainer.id === "topSitesCenter" ? 20 : 5;
        // Firefox-based Browsers
        if (getBrowser() === Browsers.Gecko) {
            browser.topSites
                .get({
                includeFavicon: true,
                limit: maxTopSites,
            })
                .then((topSites) => {
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
        }
        else {
            browser.topSites.get().then((topSites) => {
                topSites.slice(0, maxTopSites).forEach((site) => {
                    const a = document.createElement("a");
                    a.href = site.url;
                    a.title = site.title || "";
                    a.target = "_blank";
                    a.className = linkClassNames;
                    const img = document.createElement("img");
                    img.className = imgClassNames;
                    getFavicon(new URL(site.url).host, (dataUrl) => (img.src = dataUrl));
                    a.appendChild(img);
                    if (topSitesContainer) {
                        topSitesContainer.appendChild(a);
                    }
                });
            });
        }
    }
}
function getFavicon(siteHost, callback) {
    browser.storage.local.get("topSitesFavicons").then((storageResponse) => {
        if (storageResponse.topSitesFavicons &&
            Object.keys(storageResponse.topSitesFavicons).indexOf(siteHost) !== -1) {
            callback(storageResponse.topSitesFavicons[`${siteHost}`]);
        }
        else {
            toDataURL(`https://api.faviconkit.com/${siteHost}`)
                .then((dataUrl) => {
                browser.storage.local.set({
                    topSitesFavicons: Object.assign(Object.assign({}, storageResponse.topSitesFavicons), { [siteHost]: dataUrl }),
                });
                callback(dataUrl);
            })
                .catch(() => callback("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-globe'%3e%3ccircle cx='12' cy='12' r='10'%3e%3c/circle%3e%3cline x1='2' y1='12' x2='22' y2='12'%3e%3c/line%3e%3cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3e%3c/path%3e%3c/svg%3e"));
        }
    }, () => toDataURL(`https://api.faviconkit.com/${siteHost}`)
        .then((dataUrl) => {
        browser.storage.local.set({
            topSitesFavicons: { [siteHost]: dataUrl },
        });
        callback(dataUrl);
    })
        .catch(() => callback("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-globe'%3e%3ccircle cx='12' cy='12' r='10'%3e%3c/circle%3e%3cline x1='2' y1='12' x2='22' y2='12'%3e%3c/line%3e%3cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3e%3c/path%3e%3c/svg%3e")));
}
function getTime(twelveHourTime) {
    const d = new Date();
    if (twelveHourTime) {
        return d.toLocaleString("en-us", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    }
    else {
        return (d.getHours().toString() + ":" + padNumber(d.getMinutes().toString()));
    }
}
function saveNewBackgroundImage(callback = null) {
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
function toDataURL(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let blob = yield fetch(imageUrl).then((r) => r.blob());
        let dataUrl = yield new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        return dataUrl;
    });
}
function setAttribution(unsplashResponse) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function padNumber(number) {
    return Number(number < 10)
        ? "0" + Number(number).toString()
        : Number(number).toString();
}
function getUnsplashImage() {
    return __awaiter(this, void 0, void 0, function* () {
        const randomImage = yield fetch(`${proxyUrl}/random?collections=935518`);
        const randomImageJson = yield randomImage.json();
        const encodedUrl = encodeURIComponent(randomImageJson.links.download_location);
        const downloadUrl = yield fetch(`${proxyUrl}/download?downloadUrl=${encodedUrl}`);
        const downloadUrlJson = yield downloadUrl.json();
        const imageUrl = downloadUrlJson.url;
        return {
            photographer: randomImageJson.user.name,
            photographerUrl: randomImageJson.user.links.html,
            imageUrl,
        };
    });
}
function getBrowser() {
    // @ts-ignore
    const browserPrefix = Object.values(window.getComputedStyle(document.documentElement, ""))
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
