const fs = require("fs");
const path = require("path");
const articlesPath = path.join(__dirname, "..", "backend", "data", "articles.json");

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
let articles = [];

if (fs.existsSync(articlesPath)) {
  articles = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
}


const articleUrls = articles.map((article) => `
<url>
  <loc>${BASE_URL}/articole/${article.slug}</loc>
  <priority>0.7</priority>
</url>
`).join("");

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
${articleUrls}
</urlset>`;

fs.writeFileSync(
  path.join(__dirname, "public", "sitemap.xml"),
  sitemap
);

console.log("Sitemap generated!");