import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ─── English ──────────────────────────────────────────────────────────────────
import enAuth from "@/locales/en/auth.json";
import enNav from "@/locales/en/nav.json";
import enSettings from "@/locales/en/settings.json";
import enProfile from "@/locales/en/profile.json";
import enReleases from "@/locales/en/releases.json";
import enNews from "@/locales/en/news.json";
import enWebstore from "@/locales/en/webstore.json";
import enAdmin from "@/locales/en/admin.json";
import enCommon from "@/locales/en/common.json";
import enDebug from "@/locales/en/debug.json";

// ─── Hungarian ────────────────────────────────────────────────────────────────
import huAuth from "@/locales/hu/auth.json";
import huNav from "@/locales/hu/nav.json";
import huSettings from "@/locales/hu/settings.json";
import huProfile from "@/locales/hu/profile.json";
import huReleases from "@/locales/hu/releases.json";
import huNews from "@/locales/hu/news.json";
import huWebstore from "@/locales/hu/webstore.json";
import huAdmin from "@/locales/hu/admin.json";
import huCommon from "@/locales/hu/common.json";
import huDebug from "@/locales/hu/debug.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      auth: enAuth,
      nav: enNav,
      settings: enSettings,
      profile: enProfile,
      releases: enReleases,
      news: enNews,
      webstore: enWebstore,
      admin: enAdmin,
      common: enCommon,
      debug: enDebug,
    },
    hu: {
      auth: huAuth,
      nav: huNav,
      settings: huSettings,
      profile: huProfile,
      releases: huReleases,
      news: huNews,
      webstore: huWebstore,
      admin: huAdmin,
      common: huCommon,
      debug: huDebug,
    },
  },
  lng: "en", // overridden at startup from localStorage via SettingsContext
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
