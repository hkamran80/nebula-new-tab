module.exports = {
    mode: "jit",
    purge: ["./template.html"],
    darkMode: "media",
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
