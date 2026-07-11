(function (global) {
  "use strict";

  const STORAGE_KEY = "df-lang";
  const DEFAULT_LANG = "es";
  const SUPPORTED = { es: true, en: true };

  const META = {
    es: {
      title: "DeepFlow | Research de acciones con evidencia auditable",
      description:
        "Convertí un ticker en un memo de inversión con fuentes, valuación y trazabilidad. Conocé cómo DeepFlow organiza research de acciones de Estados Unidos.",
      ogTitle: "DeepFlow | Research con evidencia auditable",
      ogDescription:
        "Fuentes, valuación y trazabilidad en un paquete de research que podés revisar.",
    },
    en: {
      title: "DeepFlow | Equity research with auditable evidence",
      description:
        "Turn a ticker into an investment memo with sources, valuation, and traceability. See how DeepFlow organizes US equity research.",
      ogTitle: "DeepFlow | Research with auditable evidence",
      ogDescription:
        "Sources, valuation, and traceability in one research package you can review.",
    },
  };

  const TEXT = {
    es: {
      skipLink: "Saltar al contenido",
      "nav.aria": "Navegación principal",
      "nav.product": "Producto",
      "nav.process": "Cómo funciona",
      "nav.sample": "Muestra",
      "nav.roadmap": "Roadmap",
      "nav.contact": "Pedir muestra",
      "nav.menuOpen": "Abrir menú",
      "nav.menuClose": "Cerrar menú",
      "language.toggleAria": "Cambiar idioma",
      "theme.toDark": "Cambiar a tema oscuro",
      "theme.toLight": "Cambiar a tema claro",

      "hero.eyebrow": "Research con evidencia",
      "hero.title": "De un ticker a una <em>tesis defendible.</em>",
      "hero.sub":
        "DeepFlow reúne fuentes, valida datos y entrega un memo auditable. La decisión sigue siendo humana.",
      "hero.ctaPrimary": "Ver la muestra",
      "hero.ctaSecondary": "Cómo funciona",
      "hero.briefAria": "Pila ilustrativa de tesis de muestra sobre MELI",
      "hero.briefEyebrow": "DeepFlow / MELI",
      "hero.briefStatus": "Muestra visual",
      "hero.briefInputLabel": "Ticker",
      "hero.briefInput": "MELI",
      "hero.thesisBackLabel": "MELI · tesis de muestra",
      "hero.thesisBackTitle": "MELI",
      "hero.thesisBackExcerpt": "Fragmento visual. No representa research publicado.",
      "hero.thesisMiddleLabel": "MELI · notas de cobertura",
      "hero.thesisMiddleTitle": "MELI",
      "hero.thesisMiddleExcerpt": "Documento de trabajo para mostrar la estructura.",
      "hero.briefSourcesLabel": "Fuentes",
      "hero.briefSources": "Filing · transcript · mercado · contexto",
      "hero.briefChecksLabel": "Controles",
      "hero.briefChecks": "Origen · vigencia · consistencia",
      "hero.briefOutputLabel": "Salida",
      "hero.briefOutput": "Resumen · modelo · evidencia",
      "hero.briefNoteLabel": "Nota de análisis",
      "hero.briefNote": "Una tesis útil no oculta la duda. Muestra qué dato podría romperla.",
      "hero.briefTrail": "evidencia → revisión → decisión",
      "hero.mediaCaption": "Tres capas de una tesis de muestra. No es research publicado.",
      "sources.aria": "Preguntas de revisión",
      "sources.question1": "¿Qué tiene que ser cierto?",
      "sources.question2": "¿Qué evidencia falta?",
      "sources.question3": "¿Qué podría romper la tesis?",
      "sources.question4": "¿Qué supuesto mueve más el modelo?",

      "product.title": "Toda la investigación, en un paquete revisable.",
      "product.sub":
        "El output conserva el dato, su origen, los supuestos y los límites que condicionan la tesis.",
      "product.packageLabel": "Paquete de publicación",
      "product.packageTitle": "Tres lecturas. Una misma evidencia.",
      "product.packageBody":
        "Resumen para decidir qué revisar, memo para discutir y tesis completa para auditar.",
      "product.documentsAria": "Documentos de una publicación",
      "product.document1": "Resumen",
      "product.document2": "Memo",
      "product.document3": "Tesis completa",
      "product.lineageLabel": "Linaje de datos",
      "product.lineageTitle": "Cada afirmación vuelve a su fuente.",
      "product.lineage1": "filing / dato / contexto",
      "product.lineage2": "fuente / fecha / calidad",
      "product.lineage3": "supuesto / impacto / límite",
      "product.gatesLabel": "Control de publicación",
      "product.gatesTitle": "Lo débil no se disfraza de certeza.",
      "product.gatesBody":
        "Los controles separan paquetes completos, parciales y bloqueados antes de publicar.",
      "product.state1": "Completo",
      "product.state2": "Parcial",
      "product.state3": "Bloqueado",
      "product.humanLabel": "Decisión separada",
      "product.humanTitle": "DeepFlow organiza la evidencia. Vos decidís qué hacer con ella.",
      "product.humanBody":
        "El sistema no ejecuta órdenes ni reemplaza una revisión profesional independiente.",
      "product.boundaryAria": "La evidencia pasa por revisión antes de una decisión humana",
      "product.boundary1": "Evidencia",
      "product.boundary2": "Revisión",
      "product.boundary3": "Decisión humana",

      "manifesto.title":
        "DeepFlow no reemplaza el criterio. Ordena la evidencia para revisar supuestos, detectar límites y discutir una tesis antes de mover capital.",
      "manifesto.accent": "Ordena la evidencia",
      "manifesto.term1": "Revisable",
      "manifesto.body1": "Podés abrir el dato y seguir su origen.",
      "manifesto.term2": "Reproducible",
      "manifesto.body2": "El mismo paquete conserva reglas y supuestos.",
      "manifesto.term3": "Discutible",
      "manifesto.body3": "La tesis expone riesgos, límites y desacuerdos.",

      "process.title": "Tres movimientos. Seis controles visibles.",
      "process.sub":
        "Cada etapa deja dos marcas: qué entró y qué pasó la revisión.",
      "process.checkpointsAria": "Seis controles del proceso",
      "process.checkpoint1": "Fuentes",
      "process.checkpoint2": "Contexto",
      "process.checkpoint3": "Origen",
      "process.checkpoint4": "Consistencia",
      "process.checkpoint5": "Memo",
      "process.checkpoint6": "Revisión humana",
      "process.gatherTitle": "Reúne",
      "process.gatherBody":
        "Junta filings, datos de mercado, transcripciones, noticias y contexto comparable.",
      "process.gatherMeta": "entrada con origen identificado",
      "process.gatherCheck1": "Fuentes primarias",
      "process.gatherCheck2": "Contexto",
      "process.verifyTitle": "Verifica",
      "process.verifyBody":
        "Normaliza el paquete, contrasta consistencia y bloquea conclusiones que no se sostienen.",
      "process.verifyMeta": "calidad antes de narrativa",
      "process.verifyCheck1": "Origen",
      "process.verifyCheck2": "Consistencia",
      "process.deliverTitle": "Entrega",
      "process.deliverBody":
        "Publica una tesis, un modelo y un apéndice de fuentes listos para revisión humana.",
      "process.deliverMeta": "memo, modelo y evidencia",
      "process.deliverCheck1": "Memo",
      "process.deliverCheck2": "Revisión humana",

      "sample.eyebrow": "La muestra",
      "sample.title": "Abrí el output, no una promesa.",
      "sample.sub":
        "La muestra enseña qué entrega el sistema sin inventar rendimientos, precios ni testimonios.",
      "sample.packageAria": "Anatomía del paquete de publicación",
      "sample.packageType": "Paquete de research",
      "sample.inputLabel": "Ticker",
      "sample.inputValue": "MELI",
      "sample.document1": "Resumen",
      "sample.document2": "Memo",
      "sample.document3": "Tesis completa",
      "sample.packageNote": "Cada documento apunta al mismo paquete de evidencia.",
      "sample.tabsAria": "Capas del output",
      "sample.tab1": "Resumen",
      "sample.tab2": "Modelo",
      "sample.tab3": "Evidencia",
      "sample.panel1Title": "La tesis en lenguaje de comité.",
      "sample.panel1Body":
        "Resume la oportunidad, el caso contrario, los catalizadores y los riesgos que merecen revisión.",
      "sample.panel2Title": "Supuestos que se pueden cuestionar.",
      "sample.panel2Body":
        "La valuación separa entradas, escenarios y sensibilidad para evitar una cifra sin contexto.",
      "sample.panel3Title": "Fuentes y límites en el mismo lugar.",
      "sample.panel3Body":
        "El apéndice conserva origen, fecha y calidad, además de los huecos que el análisis no pudo resolver.",
      "sample.summary.thesis": "Tesis",
      "sample.summary.thesisBody": "Lo que tiene que ser cierto.",
      "sample.summary.countercase": "Contracaso",
      "sample.summary.countercaseBody": "La mejor explicación alternativa.",
      "sample.summary.review": "Próxima revisión",
      "sample.summary.reviewBody": "El dato que podría cambiar el caso.",
      "sample.model.base": "Caso base",
      "sample.model.baseBody": "Supuestos centrales y por qué importan.",
      "sample.model.sensitivity": "Sensibilidad",
      "sample.model.sensitivityBody": "Variables que más mueven el resultado.",
      "sample.model.limit": "Límite",
      "sample.model.limitBody": "Lo que el modelo todavía no captura.",
      "sample.evidence.origin": "Origen",
      "sample.evidence.originBody": "Dónde nació cada afirmación.",
      "sample.evidence.freshness": "Vigencia",
      "sample.evidence.freshnessBody": "Cuándo fue verificada.",
      "sample.evidence.gap": "Hueco",
      "sample.evidence.gapBody": "Qué todavía no sabemos.",
      "sample.previous": "Anterior",
      "sample.next": "Siguiente",

      "roadmap.title": "Lo próximo queda detrás de los mismos controles.",
      "roadmap.sub":
        "El roadmap amplía el análisis sin convertir DeepFlow en un broker ni prometer ejecución automática.",
      "roadmap.item1Title": "Portfolio por riesgo",
      "roadmap.item1Body":
        "Propuestas de pesos con horizonte, liquidez y restricciones visibles.",
      "roadmap.item1Guard": "Sin órdenes de trading",
      "roadmap.item2Title": "Seguimiento de tesis",
      "roadmap.item2Body":
        "Seguimiento de tesis, precios, drift y señales para volver a investigar.",
      "roadmap.item2Guard": "Research fresco primero",
      "roadmap.item3Title": "Comité IA",
      "roadmap.item3Body":
        "Debate multiagente, disenso registrado y una revisión común antes de decidir.",
      "roadmap.item3Guard": "La decisión sigue separada",
      "roadmap.item4Title": "Ejecución con controles",
      "roadmap.item4Body":
        "Una frontera futura que exige evidencia histórica, controles y aprobación explícita.",
      "roadmap.item4Guard": "Bloqueado por defecto",

      "contact.title": "Elegí un ticker. Te mostramos el proceso.",
      "contact.sub":
        "Pedí una muestra o proponé una empresa. La respuesta será research, no asesoramiento personalizado.",
      "contact.note":
        "DeepFlow no ejecuta operaciones ni reemplaza una revisión profesional independiente.",
      "contact.name": "Nombre",
      "contact.namePlaceholder": "Tu nombre",
      "contact.email": "Email",
      "contact.emailPlaceholder": "tu@email.com",
      "contact.message": "Ticker o pregunta",
      "contact.messagePlaceholder": "Quiero revisar una muestra sobre...",
      "contact.submit": "Pedir muestra",
      "contact.hint":
        'Se abrirá tu correo. Al enviar aceptás la <a href="legal.html#privacidad">política de privacidad</a>.',
      "contact.invalid": "Revisá los campos marcados.",
      "contact.opening": "Abriendo tu correo...",
      "contact.mailSubject": "DeepFlow | muestra para ",

      "footer.note": "Research auditable. Decisión humana.",
      "footer.legal":
        '© 2026 Denario. No es asesoramiento financiero. <a href="legal.html">Términos, privacidad y legales</a>',
    },
    en: {
      skipLink: "Skip to content",
      "nav.aria": "Primary navigation",
      "nav.product": "Product",
      "nav.process": "How it works",
      "nav.sample": "Sample",
      "nav.roadmap": "Roadmap",
      "nav.contact": "Request a sample",
      "nav.menuOpen": "Open menu",
      "nav.menuClose": "Close menu",
      "language.toggleAria": "Change language",
      "theme.toDark": "Switch to dark theme",
      "theme.toLight": "Switch to light theme",

      "hero.eyebrow": "Evidence-led research",
      "hero.title": "From one ticker to a <em>defensible thesis.</em>",
      "hero.sub":
        "DeepFlow gathers sources, validates data, and delivers an auditable memo. The decision remains human.",
      "hero.ctaPrimary": "View the sample",
      "hero.ctaSecondary": "How it works",
      "hero.briefAria": "Illustrative stack of sample theses about MELI",
      "hero.briefEyebrow": "DeepFlow / MELI",
      "hero.briefStatus": "Visual sample",
      "hero.briefInputLabel": "Ticker",
      "hero.briefInput": "MELI",
      "hero.thesisBackLabel": "MELI · sample thesis",
      "hero.thesisBackTitle": "MELI",
      "hero.thesisBackExcerpt": "Visual fragment. It does not represent published research.",
      "hero.thesisMiddleLabel": "MELI · coverage notes",
      "hero.thesisMiddleTitle": "MELI",
      "hero.thesisMiddleExcerpt": "Working document used to show the structure.",
      "hero.briefSourcesLabel": "Sources",
      "hero.briefSources": "Filing · transcript · market · context",
      "hero.briefChecksLabel": "Checks",
      "hero.briefChecks": "Origin · freshness · consistency",
      "hero.briefOutputLabel": "Output",
      "hero.briefOutput": "Summary · model · evidence",
      "hero.briefNoteLabel": "Analyst note",
      "hero.briefNote": "A useful thesis does not hide uncertainty. It shows what could break it.",
      "hero.briefTrail": "evidence → review → decision",
      "hero.mediaCaption": "Three layers of a sample thesis. It is not published research.",
      "sources.aria": "Review questions",
      "sources.question1": "What needs to be true?",
      "sources.question2": "What evidence is missing?",
      "sources.question3": "What could break the thesis?",
      "sources.question4": "Which assumption moves the model most?",

      "product.title": "The full investigation in one reviewable package.",
      "product.sub":
        "The output preserves the data, its origin, the assumptions, and the limits shaping the thesis.",
      "product.packageLabel": "Publication package",
      "product.packageTitle": "Three readings. The same evidence.",
      "product.packageBody":
        "A summary to choose what to review, a memo to discuss, and a full thesis to audit.",
      "product.documentsAria": "Publication documents",
      "product.document1": "Summary",
      "product.document2": "Memo",
      "product.document3": "Full thesis",
      "product.lineageLabel": "Data lineage",
      "product.lineageTitle": "Every claim returns to its source.",
      "product.lineage1": "filing / data / context",
      "product.lineage2": "source / date / quality",
      "product.lineage3": "assumption / impact / limit",
      "product.gatesLabel": "Publication control",
      "product.gatesTitle": "Weak evidence is not dressed up as certainty.",
      "product.gatesBody":
        "Controls separate complete, partial, and blocked packages before publication.",
      "product.state1": "Complete",
      "product.state2": "Partial",
      "product.state3": "Blocked",
      "product.humanLabel": "Separate decision",
      "product.humanTitle": "DeepFlow organizes the evidence. You decide what to do with it.",
      "product.humanBody":
        "The system does not execute orders or replace independent professional review.",
      "product.boundaryAria": "Evidence passes through review before a human decision",
      "product.boundary1": "Evidence",
      "product.boundary2": "Review",
      "product.boundary3": "Human decision",

      "manifesto.title":
        "DeepFlow does not replace judgment. It organizes evidence so you can review assumptions, find limits, and debate a thesis before moving capital.",
      "manifesto.accent": "It organizes evidence",
      "manifesto.term1": "Reviewable",
      "manifesto.body1": "Open the data and follow it back to its origin.",
      "manifesto.term2": "Reproducible",
      "manifesto.body2": "The same package preserves rules and assumptions.",
      "manifesto.term3": "Debatable",
      "manifesto.body3": "The thesis exposes risks, limits, and disagreement.",

      "process.title": "Three moves. Six visible controls.",
      "process.sub":
        "Each stage leaves two marks: what entered and what passed review.",
      "process.checkpointsAria": "Six process controls",
      "process.checkpoint1": "Sources",
      "process.checkpoint2": "Context",
      "process.checkpoint3": "Origin",
      "process.checkpoint4": "Consistency",
      "process.checkpoint5": "Memo",
      "process.checkpoint6": "Human review",
      "process.gatherTitle": "Gather",
      "process.gatherBody":
        "Collect filings, market data, transcripts, news, and comparable context.",
      "process.gatherMeta": "input with identified origin",
      "process.gatherCheck1": "Primary sources",
      "process.gatherCheck2": "Context",
      "process.verifyTitle": "Verify",
      "process.verifyBody":
        "Normalize the package, check consistency, and block conclusions that do not hold up.",
      "process.verifyMeta": "quality before narrative",
      "process.verifyCheck1": "Origin",
      "process.verifyCheck2": "Consistency",
      "process.deliverTitle": "Deliver",
      "process.deliverBody":
        "Publish a thesis, a model, and a source appendix ready for human review.",
      "process.deliverMeta": "memo, model, and evidence",
      "process.deliverCheck1": "Memo",
      "process.deliverCheck2": "Human review",

      "sample.eyebrow": "The sample",
      "sample.title": "Open the output, not a promise.",
      "sample.sub":
        "The sample shows what the system delivers without inventing returns, prices, or testimonials.",
      "sample.packageAria": "Publication package anatomy",
      "sample.packageType": "Research package",
      "sample.inputLabel": "Ticker",
      "sample.inputValue": "MELI",
      "sample.document1": "Summary",
      "sample.document2": "Memo",
      "sample.document3": "Full thesis",
      "sample.packageNote": "Every document points to the same evidence package.",
      "sample.tabsAria": "Output layers",
      "sample.tab1": "Summary",
      "sample.tab2": "Model",
      "sample.tab3": "Evidence",
      "sample.panel1Title": "The thesis in committee language.",
      "sample.panel1Body":
        "Summarize the opportunity, the opposing case, catalysts, and risks that deserve review.",
      "sample.panel2Title": "Assumptions that can be challenged.",
      "sample.panel2Body":
        "Valuation separates inputs, scenarios, and sensitivity to avoid a number without context.",
      "sample.panel3Title": "Sources and limits in the same place.",
      "sample.panel3Body":
        "The appendix preserves origin, date, and quality, plus the gaps the analysis could not resolve.",
      "sample.summary.thesis": "Thesis",
      "sample.summary.thesisBody": "What needs to be true.",
      "sample.summary.countercase": "Countercase",
      "sample.summary.countercaseBody": "The strongest alternative explanation.",
      "sample.summary.review": "Next review",
      "sample.summary.reviewBody": "The evidence that could change the case.",
      "sample.model.base": "Base case",
      "sample.model.baseBody": "Core assumptions and why they matter.",
      "sample.model.sensitivity": "Sensitivity",
      "sample.model.sensitivityBody": "Variables that move the outcome most.",
      "sample.model.limit": "Boundary",
      "sample.model.limitBody": "What the model does not yet capture.",
      "sample.evidence.origin": "Origin",
      "sample.evidence.originBody": "Where each claim began.",
      "sample.evidence.freshness": "Freshness",
      "sample.evidence.freshnessBody": "When it was last verified.",
      "sample.evidence.gap": "Gap",
      "sample.evidence.gapBody": "What we still do not know.",
      "sample.previous": "Previous",
      "sample.next": "Next",

      "roadmap.title": "What comes next stays behind the same controls.",
      "roadmap.sub":
        "The roadmap expands analysis without turning DeepFlow into a broker or promising automatic execution.",
      "roadmap.item1Title": "Risk-based portfolio",
      "roadmap.item1Body":
        "Proposed weights with horizon, liquidity, and restrictions made visible.",
      "roadmap.item1Guard": "No trading orders",
      "roadmap.item2Title": "Thesis tracking",
      "roadmap.item2Body":
        "Track theses, prices, drift, and signals that call for new research.",
      "roadmap.item2Guard": "Fresh research first",
      "roadmap.item3Title": "AI committee",
      "roadmap.item3Body":
        "Multi-agent debate, recorded dissent, and a shared review before a decision.",
      "roadmap.item3Guard": "The decision remains separate",
      "roadmap.item4Title": "Controlled execution",
      "roadmap.item4Body":
        "A future boundary requiring historical evidence, controls, and explicit approval.",
      "roadmap.item4Guard": "Blocked by default",

      "contact.title": "Choose a ticker. We will show you the process.",
      "contact.sub":
        "Request a sample or suggest a company. The response will be research, not personalized advice.",
      "contact.note":
        "DeepFlow does not execute trades or replace independent professional review.",
      "contact.name": "Name",
      "contact.namePlaceholder": "Your name",
      "contact.email": "Email",
      "contact.emailPlaceholder": "you@email.com",
      "contact.message": "Ticker or question",
      "contact.messagePlaceholder": "I want to review a sample about...",
      "contact.submit": "Request a sample",
      "contact.hint":
        'Your email app will open. By sending, you accept the <a href="legal.html#privacidad">privacy policy</a>.',
      "contact.invalid": "Review the marked fields.",
      "contact.opening": "Opening your email app...",
      "contact.mailSubject": "DeepFlow | sample for ",

      "footer.note": "Auditable research. Human decision.",
      "footer.legal":
        '© 2026 Denario. Not financial advice. <a href="legal.html">Terms, privacy, and legal</a>',
    },
  };

  function normalizeLanguage(lang) {
    const base = String(lang || "").toLowerCase().split(/[-_]/)[0];
    return SUPPORTED[base] ? base : DEFAULT_LANG;
  }

  function t(key, lang) {
    const code = normalizeLanguage(lang);
    return TEXT[code][key] || TEXT[DEFAULT_LANG][key] || key;
  }

  function currentLanguage() {
    const doc = global.document;
    if (!doc || !doc.documentElement) return DEFAULT_LANG;
    return normalizeLanguage(
      (doc.documentElement.getAttribute && doc.documentElement.getAttribute("lang")) ||
        doc.documentElement.lang,
    );
  }

  function setMeta(doc, selector, value) {
    if (!doc || !doc.querySelector) return;
    const element = doc.querySelector(selector);
    if (element && element.setAttribute) element.setAttribute("content", value);
  }

  function applyLandingLanguage(doc, lang) {
    const code = normalizeLanguage(lang);
    if (!doc) return code;

    if (doc.documentElement) {
      if (doc.documentElement.setAttribute) doc.documentElement.setAttribute("lang", code);
      else doc.documentElement.lang = code;
    }

    if (META[code]) {
      doc.title = META[code].title;
      setMeta(doc, 'meta[name="description"]', META[code].description);
      setMeta(doc, 'meta[property="og:title"]', META[code].ogTitle);
      setMeta(doc, 'meta[property="og:description"]', META[code].ogDescription);
    }

    if (!doc.querySelectorAll) return code;

    doc.querySelectorAll("[data-i18n]").forEach(function (element) {
      const key = element.getAttribute("data-i18n");
      if (key) element.textContent = t(key, code);
    });

    doc.querySelectorAll("[data-i18n-html]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-html");
      if (key) element.innerHTML = t(key, code);
    });

    doc.querySelectorAll("[data-i18n-attrs]").forEach(function (element) {
      const specification = element.getAttribute("data-i18n-attrs") || "";
      specification.split(";").forEach(function (pair) {
        const parts = pair.split(":");
        if (parts.length < 2) return;
        const attribute = parts.shift().trim();
        const key = parts.join(":").trim();
        if (attribute && key && element.setAttribute) {
          element.setAttribute(attribute, t(key, code));
        }
      });
    });

    doc.querySelectorAll("[data-lang-option]").forEach(function (element) {
      const active = normalizeLanguage(element.getAttribute("data-lang-option")) === code;
      if (element.setAttribute) element.setAttribute("aria-pressed", active ? "true" : "false");
      if (element.classList && element.classList.toggle) {
        element.classList.toggle("is-active", active);
      }
    });

    return code;
  }

  function readStoredLanguage(win) {
    try {
      return win.localStorage && win.localStorage.getItem(STORAGE_KEY);
    } catch (_error) {
      return null;
    }
  }

  function writeStoredLanguage(win, lang) {
    try {
      if (win.localStorage) win.localStorage.setItem(STORAGE_KEY, lang);
    } catch (_error) {
      // The selected language still applies for the current session.
    }
  }

  function initialLanguage(win) {
    if (!win) return DEFAULT_LANG;
    try {
      const fromUrl = new win.URLSearchParams(win.location ? win.location.search : "").get("lang");
      if (fromUrl) return normalizeLanguage(fromUrl);
    } catch (_error) {
      // Ignore unavailable or malformed URL state.
    }
    return normalizeLanguage(readStoredLanguage(win) || DEFAULT_LANG);
  }

  function dispatchLanguageChange(win, lang) {
    if (!win || !win.dispatchEvent || !win.CustomEvent) return;
    win.dispatchEvent(new win.CustomEvent("deepflow:languagechange", { detail: { lang: lang } }));
  }

  function initLandingLanguage(win, doc) {
    const lang = applyLandingLanguage(doc, initialLanguage(win));
    if (!doc || !doc.querySelectorAll) return lang;

    doc.querySelectorAll("[data-lang-option]").forEach(function (button) {
      if (!button.addEventListener) return;
      button.addEventListener("click", function () {
        const next = normalizeLanguage(button.getAttribute("data-lang-option"));
        writeStoredLanguage(win, next);
        applyLandingLanguage(doc, next);
        dispatchLanguageChange(win, next);
      });
    });

    return lang;
  }

  global.DeepFlowI18n = {
    applyLandingLanguage: applyLandingLanguage,
    currentLanguage: currentLanguage,
    initLandingLanguage: initLandingLanguage,
    normalizeLanguage: normalizeLanguage,
    t: t,
  };

  if (global.document) initLandingLanguage(global, global.document);
})(globalThis);
