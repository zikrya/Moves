import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      sans: ["General Sans", "sans-serif"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
