const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");
const newBackgroundButton = document.getElementById("new-background-button");

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
        time.textContent =
            d.getHours().toString() +
            ":" +
            padNumber(d.getMinutes().toString());
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
}, 300);

// Intervals
// Time Interval
setInterval((): void => {
    if (time) {
        const d = new Date();
        time.textContent =
            d.getHours().toString() +
            ":" +
            padNumber(d.getMinutes().toString());
    }
    // 5000 ms = 5 seconds
}, 5000);

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
