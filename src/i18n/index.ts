import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fa from "./locales/fa.json";

const SUPPORTED = ["en", "fa"] as const;
type SupportedLang = (typeof SUPPORTED)[number];

const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
const lng: SupportedLang = SUPPORTED.includes(deviceLang as SupportedLang)
  ? (deviceLang as SupportedLang)
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;
