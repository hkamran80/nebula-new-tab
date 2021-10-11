const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");
const photographer = document.getElementById(
    "photographer"
) as HTMLAnchorElement;
const attribution = document.getElementById("attribution");
const settingsButton = document.getElementById("settings-button");
const settingsPanelTemplate = document.getElementById(
    "settings-panel-template"
);
const hourModeSwitchSelector = ".hour-mode-switch";
const newBackgroundButtonSelector = ".new-background-button";
const newBackgroundButtonAnimationSelector = ".new-background-button--spin";

const proxyUrl = "https://nebula-unsplash-proxy.hkamran-workers.workers.dev";

// Background Image Initialization
if (container) {
    const lastUpdated = browser.storage.local.get("lastUpdated");
    lastUpdated.then(
        ({ lastUpdated }) => {
            // 12 hours
            if (
                new Date().getTime() - new Date(lastUpdated).getTime() >=
                43200000
            ) {
                saveNewBackgroundImage();
            }

            const backgroundImage = browser.storage.local.get({
                backgroundImage: "/assets/defaultBackground.jpg",
                photographerName: "Martin Adams",
                photographerUrl: "https://unsplash.com/@martinadams",
            });
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
            getUserHour((twelveHour: boolean) => {
                $(hourModeSwitchSelector).prop("checked", !twelveHour);
            });

            $(hourModeSwitchSelector)
                .off("click")
                .on("click", function () {
                    getUserHour((twelveHour: boolean) => {
                        browser.storage.local.set({
                            hourStatus: twelveHour ? "24" : "12",
                        });

                        if (time) {
                            time.textContent = getTime(!twelveHour);
                        }
                    });
                });

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

// Models
interface UnsplashResponse {
    photographer: string;
    photographerUrl: string;
    imageUrl: string;
}
