const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    mode: "jit",
    purge: ["./*.{html,css}"],
    theme: {
        fontFamily: {
            sans: ["Quicksand", ...defaultTheme.fontFamily.sans],
        },
        extend: {
            colors: {
                "nebula-purple": {
                    light: "#320459",
                    DEFAULT: "#320459",
                    dark: "#1b181f",
                },
            },
        },
    },
    plugins: [require("tailwind-scrollbar")],
};
