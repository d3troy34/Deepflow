(function (global) {
  "use strict";

  const STORAGE_KEY = "df-lang";
  const DEFAULT_LANG = "es";
  const SUPPORTED = { es: true, en: true };

  const META = {
    es: {
      title: "DeepFlow — Research institucional de acciones de EE.UU. en minutos",
      description:
        "DeepFlow es el motor de investigación de Denario: convierte un ticker en un paquete completo de research — datos verificados, modelo de valuación, memo de inversión y evidencia auditable — en menos de 10 minutos, por centavos de dólar.",
      ogTitle: "DeepFlow — el motor de research de Denario",
      ogDescription:
        "De un ticker a un memo de inversión completo, auditable y con fuentes. En menos de 10 minutos.",
    },
    en: {
      title: "DeepFlow — Institutional US equity research in minutes",
      description:
        "DeepFlow is Denario's research engine: it turns a ticker into a complete research package — verified data, valuation model, investment memo, and auditable evidence — in under 10 minutes, for cents per run.",
      ogTitle: "DeepFlow — Denario's research engine",
      ogDescription:
        "From one ticker to a complete, sourced, audit-ready investment memo in under 10 minutes.",
    },
  };

  const TEXT = {
    es: {
      "nav.product": "Producto",
      "nav.process": "Cómo funciona",
      "nav.sample": "Muestra",
      "nav.roadmap": "Roadmap",
      "nav.tracker": "Tracker →",
      "nav.contact": "Hablemos →",
      "nav.profileAria": "Ver perfil",
      "nav.profileTitle": "Ver perfil",
      "theme.generic": "Cambiar tema",
      "theme.toDark": "Cambiar a tema oscuro",
      "theme.toLight": "Cambiar a tema claro",
      "language.toggleAria": "Cambiar idioma",
      "hero.eyebrow": "Motor de research · US listed equities",
      "hero.title.line1": "Research de nivel",
      "hero.title.line2": "<em>institucional</em>,",
      "hero.title.line3": "en menos de",
      "hero.title.line4": "<em>10 minutos</em>",
      "hero.sub":
        "DeepFlow convierte un ticker en un paquete completo de research: datos verificados, modelo de valuación, memo de inversión y evidencia auditable. Por centavos de dólar.",
      "hero.cta.samples": "Ver muestras",
      "hero.cta.tracker": "Research Tracker →",
      "hero.cta.process": "Cómo funciona",
      "hero.consoleAria": "Simulación de un run de DeepFlow",
      "hero.consoleInitial": "inicializando run…",
      "hero.stat.timeNum": '&lt;<span data-count="10">10</span> min',
      "hero.stat.timeLabel": "por compañía analizada",
      "hero.stat.costNum": 'centavos <span class="stat__unit">USD</span>',
      "hero.stat.costLabel": "costo por run completo",
      "hero.stat.sourcesNum": '<span data-count="8">8</span>+ fuentes',
      "hero.stat.sourcesLabel": "de datos primarios, con timestamp",
      "hero.stat.auditNum": '<span data-count="100">100</span>%',
      "hero.stat.auditLabel": "trazable y auditable",
      "manifesto.eyebrow": "Qué es DeepFlow",
      "manifesto.title":
        "DeepFlow <em>no</em> es un bot de trading. No promete alpha mágico. Es una <em>línea de producción</em> de research: datos verificables, modelo reproducible, memo legible y controles estrictos antes de publicar. La decisión final siempre queda en <em>manos humanas</em>.",
      "manifesto.stackAria": "Artifacts que produce cada run",
      "manifesto.stack.memo": "memo de inversión completo",
      "manifesto.stack.model": "DCF · SOTP · price targets",
      "manifesto.stack.packet": "datos canónicos + lineage",
      "manifesto.stack.log": "trazabilidad completa del run",
      "manifesto.stack.caption": "← cada run deja evidencia auditable",
      "manifesto.col1.title": "Evidencia, no opiniones",
      "manifesto.col1.body":
        "Cada cifra importante queda registrada con fuente, timestamp y linaje. Si un dato no se puede defender, no entra al memo.",
      "manifesto.col2.title": "Reproducible de punta a punta",
      "manifesto.col2.body":
        "Cada análisis es un run con ID, eventos y artifacts. Podés volver atrás, revisar qué se usó y por qué se concluyó lo que se concluyó.",
      "manifesto.col3.title": "El humano decide",
      "manifesto.col3.body":
        "DeepFlow produce una recomendación investigativa y una decisión de publicabilidad. La decisión de capital queda separada, siempre.",
      "process.eyebrow": "Cómo funciona",
      "process.title": "De un ticker a un memo defendible, en siete pasos.",
      "process.step1.title": "Entrada",
      "process.step1.body": "Le das un ticker o una pregunta. DeepFlow abre el análisis y empieza a trabajar.",
      "process.step1.code": "un ticker → un run",
      "process.step2.title": "Ingesta de datos",
      "process.step2.body":
        "Reúne datos de mercado, filings, noticias y más, de fuentes confiables y con trazabilidad.",
      "process.step2.code": "datos con fuente",
      "process.step3.title": "Normalización",
      "process.step3.body": "Ordena todo en un paquete único y consistente, listo para analizar.",
      "process.step3.code": "research packet",
      "process.step4.title": "Gates de calidad",
      "process.step4.body": "Controles automáticos revisan los datos. Si algo no es confiable, el proceso se frena.",
      "process.step4.code": "control de calidad",
      "process.step5.title": "Valuación",
      "process.step5.body": "Construye el modelo de valuación y estima los precios objetivo.",
      "process.step5.code": "modelo + price targets",
      "process.step6.title": "Análisis",
      "process.step6.body": "Redacta el análisis con guardrails: la lógica decide, el modelo no improvisa.",
      "process.step6.code": "análisis con control",
      "process.step7.title": "Memo",
      "process.step7.body": "Entrega un memo de inversión completo, con toda la evidencia detrás.",
      "process.step7.code": "memo + evidencia",
      "solves.eyebrow": "Para qué sirve",
      "solves.title": "El research serio toma semanas.<br />DeepFlow lo vuelve una operación de minutos.",
      "solves.card1.metric": '<span class="strike">semanas</span> → 10 min',
      "solves.card1.title": "Reducción brutal de trabajo manual",
      "solves.card1.body":
        "Juntar filings, datos de mercado, transcripts y noticias a mano toma días. DeepFlow lo orquesta en un solo run reproducible.",
      "solves.card2.metric": "fuente + timestamp",
      "solves.card2.title": "Confianza verificable, no fe",
      "solves.card2.body":
        'Nada de "según mis cálculos". Cada número del memo tiene linaje: de dónde salió, cuándo, y qué calidad tiene la fuente.',
      "solves.card3.metric": "gates estrictos",
      "solves.card3.title": "Cero humo",
      "solves.card3.body":
        "Si la valuación o la calidad de datos es débil, el memo lo dice — en vez de forzar un precio objetivo. Lo no defendible se bloquea.",
      "solves.card4.metric": "decisión separada",
      "solves.card4.title": "El juicio sigue siendo tuyo",
      "solves.card4.body":
        "DeepFlow no reemplaza al analista: le da una línea de producción. La decisión de capital queda registrada como acto humano, aparte.",
      "sample.eyebrow": "La muestra",
      "sample.title": "Así se ve un memo de DeepFlow.",
      "sample.sub":
        "Cada run produce un memo de inversión completo, listo para un comité. Esta es su anatomía:",
      "sample.memo.brand": "DEEPFLOW · MEMO DE INVERSIÓN",
      "sample.memo.tag.publishable": "PUBLICABLE ✓",
      "sample.memo.tag.confidence": "confianza: alta",
      "sample.memo.tag.sources": "12 fuentes",
      "sample.memo.link": "Ver muestras →",
      "sample.item1": "Resumen ejecutivo",
      "sample.item2": "Tesis de inversión",
      "sample.item3": "Checklist antes de capital",
      "sample.item4": "Historia financiera",
      "sample.item5": "Valuación & precio objetivo",
      "sample.item6": "Caso alcista / Caso bajista",
      "sample.item7": "Catalizadores & riesgos",
      "sample.item8": "Contexto de noticias",
      "sample.item9": "Apéndice de fuentes",
      "sample.item10": "Supuestos del modelo",
      "sample.cta": "Ver muestras",
      "roadmap.eyebrow": "Roadmap",
      "roadmap.title": "El mapa de construcción después de DeepFlow.",
      "roadmap.sub":
        "Denario avanza de research auditado hacia asignación, seguimiento y decisioning. La regla central: los modelos juzgan y proponen; los sistemas deterministas calculan, validan, dimensionan, bloquean y auditan.",
      "roadmap.tile1.kicker": "01 / diseñado",
      "roadmap.tile1.title": "Portfolio por perfil de riesgo",
      "roadmap.tile1.body":
        "Cuestionario de horizonte, drawdown, liquidez y restricciones; propuesta de pesos, nunca orden de trading.",
      "roadmap.tile2.kicker": "02 / medición",
      "roadmap.tile2.title": "Tracking y watchlist",
      "roadmap.tile2.body":
        "Ledger de calls, precios, drift, drawdown, tesis intacta/debilitada y cola de reruns con matemática determinista.",
      "roadmap.tile3.kicker": "03 / contexto",
      "roadmap.tile3.title": "Macro + committee",
      "roadmap.tile3.body":
        "Macro Inquiry aporta contexto; un comité multi-agente debate, registra disenso y propone decisiones sin ejecutar.",
      "roadmap.tile4.kicker": "04 / futuro bloqueado",
      "roadmap.tile4.title": "Shadow, opciones y execution gateway",
      "roadmap.tile4.body":
        "Paper/shadow, opciones y broker viven detrás de risk gates, evidencia histórica y aprobación humana explícita.",
      "roadmap.rule1": "No broker activo",
      "roadmap.rule2": "No órdenes live",
      "roadmap.rule3": "No portfolio sin research fresco",
      "roadmap.rule4": "Execution fail-closed",
      "contact.eyebrow": "Contacto",
      "contact.title": "¿Querés ver qué dice DeepFlow sobre <em>tu</em> próxima inversión?",
      "contact.sub": "Escribime y te mando una muestra real, o corremos un run sobre el ticker que vos elijas.",
      "contact.emailHref": "mailto:francobales3@gmail.com?subject=Quiero%20ver%20una%20muestra%20de%20DeepFlow",
      "contact.whatsappHref":
        "https://wa.me/5491128818819?text=Hola%20Franco%2C%20quiero%20ver%20una%20muestra%20de%20DeepFlow.",
      "contact.name": "Nombre",
      "contact.namePlaceholder": "Tu nombre",
      "contact.email": "Email",
      "contact.emailPlaceholder": "tu@email.com",
      "contact.message": "Mensaje",
      "contact.messagePlaceholder": "Quiero ver una muestra de DeepFlow sobre…",
      "contact.submit": "Enviar mensaje",
      "contact.hint": "Se abre tu cliente de correo con el mensaje listo para enviar.",
      "contact.mailSubjectPrefix": "DeepFlow — contacto de ",
      "footer.note": "Research auditable. Decisión humana.",
      "footer.legal":
        '© 2026 Denario. DeepFlow no es asesoramiento financiero ni un bot de trading. · <a href="legal.html" style="color:inherit;opacity:0.6;text-decoration:underline;text-underline-offset:3px;">Términos, privacidad y legales</a>',
    },
    en: {
      "nav.product": "Product",
      "nav.process": "How it works",
      "nav.sample": "Sample",
      "nav.roadmap": "Roadmap",
      "nav.tracker": "Tracker →",
      "nav.contact": "Talk to us →",
      "nav.profileAria": "View profile",
      "nav.profileTitle": "View profile",
      "theme.generic": "Change theme",
      "theme.toDark": "Switch to dark mode",
      "theme.toLight": "Switch to light mode",
      "language.toggleAria": "Change language",
      "hero.eyebrow": "Research engine · US listed equities",
      "hero.title.line1": "Institutional-grade",
      "hero.title.line2": "<em>research</em>,",
      "hero.title.line3": "in under",
      "hero.title.line4": "<em>10 minutes</em>",
      "hero.sub":
        "DeepFlow turns a ticker into a complete research package: verified data, a valuation model, an investment memo, and audit-ready evidence. For cents per run.",
      "hero.cta.samples": "See samples",
      "hero.cta.tracker": "Research Tracker →",
      "hero.cta.process": "How it works",
      "hero.consoleAria": "DeepFlow run simulation",
      "hero.consoleInitial": "initializing run…",
      "hero.stat.timeNum": '&lt;<span data-count="10">10</span> min',
      "hero.stat.timeLabel": "per company analyzed",
      "hero.stat.costNum": 'cents <span class="stat__unit">USD</span>',
      "hero.stat.costLabel": "cost per full run",
      "hero.stat.sourcesNum": '<span data-count="8">8</span>+ sources',
      "hero.stat.sourcesLabel": "primary data sources, timestamped",
      "hero.stat.auditNum": '<span data-count="100">100</span>%',
      "hero.stat.auditLabel": "traceable and auditable",
      "manifesto.eyebrow": "What DeepFlow is",
      "manifesto.title":
        "DeepFlow is <em>not</em> a trading bot. It does not promise magic alpha. It is a <em>research production line</em>: verifiable data, a reproducible model, a readable memo, and strict controls before anything is published. The final decision always stays in <em>human hands</em>.",
      "manifesto.stackAria": "Artifacts produced by each run",
      "manifesto.stack.memo": "complete investment memo",
      "manifesto.stack.model": "DCF · SOTP · price targets",
      "manifesto.stack.packet": "canonical data + lineage",
      "manifesto.stack.log": "full run traceability",
      "manifesto.stack.caption": "← every run leaves auditable evidence",
      "manifesto.col1.title": "Evidence, not opinions",
      "manifesto.col1.body":
        "Every important number is recorded with source, timestamp, and lineage. If a data point cannot be defended, it does not enter the memo.",
      "manifesto.col2.title": "Reproducible end to end",
      "manifesto.col2.body":
        "Every analysis is a run with an ID, events, and artifacts. You can go back, review what was used, and see why the system reached its conclusion.",
      "manifesto.col3.title": "The human decides",
      "manifesto.col3.body":
        "DeepFlow produces a research recommendation and a publishability decision. The capital decision stays separate, always.",
      "process.eyebrow": "How it works",
      "process.title": "From one ticker to a defensible memo in seven steps.",
      "process.step1.title": "Input",
      "process.step1.body": "You give it a ticker or a question. DeepFlow opens the analysis and starts working.",
      "process.step1.code": "one ticker → one run",
      "process.step2.title": "Data ingest",
      "process.step2.body":
        "It gathers market data, filings, news, and more from trusted, traceable sources.",
      "process.step2.code": "sourced data",
      "process.step3.title": "Normalization",
      "process.step3.body": "It organizes everything into one consistent package, ready for analysis.",
      "process.step3.code": "research packet",
      "process.step4.title": "Quality gates",
      "process.step4.body": "Automated checks review the data. If something is not reliable, the process stops.",
      "process.step4.code": "quality checks",
      "process.step5.title": "Valuation",
      "process.step5.body": "It builds the valuation model and estimates price targets.",
      "process.step5.code": "model + price targets",
      "process.step6.title": "Analysis",
      "process.step6.body": "It drafts the analysis with guardrails: logic decides, the model does not improvise.",
      "process.step6.code": "controlled analysis",
      "process.step7.title": "Memo",
      "process.step7.body": "It delivers a complete investment memo with the evidence behind it.",
      "process.step7.code": "memo + evidence",
      "solves.eyebrow": "What it solves",
      "solves.title": "Serious research takes weeks.<br />DeepFlow turns it into a minutes-long operation.",
      "solves.card1.metric": '<span class="strike">weeks</span> → 10 min',
      "solves.card1.title": "A sharp reduction in manual work",
      "solves.card1.body":
        "Collecting filings, market data, transcripts, and news by hand takes days. DeepFlow orchestrates it in one reproducible run.",
      "solves.card2.metric": "source + timestamp",
      "solves.card2.title": "Verifiable trust, not faith",
      "solves.card2.body":
        'No "according to my calculations." Every number in the memo has lineage: where it came from, when, and how strong the source is.',
      "solves.card3.metric": "strict gates",
      "solves.card3.title": "No fluff",
      "solves.card3.body":
        "If valuation or data quality is weak, the memo says so instead of forcing a target price. What cannot be defended gets blocked.",
      "solves.card4.metric": "separate decision",
      "solves.card4.title": "The judgment stays yours",
      "solves.card4.body":
        "DeepFlow does not replace the analyst: it gives the analyst a production line. The capital decision is recorded as a separate human act.",
      "sample.eyebrow": "The sample",
      "sample.title": "What a DeepFlow memo looks like.",
      "sample.sub":
        "Every run produces a complete investment memo, ready for committee review. This is its anatomy:",
      "sample.memo.brand": "DEEPFLOW · INVESTMENT MEMO",
      "sample.memo.tag.publishable": "PUBLISHABLE ✓",
      "sample.memo.tag.confidence": "confidence: high",
      "sample.memo.tag.sources": "12 sources",
      "sample.memo.link": "See samples →",
      "sample.item1": "Executive summary",
      "sample.item2": "Investment thesis",
      "sample.item3": "Pre-capital checklist",
      "sample.item4": "Financial history",
      "sample.item5": "Valuation & price target",
      "sample.item6": "Bull case / Bear case",
      "sample.item7": "Catalysts & risks",
      "sample.item8": "News context",
      "sample.item9": "Source appendix",
      "sample.item10": "Model assumptions",
      "sample.cta": "See samples",
      "roadmap.eyebrow": "Roadmap",
      "roadmap.title": "The build map after DeepFlow.",
      "roadmap.sub":
        "Denario moves from audited research toward allocation, monitoring, and decisioning. The central rule: models judge and propose; deterministic systems calculate, validate, size, block, and audit.",
      "roadmap.tile1.kicker": "01 / designed",
      "roadmap.tile1.title": "Portfolio by risk profile",
      "roadmap.tile1.body":
        "A questionnaire for horizon, drawdown, liquidity, and restrictions; proposed weights, never a trading order.",
      "roadmap.tile2.kicker": "02 / measurement",
      "roadmap.tile2.title": "Tracking and watchlist",
      "roadmap.tile2.body":
        "A ledger of calls, prices, drift, drawdown, thesis intact/weakened, and a rerun queue with deterministic math.",
      "roadmap.tile3.kicker": "03 / context",
      "roadmap.tile3.title": "Macro + committee",
      "roadmap.tile3.body":
        "Macro Inquiry adds context; a multi-agent committee debates, records dissent, and proposes decisions without executing.",
      "roadmap.tile4.kicker": "04 / blocked future",
      "roadmap.tile4.title": "Shadow, options, and execution gateway",
      "roadmap.tile4.body":
        "Paper/shadow trading, options, and broker access live behind risk gates, historical evidence, and explicit human approval.",
      "roadmap.rule1": "No active broker",
      "roadmap.rule2": "No live orders",
      "roadmap.rule3": "No portfolio without fresh research",
      "roadmap.rule4": "Execution fails closed",
      "contact.eyebrow": "Contact",
      "contact.title": "Want to see what DeepFlow says about <em>your</em> next investment?",
      "contact.sub": "Write to me and I will send a real sample, or we can run DeepFlow on a ticker you choose.",
      "contact.emailHref": "mailto:francobales3@gmail.com?subject=I%20want%20to%20see%20a%20DeepFlow%20sample",
      "contact.whatsappHref":
        "https://wa.me/5491128818819?text=Hi%20Franco%2C%20I%20want%20to%20see%20a%20DeepFlow%20sample.",
      "contact.name": "Name",
      "contact.namePlaceholder": "Your name",
      "contact.email": "Email",
      "contact.emailPlaceholder": "you@email.com",
      "contact.message": "Message",
      "contact.messagePlaceholder": "I want to see a DeepFlow sample about…",
      "contact.submit": "Send message",
      "contact.hint": "Your email app opens with the message ready to send.",
      "contact.mailSubjectPrefix": "DeepFlow — message from ",
      "footer.note": "Audit-ready research. Human decision.",
      "footer.legal":
        '© 2026 Denario. DeepFlow is not financial advice or a trading bot. · <a href="legal.html" style="color:inherit;opacity:0.6;text-decoration:underline;text-underline-offset:3px;">Terms, privacy, and legal</a>',
    },
  };

  const CONSOLE_EVENTS = {
    es: [
      { t: "00:00.4", m: 'run iniciado · <span class="accent">NVDA</span> · paquete de trabajo creado' },
      { t: "00:03.1", m: "ingesta: SEC/EDGAR · 10-K, 10-Q, 8-K" },
      { t: "00:09.8", m: "ingesta: FMP · Yahoo · Finnhub · news · macro" },
      { t: "00:21.5", m: "normalización → CanonicalResearchPacket" },
      { t: "01:02.0", m: 'gates: datos faltantes <span class="ok">PASS</span> · canaries <span class="ok">PASS</span>' },
      { t: "01:14.3", m: 'gates: consistencia <span class="ok">PASS</span> · source lineage <span class="ok">PASS</span>' },
      { t: "02:38.9", m: "valuación: DCF · SOTP · reverse DCF · peers" },
      { t: "03:50.2", m: 'price targets calculados · <span class="warn">workbook.xlsx</span> generado' },
      { t: "05:06.7", m: "síntesis narrativa con guardrails determinísticos" },
      { t: "07:42.1", m: "memo: IC brief · bull/bear · catalysts · riesgos" },
      { t: "08:55.4", m: 'publishability: <span class="ok">PUBLISHABLE ✓</span>' },
      { t: "09:12.0", m: 'artifacts: <span class="accent">final_memo.pdf</span> · .html · .md · .json' },
    ],
    en: [
      { t: "00:00.4", m: 'run started · <span class="accent">NVDA</span> · work packet created' },
      { t: "00:03.1", m: "ingest: SEC/EDGAR · 10-K, 10-Q, 8-K" },
      { t: "00:09.8", m: "ingest: FMP · Yahoo · Finnhub · news · macro" },
      { t: "00:21.5", m: "normalization → CanonicalResearchPacket" },
      { t: "01:02.0", m: 'gates: missing data <span class="ok">PASS</span> · canaries <span class="ok">PASS</span>' },
      { t: "01:14.3", m: 'gates: consistency <span class="ok">PASS</span> · source lineage <span class="ok">PASS</span>' },
      { t: "02:38.9", m: "valuation: DCF · SOTP · reverse DCF · peers" },
      { t: "03:50.2", m: 'price targets calculated · <span class="warn">workbook.xlsx</span> generated' },
      { t: "05:06.7", m: "narrative synthesis with deterministic guardrails" },
      { t: "07:42.1", m: "memo: IC brief · bull/bear · catalysts · risks" },
      { t: "08:55.4", m: 'publishability: <span class="ok">PUBLISHABLE ✓</span>' },
      { t: "09:12.0", m: 'artifacts: <span class="accent">final_memo.pdf</span> · .html · .md · .json' },
    ],
  };

  const CONSOLE_STATES = {
    es: [
      "ingiriendo datos…",
      "normalizando paquete…",
      "corriendo gates de calidad…",
      "valuando…",
      "redactando memo…",
      "run completo · esperando decisión humana",
    ],
    en: [
      "ingesting data…",
      "normalizing package…",
      "running quality gates…",
      "valuing…",
      "drafting memo…",
      "run complete · waiting for human decision",
    ],
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
    if (doc && doc.documentElement) {
      return normalizeLanguage(
        (doc.documentElement.getAttribute && doc.documentElement.getAttribute("lang")) ||
          doc.documentElement.lang,
      );
    }
    return DEFAULT_LANG;
  }

  function setMeta(doc, selector, value) {
    if (!doc || !doc.querySelector) return;
    const el = doc.querySelector(selector);
    if (!el) return;
    if (el.setAttribute) el.setAttribute("content", value);
    else el.content = value;
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

    if (doc.querySelectorAll) {
      doc.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key) el.textContent = t(key, code);
      });

      doc.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const key = el.getAttribute("data-i18n-html");
        if (key) el.innerHTML = t(key, code);
      });

      doc.querySelectorAll("[data-i18n-attrs]").forEach((el) => {
        const spec = el.getAttribute("data-i18n-attrs") || "";
        spec.split(";").forEach((pair) => {
          const parts = pair.split(":");
          if (parts.length < 2) return;
          const attr = parts.shift().trim();
          const key = parts.join(":").trim();
          if (attr && key && el.setAttribute) el.setAttribute(attr, t(key, code));
        });
      });

      doc.querySelectorAll("[data-lang-option]").forEach((el) => {
        const active = normalizeLanguage(el.getAttribute("data-lang-option")) === code;
        if (el.setAttribute) el.setAttribute("aria-pressed", active ? "true" : "false");
        if (el.classList && el.classList.toggle) el.classList.toggle("is-active", active);
      });
    }

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
      // Storage can be unavailable in private contexts. The page still switches for this session.
    }
  }

  function initialLanguage(win) {
    if (!win) return DEFAULT_LANG;
    try {
      const fromUrl = new win.URLSearchParams(win.location ? win.location.search : "").get("lang");
      if (fromUrl) return normalizeLanguage(fromUrl);
    } catch (_error) {
      // Ignore malformed or unavailable URL state.
    }
    return normalizeLanguage(readStoredLanguage(win) || DEFAULT_LANG);
  }

  function dispatchLanguageChange(win, lang) {
    if (!win || !win.dispatchEvent || !win.CustomEvent) return;
    win.dispatchEvent(new win.CustomEvent("deepflow:languagechange", { detail: { lang } }));
  }

  function initLandingLanguage(win, doc) {
    const lang = applyLandingLanguage(doc, initialLanguage(win));

    if (!doc || !doc.querySelectorAll) return lang;
    doc.querySelectorAll("[data-lang-option]").forEach((button) => {
      if (!button.addEventListener) return;
      button.addEventListener("click", () => {
        const next = normalizeLanguage(button.getAttribute("data-lang-option"));
        writeStoredLanguage(win, next);
        applyLandingLanguage(doc, next);
        dispatchLanguageChange(win, next);
      });
    });

    return lang;
  }

  function consoleEvents(lang) {
    return CONSOLE_EVENTS[normalizeLanguage(lang)].slice();
  }

  function consoleState(index, lang) {
    const states = CONSOLE_STATES[normalizeLanguage(lang)];
    return states[Math.max(0, Math.min(index, states.length - 1))];
  }

  function consoleStates(lang) {
    return CONSOLE_STATES[normalizeLanguage(lang)].slice();
  }

  global.DeepFlowI18n = {
    applyLandingLanguage,
    consoleEvents,
    consoleState,
    consoleStates,
    currentLanguage,
    initLandingLanguage,
    normalizeLanguage,
    t,
  };

  if (global.document) {
    initLandingLanguage(global, global.document);
  }
})(globalThis);
