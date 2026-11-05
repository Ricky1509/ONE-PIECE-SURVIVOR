// =====================================================================
//  Idiomas (es / en). El idioma se guarda en localStorage ('mdr_lang');
//  la primera vez se elige según el idioma del navegador.
//  t('texto en español', a, b…) devuelve la traducción y sustituye {0}, {1}…
// =====================================================================
(() => {
  let saved = null;
  try { saved = localStorage.getItem('mdr_lang'); } catch (e) {}
  const LANG = saved === 'es' || saved === 'en' ? saved : ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
  const EN = window.MDR_I18N_EN || { ui: {}, config: {} };
  const dict = LANG === 'en' ? EN.ui : {};

  window.MDR_LANG = LANG;
  window.t = (s, ...args) => {
    let r = dict[s] !== undefined ? dict[s] : s;
    args.forEach((v, i) => { r = r.split('{' + i + '}').join(v); });
    return r;
  };
  window.MDR_SET_LANG = lang => { try { localStorage.setItem('mdr_lang', lang); } catch (e) {} location.reload(); };

  // Traduce los campos de texto de la configuración (por id en listas y por clave en objetos)
  function merge(dst, src) {
    if (!dst || !src) return;
    for (const k of Object.keys(src)) {
      const sv = src[k], dv = dst[k];
      if (Array.isArray(dv) && sv && !Array.isArray(sv) && typeof sv === 'object') {
        for (const item of dv) if (item && item.id && sv[item.id]) merge(item, sv[item.id]);
      } else if (Array.isArray(sv) || typeof sv !== 'object' || sv === null) {
        dst[k] = sv;
      } else if (dv && typeof dv === 'object') merge(dv, sv);
    }
  }
  if (LANG === 'en' && window.MDR_CONFIG) merge(window.MDR_CONFIG, EN.config);

  // Textos fijos del HTML: nodos de texto, atributos y bloques con data-i18n-html
  function translateDom() {
    document.documentElement.lang = LANG;
    if (LANG === 'es') return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const raw = n.nodeValue, key = raw.trim();
      if (key && dict[key] !== undefined) n.nodeValue = raw.replace(key, dict[key]);
    }
    document.querySelectorAll('[aria-label],[title]').forEach(el => {
      for (const a of ['aria-label', 'title']) { const v = el.getAttribute(a); if (v && dict[v] !== undefined) el.setAttribute(a, dict[v]); }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { const k = el.getAttribute('data-i18n-html'); if (dict[k] !== undefined) el.innerHTML = dict[k]; });
    if (dict[document.title] !== undefined) document.title = dict[document.title];
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', translateDom); else translateDom();
})();
