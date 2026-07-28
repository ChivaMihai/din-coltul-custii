const fs = require("fs");
const path = require("path");

const BASE_URL = "https://din-coltul-custii.vercel.app";

const pages = [
  "",
  "despre",
  "articole",
  "competitii",
  "antrenamente",
  "mentalitate",
  "echipament",
  "contact",
];

const urls = pages
  .map(
    (page) => `
  <url>
    <loc>${BASE_URL}/${page}</loc>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

fs.writeFileSync(
  path.join(__dirname, "public", "sitemap.xml"),
  sitemap
);

console.log("Sitemap generated!");