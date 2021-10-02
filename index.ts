const container = document.getElementById("content");
const time = document.getElementById("time");
const date = document.getElementById("date");

if (container) {
    // container.style.backgroundImage = `url('https://source.unsplash.com/${window.screen.width}x${window.screen.height}/?space')`;
    container.style.backgroundImage = `url('https://source.unsplash.com/collection/935518/${window.screen.width}x${window.screen.height}')`;
}

function padNumber(number: number | string): string {
    return Number(number < 10)
        ? "0" + Number(number).toString()
        : Number(number).toString();
}

setTimeout(() => {
    const d = new Date();

    if (time) {
        time.classList.remove("opacity-0");
        time.textContent =
            padNumber(d.getHours().toString()) +
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
}, 700);

setInterval((): void => {
    if (time) {
        const d = new Date();
        time.textContent =
            padNumber(d.getHours().toString()) +
            ":" +
            padNumber(d.getMinutes().toString());
    }
    // 5000 ms = 5 second
}, 5000);

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

// Source: https://appcropolis.com/blog/web-technology/javascript-encode-images-dataurl/
function getImageDataURL(url: string, success: Function, error: Function) {
    var data, canvas, ctx;
    var img = new Image();
    img.onload = function () {
        // Create the canvas element.
        canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        // Get '2d' context and draw the image.
        ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(img, 0, 0);

            // Get canvas data URL
            try {
                data = canvas.toDataURL();
                success({ image: img, data: data });
            } catch (e) {
                error(e);
            }
        }
    };

    // Load image URL
    try {
        img.src = url;
    } catch (e) {
        error(e);
    }
}
