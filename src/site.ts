// biome-ignore lint/style/useImportType: not necessary
import { PulseStats, fallback, link, main, top } from "./card.js";
import data from "./stats.json";

// @ts-nocheck

export type Year = {
  from: string;
  to: string;
  days: number[];
};

/** Cloudflare KV namespace binding for visitor count (optional). */
interface Env {
  VISITOR_KV?: { get: (k: string) => Promise<string | null>; put: (k: string, v: string, opts?: { expirationTtl?: number }) => Promise<void> };
}

const VISITOR_KV_KEY = "profile_views";
const MAX_YEARS = 3;

async function getAndIncrementVisitors(kv: Env["VISITOR_KV"]): Promise<number> {
  if (!kv) return 0;
  try {
    const raw = await kv.get(VISITOR_KV_KEY);
    const count = Math.max(0, Number(raw ?? "0")) + 1;
    await kv.put(VISITOR_KV_KEY, String(count), { expirationTtl: 60 * 60 * 24 * 365 * 10 }); // 10 years
    return count;
  } catch {
    return 0;
  }
}

const site: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    const theme = (searchParams.get("theme") ?? "light") as "light" | "dark";
    const section = searchParams.get("section") ?? "";
    let content = ":-)";

    if (section === "top") {
      const { contributions } = data;
      const visitorCount = await getAndIncrementVisitors(env.VISITOR_KV);
      content = top({ height: 20, contributions, theme, visitorCount });
    } else if (section === "link-resume") {
      const index = Number(searchParams.get("i")) ?? 0;
      content = link({ height: 18, width: 100, index, theme })("Resume");
    } else if (section === "link-website") {
      const index = Number(searchParams.get("i")) ?? 0;
      content = link({ height: 18, width: 100, index, theme })("Website");
    } else if (section === "link-linkedin") {
      const index = Number(searchParams.get("i")) ?? 0;
      content = link({ height: 18, width: 100, index, theme })("LinkedIn");
    } else if (section === "link-facebook") {
      const index = Number(searchParams.get("i")) ?? 0;
      content = link({ height: 18, width: 100, index, theme })("Facebook");
    } else if (section === "link-instagram") {
      const index = Number(searchParams.get("i")) ?? 0;
      content = link({ height: 20, width: 100, index, theme })("Instagram");
    } else if (section === "link-twitter") {
      const index = Number(searchParams.get("i")) ?? 0;
      content = link({ height: 18, width: 100, index, theme })("Twitter");
    } else if (section === "fallback") {
      content = fallback({ height: 180, width: 420, theme });
    } else {
      const years = data.years.slice(0, MAX_YEARS);
      const location = {
        city: (request.cf?.city || "") as string,
        country: (request.cf?.country || "") as string,
      };
      const options = {
        dots: {
          rows: 6,
          size: 24,
          gap: 5,
        },
        year: {
          gap: 5,
        },
      };

      // Used to give the containing div `contain: strict` for perforamnce reasons.
      const sizes = years.map((year) => {
        const columns = Math.ceil(year.days.length / options.dots.rows);
        const width =
          columns * options.dots.size + (columns - 1) * options.dots.gap;
        const height =
          options.dots.rows * options.dots.size +
          (options.dots.rows - 1) * options.dots.gap;
        return [width, height];
      });

      // Calculate total length based on the width of the columns and the year gap
      const length =
        sizes.reduce((acc, size) => {
          // @ts-ignore
          acc += size[0] + options.year.gap;
          return acc;
        }, 0) - options.year.gap;

      content = main({
        height: 310,
        years,
        sizes,
        length,
        location,
        theme,
        ...options,
      });
    }

    return new Response(content, {
      headers: {
        "content-type": "image/svg+xml",
        "cache-control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        pragma: "no-cache",
        expires: "0",
      },
    });
  },
};

export default site;
