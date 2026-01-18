// /assets/i18n.js
const I18N = (() => {
  const supported = ["de", "en"];
  const storageKey = "lang";
  let dict = {};
  let lang = "de";

  function getLang() {
    const saved = localStorage.getItem(storageKey);
    if (saved && supported.includes(saved)) return saved;

    const nav = (navigator.language || "de").toLowerCase();
    if (nav.startsWith("en")) return "en";
    return "de";
  }

  async function load(l) {
    lang = supported.includes(l) ? l : "de";
    const res = await fetch(`./i18n/${lang}.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Cannot load i18n/${lang}.json`);
    dict = await res.json();

    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem(storageKey, lang);

    apply();
  }

  function t(key) {
    // Unterstützt "a.b.c" Pfade
    return key.split(".").reduce((acc, part) => (acc && acc[part] != null ? acc[part] : null), dict);
  }

  function apply(root = document) {
    // Text
    root.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val == null) return;

      // Wenn du HTML brauchst: nutze data-i18n-html="key"
      el.textContent = String(val);
    });

    // Attribute (z.B. Placeholder, Title, Aria)
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
      // Format: data-i18n-attr="placeholder:forms.search.placeholder,title:nav.support"
      const spec = el.getAttribute("data-i18n-attr").split(",");
      for (const pair of spec) {
        const [attr, key] = pair.split(":").map(s => s.trim());
        const val = t(key);
        if (attr && val != null) el.setAttribute(attr, String(val));
      }
    });
  }

  function wireLanguageSwitch(root = document) {
    root.querySelectorAll("[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => load(btn.getAttribute("data-lang")));
    });
  }

  async function init() {
    wireLanguageSwitch();
    await load(getLang());
  }

  return { init, load, apply, t };
})();

document.addEventListener("DOMContentLoaded", () => {
  I18N.init().catch(console.error);
});
