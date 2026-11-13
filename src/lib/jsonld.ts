import { SITE } from "./site";
import type { Station } from "./types";

export function radioStationJsonLd(s: Station) {
  return {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "@id": `${SITE.url}/station/${s.slug}#station`,
    mainEntityOfPage: `${SITE.url}/station/${s.slug}`,
    url: `${SITE.url}/station/${s.slug}`,
    name: s.name,
    description: `Listen to ${s.name} live online — free ${s.language} radio streaming 24/7 on ${SITE.name}.`,
    genre: [s.genre],
    image: s.favicon || `${SITE.url}/icon.svg`,
    areaServed: s.country || "India",
    inLanguage: s.language,
    potentialAction: {
      "@type": "ListenAction",
      target: `${SITE.url}/station/${s.slug}`,
    },
    ...(s.homepage ? { sameAs: [s.homepage] } : {}),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
