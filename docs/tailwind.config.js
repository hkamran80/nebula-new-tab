const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    mode: "jit",
    purge: ["./src/*.{html}"],
    theme: {
        fontFamily: {
            sans: ["Quicksand", ...defaultTheme.fontFamily.sans],
        },
    },
};
