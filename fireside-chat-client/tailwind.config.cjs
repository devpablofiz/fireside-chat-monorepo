// tailwind.config.cjs
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Quicksand", "sans-serif"],
            },
        },
    },
    plugins: [
    ],
};
