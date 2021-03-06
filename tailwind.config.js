const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    mode: "jit",
    purge: {
        content: ["./src/*.{html,css,ts}"],
        safeList: [
            "grid-cols-1",
            "grid-cols-2",
            "grid-cols-3",
            "grid-cols-4",
            "grid-cols-5",
            "grid-cols-6",
        ],
    },
    theme: {
        fontFamily: {
            sans: ["Quicksand", ...defaultTheme.fontFamily.sans],
        },
    },
};
