import { writeFile, mkdir } from "node:fs/promises";
import { fallback, link, main, top } from "../src/card.js";
import data from "../src/stats.json";

const MAX_YEARS = 3;

async function generateSVGs() {
  // Create assets directory
  await mkdir("assets", { recursive: true });

  // Generate main contribution graph (light theme)
  const years = data.years.slice(0, MAX_YEARS);
  const options = {
    dots: { rows: 6, size: 24, gap: 5 },
    year: { gap: 5 },
  };

  const sizes = years.map((year) => {
    const columns = Math.ceil(year.days.length / options.dots.rows);
    const width = columns * options.dots.size + (columns - 1) * options.dots.gap;
    const height = options.dots.rows * options.dots.size + (options.dots.rows - 1) * options.dots.gap;
    return [width, height];
  });

  const length = sizes.reduce((acc, size) => acc + size[0] + options.year.gap, 0) - options.year.gap;

  // Main graph - light theme
  const mainLight = main({
    height: 310,
    years,
    sizes,
    length,
    location: { city: "Davao", country: "Philippines" },
    contributions: data.contributions,
    theme: "light",
    ...options,
  });
  await writeFile("assets/contribution-graph-light.svg", mainLight);

  // Main graph - dark theme
  const mainDark = main({
    height: 310,
    years,
    sizes,
    length,
    location: { city: "Davao", country: "Philippines" },
    contributions: data.contributions,
    theme: "dark",
    ...options,
  });
  await writeFile("assets/contribution-graph-dark.svg", mainDark);


  console.log(" SVG files generated in assets/");
}

generateSVGs();
