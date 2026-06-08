import { SITE_URL } from "../lib/seo/metadata";

type RobotsConfig = {
  rules: {
    userAgent: string;
    allow: string;
    disallow: string[];
  };
  sitemap: string;
};

export default function robots(): RobotsConfig {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/login.php"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
