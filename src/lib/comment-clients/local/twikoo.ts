// The build copies a narrowly patched official UMD bundle to this fixed,
// versioned same-origin path. The patch pins OwO and Cap to local resources.
export const scriptUrl = `${import.meta.env.BASE_URL}_astro/vendor/twikoo/2.0.8/twikoo.min.js`
