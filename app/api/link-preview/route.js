import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pickMeta = (html, keys) => {
  for (const key of keys) {
    const propertyPattern = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
    const contentFirstPattern = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`, "i");
    const match = html.match(propertyPattern) || html.match(contentFirstPattern);
    if (match?.[1]) return decodeEntities(match[1].trim());
  }
  return "";
};

const pickTitle = (html) => {
  const metaTitle = pickMeta(html, ["og:title", "twitter:title"]);
  if (metaTitle) return metaTitle;
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  return title ? decodeEntities(title) : "";
};

const decodeEntities = (value = "") => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

const absoluteUrl = (value, baseUrl) => {
  if (!value) return "";
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
};

export async function GET(request) {
  const url = request.nextUrl.searchParams.get("url") || "";
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Unsupported URL" }, { status: 400 });
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ECCreativeStudioCRM/1.0; +https://eccreativestudios.com)",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ url: parsed.toString(), domain: parsed.hostname.replace(/^www\./, "") });
    }

    const html = await response.text();
    const image = absoluteUrl(pickMeta(html, ["og:image", "og:image:secure_url", "twitter:image"]), parsed.toString());
    const title = pickTitle(html);

    return NextResponse.json({
      url: parsed.toString(),
      domain: parsed.hostname.replace(/^www\./, ""),
      title,
      image,
    });
  } catch {
    return NextResponse.json({ url: parsed.toString(), domain: parsed.hostname.replace(/^www\./, "") });
  }
}
