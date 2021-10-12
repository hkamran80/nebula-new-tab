const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    mode: "jit",
    purge: ["./docs/*.{html,css}"],
    theme: {
        fontFamily: {
            sans: ["Quicksand", ...defaultTheme.fontFamily.sans],
        },
    },
};
