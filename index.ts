const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");
const newBackgroundButton = document.getElementById("new-background-button");
const timeModeSwitchButton = document.getElementById("time-mode-button");

// Installation Events
browser.runtime.onInstalled.addListener(async () => {
    browser.storage.local.set({
        hourStatus: "12",
    });

    await browser.tabs.create({ url: browser.runtime.getURL("index.html") });
});

// Background Image Initialization
if (container) {
    const lastUpdated = browser.storage.local.get("lastUpdated");
    lastUpdated.then(
        ({ lastUpdated }) => {
            if (
                new Date().getTime() - new Date(lastUpdated).getTime() >=
                86400000
            ) {
                saveNewBackgroundImage();
            }

            const backgroundImage =
                browser.storage.local.get("backgroundImage");
            backgroundImage.then(
                (imageData: any) => {
                    if (imageData.backgroundImage) {
                        container.style.backgroundImage = `url('${imageData.backgroundImage}')`;
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

    if (newBackgroundButton) {
        newBackgroundButton.classList.remove("opacity-0");
    }

    if (timeModeSwitchButton) {
        timeModeSwitchButton.classList.remove("opacity-0");
    }
}, 300);

// Intervals
// Time Interval
setInterval((): void => {
    if (time) {
        getUserHour(
            (twelveHour: boolean) => (time.textContent = getTime(twelveHour))
        );
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

// New Background Button
if (newBackgroundButton) {
    newBackgroundButton.addEventListener("click", () => {
        newBackgroundButton.classList.add("animate-spin");

        saveNewBackgroundImage((dataUrl: string) => {
            if (container) {
                container.style.backgroundImage = `url('${dataUrl}')`;
                newBackgroundButton.classList.remove("animate-spin");
            }
        });
    });
}

// Time Mode Switcher Button
if (timeModeSwitchButton) {
    timeModeSwitchButton.addEventListener("click", () => {
        getUserHour((twelveHour: boolean) => {
            browser.storage.local.set({ hourStatus: twelveHour ? "24" : "12" });

            if (time) {
                time.textContent = getTime(!twelveHour);
            }
        });
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

function saveNewBackgroundImage(callback = null as Function | null): void {
    const d = new Date();
    toDataURL(
        `https://source.unsplash.com/collection/935518/${window.screen.width}x${
            window.screen.height
        }?q=${d.getTime()}`,
        (dataUrl: string) => {
            browser.storage.local.set({
                backgroundImage: dataUrl,
                lastUpdated: d.toISOString(),
            });

            if (callback) {
                callback(dataUrl);
            }
        }
    );
}

function toDataURL(
    src: string,
    callback: Function,
    outputFormat = "image/png"
) {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var dataURL;

        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;

        if (ctx) {
            ctx.drawImage(img, 0, 0);

            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
        }
    };

    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src =
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}

function padNumber(number: number | string): string {
    return Number(number < 10)
        ? "0" + Number(number).toString()
        : Number(number).toString();
}
