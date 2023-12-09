/** @type {import('tailwindcss').Config} */
// export const primary_soft = "rgba(59,130,246,0.5)";
// export const primary_med = "rgba(59,130,246,0.5)";
// export const primary = "rgba(59,130,246,1)";
// export const secondary_soft = "rgba(99,102,241,0.1)";
// export const secondary = "rgba(99,102,241,1)";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadein: {
          "0%": {
            opacity: "0",
          },
          "25%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        spin: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
      },
      animation: {
        spin: "spin 0.8s infinite linear",
        fadein: "fadein 0.4s linear",
      },
      boxShadow: {
        shadow: "0px -1px 2px 0px rgba(255,255,255,0)",
        shadow_focus:
          "0px 0px 25px 5px rgba(59,130,246,0.2), 0px 0px 0px 2px rgba(59,130,246,0.3)",
        shadow_hover: "0px 0px 20px 5px rgba(59,130,246,0.2)",
      },
      colors: {
        primary: "rgba(59,130,246,1)",
        primary_transp: "rgba(59,130,246,0.4)",
        secondary: "rgba(99,102,241,1)",
        secondary_transp: "rgba(99,102,241,0.5)",

        bg_primary: "rgb(10,13,20)",
        // bg_primary: "rgb(0,0,0)",
        bg_primary_trans: "rgb(10,13,16,0.5)",
        bg_secondary: "rgb(25,30,30)",
        bg_secondary_trans: "rgb(255,255,255,0.1)",

        border_s: "rgb(255,255,255,0.06)",
        border_p: "rgb(255,255,255,0.2)",

        // purple: "#7e5bef",
        // pink: "#ff49db",
        // green: "#13ce66",
        // yellow: "#ffc82c",
        // "gray-dark": "#273444",
        // gray: "#8492a6",
        // "gray-light": "#d3dce6",
      },
    },
  },
  plugins: [],
};
