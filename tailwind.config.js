const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    mode: "jit",
    purge: ["./template.html", "./index.ts", "./newtab.css"],
    darkMode: "media",
    theme: {
        fontFamily: {
            sans: ["Quicksand", ...defaultTheme.fontFamily.sans],
            serif: [...defaultTheme.fontFamily.serif],
            mono: [...defaultTheme.fontFamily.mono],
        },
    },
};
