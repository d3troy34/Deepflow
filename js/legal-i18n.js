(function () {
  "use strict";

  const STORAGE_KEY = "df-lang";
  const DEFAULT_LANG = "es";

  const META = {
    es: {
      title: "Legales — DeepFlow by Denario",
      description:
        "Términos y Condiciones, Política de Privacidad, Política de Cookies, Aviso de No Asesoramiento Financiero y demás documentos legales de DeepFlow by Denario.",
    },
    en: {
      title: "Legal — DeepFlow by Denario",
      description:
        "Terms, Privacy Policy, Cookie Policy, financial non-advice notice, acceptable use, cancellations, and legal notices for DeepFlow by Denario.",
    },
  };

  const NAV = {
    es: {
      product: "Producto",
      process: "Cómo funciona",
      sample: "Muestra",
      contact: "Hablemos →",
      profile: "Ver perfil",
      theme: "Cambiar tema",
      language: "Cambiar idioma",
      footerNote: "Research auditable. Decisión humana.",
      footerLegal: "© 2026 Denario. DeepFlow no es asesoramiento financiero ni un bot de trading.",
    },
    en: {
      product: "Product",
      process: "How it works",
      sample: "Sample",
      contact: "Talk to us →",
      profile: "View profile",
      theme: "Change theme",
      language: "Change language",
      footerNote: "Audit-ready research. Human decision.",
      footerLegal: "© 2026 Denario. DeepFlow is not financial advice or a trading bot.",
    },
  };

  const EN_LEGAL_HTML = `
    <div class="legal-hero">
      <p class="eyebrow">Legal documents · Denario / DeepFlow</p>
      <h1 class="legal-hero__title">Legal and<br /><em>policies</em></h1>
      <p class="legal-hero__sub">Terms of use, privacy, cookies, acceptable use, financial non-advice notice, and other Service conditions.</p>
      <span class="legal-updated">Last updated: June 16, 2026</span>
    </div>

    <div class="legal-layout">
      <aside class="legal-toc">
        <div class="legal-toc__inner">
          <span class="legal-toc__label">Documents</span>
          <nav id="legal-nav">
            <a href="#terminos">Terms and Conditions</a>
            <a href="#aviso-riesgo">Financial Non-Advice Notice</a>
            <a href="#privacidad">Privacy Policy</a>
            <a href="#cookies">Cookie Policy</a>
            <a href="#uso-aceptable">Acceptable Use</a>
            <a href="#cancelaciones">Cancellations and Refunds</a>
            <a href="#aviso-legal">Legal Notice</a>
          </nav>
        </div>
      </aside>

      <div class="legal-content">
        <section class="legal-doc" id="terminos">
          <span class="legal-doc__label">Document 01</span>
          <h2>Terms and Conditions of Use</h2>

          <h3 class="no-border">1. Responsible party</h3>
          <p>These Terms and Conditions of Use ("Terms") govern access to and use of denario.lat, its subdomains, forms, materials, communications, products, reports, models, files, APIs, demos, and related services under the Denario and/or DeepFlow brand ("Denario", "DeepFlow", "we", or the "Service").</p>
          <p>The Service is operated by Denario / DeepFlow. Legal contact: <a href="mailto:legal@denario.lat">legal@denario.lat</a>.</p>
          <p>If a user does not accept these Terms, the user must not use the Service, request runs, download materials, use reports, or purchase any plan.</p>

          <h3>2. Acceptance</h3>
          <p>By browsing the site, submitting a form, requesting a sample, purchasing a plan, requesting a run, downloading a deliverable, or using any Denario feature, the user confirms that they have read, understood, and accepted these Terms, the Privacy Policy, the Cookie Policy, the Financial Non-Advice and Risk Notice, and any commercial conditions applicable to the selected plan.</p>
          <p>If the user acts on behalf of a company, fund, vehicle, institution, employer, client, or third party, the user represents that they have sufficient authority to bind that party. If not, the user is personally responsible for the use made of the Service.</p>

          <h3>3. General description of the Service</h3>
          <p>Denario / DeepFlow is a financial research tool that organizes, processes, and presents information, data, sources, assumptions, models, scenarios, estimates, and support materials about selected financial instruments, issuers, or tickers. The Service may generate PDF, XLSX, JSON, audit logs, summaries, valuation models, documentary evidence, comments, scenarios, valuation ranges, and quality controls.</p>
          <p>The Service is not a trading platform, broker, dealer, clearing agent, custodian, personalized financial adviser, tax adviser, legal adviser, portfolio manager, fiduciary, wealth manager, or securities intermediary. Denario does not receive, transmit, execute, or manage orders to buy or sell financial instruments. Denario does not custody money, securities, cryptoassets, financial assets, or investment account credentials.</p>

          <h3>4. No investment, financial, legal, accounting, or tax advice</h3>
          <p>All content, reports, memos, models, outputs, estimates, scenarios, internal ratings, publishability controls, target prices, valuation ranges, checklists, comparisons, comments, and communications issued by Denario are for informational, research, educational, and general analytical support purposes only.</p>
          <p>Nothing published or delivered by Denario is, or should be read as, personalized investment advice, financial advice, capital markets advice, a public offering, an invitation to offer, a solicitation to buy or sell, personalized research, a recommendation to buy, sell, or hold an asset, tax advice, accounting advice, legal advice, portfolio management, a promise of returns, a guarantee of results, or a substitute for human professional judgment.</p>
          <p>The user acknowledges that every investment, divestment, hedging, capital allocation, sizing, rebalancing, trading, derivatives, leverage, or execution decision is made exclusively by the user or by the user's registered advisers, under the user's own analysis, responsibility, and risk.</p>

          <h3>5. No personalization and no suitability review</h3>
          <p>Denario does not necessarily know the user's financial situation, assets, income, time horizon, restrictions, risk tolerance, tax obligations, jurisdiction, investment experience, investment objectives, liquidity needs, or personal circumstances.</p>
          <p>Outputs are not designed to determine whether a financial instrument is suitable, convenient, compatible, or appropriate for any specific user. Users should consult duly authorized or registered professionals before making investment decisions.</p>

          <h3>6. Market risks</h3>
          <p>Investing in securities, stocks, bonds, ETFs, derivatives, ADRs, Cedears, foreign instruments, digital assets, or other financial instruments involves material risks, including partial or total loss of capital, volatility, illiquidity, currency risk, interest-rate risk, regulatory risk, accounting risk, issuer risk, counterparty risk, execution risk, tax risk, geopolitical risk, and data risk.</p>
          <p>Past performance does not guarantee future results. Valuations, price ranges, scenarios, multiples, DCF models, SOTP models, comparables, macro assumptions, and target prices are estimates subject to uncertainty and are not guaranteed predictions.</p>

          <h3>7. Data, third-party sources, and limitations</h3>
          <p>Denario may use public, private, commercial, API, filing, market data, transcript, news, macroeconomic, issuer, third-party provider, proprietary model, and automated system sources. Although Denario may apply traceability, quality, lineage, and consistency controls, it does not guarantee that data is accurate, complete, current, error-free, continuously available, or fit for any specific purpose.</p>
          <p>Some data may be delayed, later corrected, subject to third-party licenses, incomplete, source-error-prone, or assumption-dependent. The user is responsible for verifying any data before using it in real decisions, presentations, committees, publications, orders, transactions, regulatory reports, or third-party documentation.</p>

          <h3>8. Automation and artificial intelligence</h3>
          <p>The Service may use automation, statistical models, language models, data pipelines, extraction tools, text generation, semantic analysis, control rules, and other automated systems. These systems may produce errors, omissions, inconsistencies, incorrect inferences, outdated information, incomplete responses, or ambiguous wording.</p>
          <p>Denario may implement controls to reduce errors, but it does not guarantee absence of failures. The user accepts that every output requires independent human review before any meaningful use.</p>

          <h3>9. User conduct</h3>
          <p>The user must use the Service lawfully, prudently, and consistently with these Terms. In particular, the user must not:</p>
          <ul>
            <li>Use the Service to provide financial advice, personalized recommendations, client solicitation, securities promotion, or portfolio management without the required regulatory authorizations.</li>
            <li>Present Denario outputs as official recommendations, trading signals, guarantees of result, buy/sell indications, regulated research, fairness opinions, expert reports, or legal, accounting, or tax opinions.</li>
            <li>Use outputs as the sole basis for financial transactions.</li>
            <li>Input, upload, or disclose inside information, non-public information, confidential information, or market-restricted information.</li>
            <li>Use the Service for market manipulation, misuse of information, insider trading, front-running, deceptive scalping, pump and dump schemes, rumor spreading, or any conduct prohibited by capital markets laws.</li>
            <li>Resell, sublicense, mass publish, scrape, index, copy, modify, or distribute outputs outside the scope authorized by Denario.</li>
            <li>Attempt to access Denario systems, models, credentials, APIs, data, or infrastructure without authorization.</li>
          </ul>

          <h3>10. Accounts, access, and security</h3>
          <p>When the Service requires an account, key, token, private link, or credential, the user is responsible for keeping it confidential. Activity made through the user's account, link, or credential will be treated as activity by the user unless proven otherwise.</p>
          <p>The user must immediately report unauthorized access, credential loss, misuse, or security incidents to <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>.</p>

          <h3>11. Plans, payments, and taxes</h3>
          <p>Commercial conditions, prices, currency, taxes, recurrence, usage limits, features, run quantity, support, included deliverables, and plan restrictions are those stated at purchase time or in the applicable commercial proposal.</p>
          <p>Unless expressly stated otherwise, prices exclude taxes, withholdings, bank charges, payment gateway charges, conversion costs, transfer costs, payment-method fees, and applicable duties.</p>

          <h3>12. Cancellations, withdrawal rights, and refunds</h3>
          <p>If the user contracts as a consumer through digital means and applicable law recognizes a withdrawal right, the user may exercise it within the legal period through the channel indicated by Denario, subject to the exceptions and conditions that may apply to digital, personalized, started, or fully performed services.</p>
          <p>Recurring subscriptions may be cancelled going forward. Cancellation prevents future renewals but does not automatically refund periods already started, deliverables already generated, runs already executed, services already provided, third-party costs already incurred, or personalized work already performed, unless applicable law requires otherwise or Denario accepts it in writing.</p>

          <h3>13. Denario intellectual property</h3>
          <p>The site, brand, trade name, design, software, processes, pipelines, prompts, control criteria, models, documentation, interfaces, databases, know-how, text, logos, structure, methodology, templates, sample reports, and elements not expressly delivered to the user belong to Denario or its licensors.</p>
          <p>The user receives only a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to access and use the Service and deliverables according to the purchased plan.</p>

          <h3>14. Use of deliverables</h3>
          <p>Unless otherwise agreed in writing, Denario deliverables may be used by the user for internal analysis, review, research, and support of the user's own work. They may not be resold, published, redistributed, included in commercial products, used for client solicitation, presented as regulated research, used as personalized recommendations to third parties, or used in public offering, fundraising, financial marketing, or regulatory communications without Denario's written authorization and independent professional review.</p>

          <h3>15. User content</h3>
          <p>The user retains rights over information, tickers, questions, files, comments, instructions, or materials submitted to Denario ("User Content"). The user grants Denario a limited license to process that content to provide, maintain, audit, secure, bill, and improve the Service, in line with the Privacy Policy and any applicable confidentiality agreement.</p>

          <h3>16. Confidentiality</h3>
          <p>When Denario and the user exchange confidential information, each party must use it only for the purposes of the commercial relationship and protect it with reasonable measures. Public information, lawfully known information, information received from a third party without confidentiality duties, independently developed information, or information required by authorities is not confidential.</p>

          <h3>17. Conflicts of interest</h3>
          <p>Denario, its partners, collaborators, advisers, suppliers, or related persons may hold, have held, or acquire positions, economic interests, commercial relationships, subscriptions, partnerships, commissions, benefits, or direct or indirect exposure to issuers, sectors, instruments, data providers, or entities mentioned in outputs.</p>
          <p>Denario will seek to disclose known material conflicts when appropriate, but the user should not assume that absence of a specific disclosure means absence of conflicts.</p>

          <h3>18. Communications and marketing</h3>
          <p>Denario may send operational communications related to the Service. Commercial communications, newsletters, or promotions will be sent according to applicable law and user preferences. Users may opt out through the mechanism in each message or by writing to <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>.</p>

          <h3>19. Availability, changes, and suspension</h3>
          <p>Denario may modify, update, limit, suspend, or discontinue Service features for maintenance, security, improvements, regulatory changes, data availability, business decisions, misuse, or force majeure. Denario does not guarantee uninterrupted availability, absence of errors, compatibility with all systems, or indefinite permanence of any feature.</p>

          <h3>20. Disclaimer of warranties</h3>
          <p>The Service and deliverables are provided "as is" and "as available". To the maximum extent permitted by law, Denario gives no express or implied warranties of accuracy, completeness, timeliness, merchantability, fitness for a particular purpose, non-infringement, financial performance, returns, absence of losses, availability, absolute security, compatibility, or results.</p>

          <h3>21. Limitation of liability</h3>
          <p>To the maximum extent permitted by law, Denario will not be liable for financial losses, lost profits, lost opportunity, data loss, reputational harm, or indirect, special, incidental, punitive, or consequential damages arising from use or inability to use the Service, including investment decisions, trading, capital allocation, regulatory compliance, third-party communications, or use of outputs without independent review.</p>
          <p>For business users, except in cases of willful misconduct or gross negligence and to the maximum extent permitted by law, Denario's total cumulative liability for claims related to the Service will not exceed the amount actually paid by the user to Denario for the specific Service that gave rise to the claim during the three months before the event.</p>

          <h3>22. Indemnity</h3>
          <p>The user will hold Denario, its directors, partners, employees, contractors, suppliers, and affiliates harmless from claims, losses, damages, sanctions, costs, and reasonable expenses arising from misuse of the Service, breach of these Terms, violation of laws or third-party rights, use of outputs to advise third parties without authorization, unauthorized information uploads, or financial decisions made by the user or third parties based on deliverables.</p>

          <h3>23. Termination</h3>
          <p>Denario may suspend or terminate access if it detects breach of these Terms, risky use, abuse, fraud, unauthorized access, non-payment, intellectual property infringement, legal or regulatory risk, authority request, or conduct that may affect Denario, other users, or third parties.</p>

          <h3>24. Governing law and jurisdiction</h3>
          <p>These Terms are governed by the laws of Argentina, without prejudice to mandatory consumer, personal data, capital markets, electronic commerce, tax, or regulatory rules that may apply.</p>
          <p>For business users, disputes will be submitted to the competent courts of the City of Buenos Aires, Argentina, unless a mandatory rule provides otherwise.</p>

          <h3>25. Changes to these Terms</h3>
          <p>Denario may update these Terms. The current version is the one published on the site, with the last updated date. Material changes will be communicated by reasonable means when appropriate. Continued use after changes become effective means acceptance of the new version, unless the law requires another mechanism.</p>

          <h3>26. Contact</h3>
          <p>Legal questions: <a href="mailto:legal@denario.lat">legal@denario.lat</a>. Support: <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>. Privacy: <a href="mailto:privacidad@denario.lat">privacidad@denario.lat</a>.</p>
        </section>

        <section class="legal-doc" id="aviso-riesgo">
          <span class="legal-doc__label">Document 02</span>
          <h2>Financial Non-Advice and Risk Notice</h2>
          <div class="legal-variant">
            <span class="legal-variant__label">Long version · Legal page</span>
            <p>Denario / DeepFlow does not provide personalized financial advice, capital markets advice, investment advice, legal, tax, accounting, wealth, retirement, or other regulated professional advice. Denario is not a broker, dealer, clearing agent, custodian, bank, fund manager, portfolio manager, registered adviser, fiduciary, or financial intermediary unless expressly stated with the applicable license or registration.</p>
            <p>Materials generated by Denario are general, automated, non-personalized research. They may include issuer analysis, financial data, valuation models, scenarios, estimated ranges, multiples, assumptions, risks, catalysts, source appendices, quality controls, target prices, or similar items. They are not a recommendation to buy, sell, hold, subscribe, redeem, swap, hedge, leverage, short, or otherwise transact in financial instruments.</p>
            <p>Denario does not evaluate suitability, convenience, or appropriateness for any specific user. The user is solely responsible for consulting authorized professionals, verifying data, analyzing risks, and making decisions. No Denario output should be used as the sole source for an investment decision.</p>
            <p>Financial markets are risky. Instrument values may rise or fall, and the user may lose part or all invested capital. Estimates, scenarios, and valuations are based on assumptions that may be wrong. Data may be delayed, incomplete, or erroneous. Past performance does not guarantee future results.</p>
          </div>
          <div class="legal-variant">
            <span class="legal-variant__label">Short version · Site footer</span>
            <p>DeepFlow by Denario provides general, automated research. It is not financial advice, an investment recommendation, a public offering, intermediation, portfolio management, or a trading bot. Every capital decision remains exclusively with the user and/or registered advisers. Investing involves risk of partial or total capital loss.</p>
          </div>
          <div class="legal-variant">
            <span class="legal-variant__label">Pre-run version · Required acceptance</span>
            <p>Before running DeepFlow, I understand and accept that the output will be informational and general research only. It will not be personalized financial advice, a buy/sell/hold recommendation, an offer, solicitation, intermediation, portfolio management, or guarantee of results. I am fully responsible for verifying information and for any investment, trading, or capital allocation decision.</p>
          </div>
          <div class="legal-variant">
            <span class="legal-variant__label">Cover version · PDF / Memo</span>
            <p>IMPORTANT NOTICE: This document was generated by Denario / DeepFlow for informational and general research purposes only. It is not financial advice, a personalized recommendation, a public offering, a solicitation to buy or sell, intermediation, portfolio management, regulated research, or a return guarantee. Valuations, scenarios, assumptions, and target prices are non-binding estimates subject to uncertainty and error. Investment decisions belong exclusively to the reader and/or duly authorized advisers. Investing involves risk of partial or total capital loss.</p>
          </div>
        </section>

        <section class="legal-doc" id="privacidad">
          <span class="legal-doc__label">Document 03</span>
          <h2>Privacy Policy</h2>
          <h3 class="no-border">1. Controller</h3>
          <p>This Privacy Policy explains how Denario / DeepFlow ("Denario", "we") collects, uses, keeps, shares, and protects personal data in connection with denario.lat, DeepFlow, forms, communications, demos, runs, deliverables, proposals, support, and related services.</p>
          <p>Controller: Denario / DeepFlow. Privacy email: <a href="mailto:privacidad@denario.lat">privacidad@denario.lat</a>.</p>
          <h3>2. Data we may collect</h3>
          <ul>
            <li><strong>Identity and contact data:</strong> name, email, phone, company, role, country, city, messaging username, and form data.</li>
            <li><strong>Commercial data:</strong> plan, proposal, contract, billing, payment status, run history, requests, support, preferences, and communications.</li>
            <li><strong>Technical data:</strong> IP address, device identifiers, browser, operating system, language, visited pages, logs, access dates and times, security events, cookies, and similar technologies.</li>
            <li><strong>Usage data:</strong> tickers, questions, parameters, instructions, generated outputs, downloaded files, Service activity, and operational metrics.</li>
            <li><strong>Payment data:</strong> information needed for billing and collection. Full card or payment credentials may be processed by third-party payment providers.</li>
            <li><strong>User-submitted content:</strong> messages, files, notes, prompts, documentation, comments, or other materials shared by the user.</li>
          </ul>
          <p>We do not request sensitive data unless strictly necessary and legally supported. Users should not upload sensitive data, inside information, third-party trade secrets, end-client data, health, biometric, political, union, religious, or unauthorized confidential information.</p>
          <h3>3. Purposes</h3>
          <p>We may process personal data to answer inquiries, send samples, provide the Service, execute runs, generate deliverables, provide support, create and protect accounts, bill and collect payments, comply with legal obligations, audit quality and security, improve features, send operational or legal notices, send commercial communications when allowed, and protect rights, infrastructure, users, and third parties.</p>
          <h3>4. Legal bases</h3>
          <p>Depending on the applicable jurisdiction, we process personal data based on consent, performance of a contractual or pre-contractual relationship, legal obligations, legitimate interests in operating and protecting the Service, or any other basis allowed by law.</p>
          <h3>5. Automated processing and AI</h3>
          <p>The Service may use automated systems and AI to process information, organize sources, generate summaries, models, comments, and deliverables. These processes are used to provide the Service and should not be interpreted as automated decisions about the user's legal, financial, credit, employment, medical, or personal situation.</p>
          <h3>6. Sharing with third parties</h3>
          <p>We may share personal data as needed with hosting, infrastructure, storage, security, email, analytics, CRM, support, automation, payments, billing, database, API, financial data, and productivity providers; professional advisers; authorities or courts; and affiliates, acquirers, investors, or successors in corporate transactions under reasonable safeguards.</p>
          <p>We do not sell personal data as an independent business. If we later implement behavioral advertising, commercial data sharing, or sale of data in the applicable regulatory sense, we will update this Policy and request required consents.</p>
          <h3>7. International transfers</h3>
          <p>Data may be processed, stored, or accessed from countries other than the user's country of residence, including Argentina, the United States, or other countries where Denario or its providers operate. Where required, we will apply reasonable contractual, technical, and organizational safeguards.</p>
          <h3>8. Retention</h3>
          <p>We retain data for as long as necessary to fulfill the stated purposes, provide the Service, maintain run traceability, resolve disputes, comply with legal obligations, audit security, bill, support operations, and defend rights.</p>
          <h3>9. Security</h3>
          <p>We use reasonable technical and organizational measures to protect personal data against unauthorized access, loss, destruction, misuse, alteration, or disclosure. No system is completely secure. Users must protect their credentials, limit shared information, and notify us of suspicious incidents.</p>
          <h3>10. Data subject rights</h3>
          <p>Depending on applicable law, users may request access, correction, update, deletion, confidentiality, objection, restriction, portability, or withdrawal of consent. To exercise rights, write to <a href="mailto:privacidad@denario.lat">privacidad@denario.lat</a> with enough information to verify identity and process the request.</p>
          <h3>11. Minors</h3>
          <p>The Service is not directed to users under 18. We do not knowingly collect children's data. If we learn that a minor provided data without valid authorization, we may delete it.</p>
          <h3>12. Marketing</h3>
          <p>We may send commercial communications if authorized or legally allowed. Users may unsubscribe through the link in communications or by writing to <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>. Opting out of marketing does not prevent necessary operational or legal communications.</p>
          <h3>13. Cookies</h3>
          <p>Cookies and similar technologies are regulated in the <a href="#cookies">Cookie Policy</a>. Users may configure their browser or preferences panel, when available, to reject or limit non-essential cookies.</p>
          <h3>14. Changes</h3>
          <p>We may update this Privacy Policy. The current version is the one published on the site with the last updated date. Material changes will be communicated by reasonable means when appropriate.</p>
          <h3>15. Contact</h3>
          <p>Privacy inquiries or requests: <a href="mailto:privacidad@denario.lat">privacidad@denario.lat</a>.</p>
        </section>

        <section class="legal-doc" id="cookies">
          <span class="legal-doc__label">Document 04</span>
          <h2>Cookie Policy</h2>
          <h3 class="no-border">1. What cookies are</h3>
          <p>Cookies are small files or identifiers stored in a user's browser or device when visiting a website. We may also use similar technologies, including local storage, pixels, SDKs, tags, logs, or technical identifiers.</p>
          <h3>2. Types of cookies we may use</h3>
          <ul>
            <li><strong>Strictly necessary cookies:</strong> enable navigation, security, sessions, basic preferences, site loading, fraud prevention, and essential operation.</li>
            <li><strong>Functional cookies:</strong> remember preferences, language, region, forms, settings, or personalized experiences.</li>
            <li><strong>Analytics cookies:</strong> help us understand site use, visited pages, errors, performance, campaigns, and aggregate metrics.</li>
            <li><strong>Marketing or advertising measurement cookies:</strong> allow campaign measurement, attribution, conversions, or relevant communications, subject to law and user preferences.</li>
          </ul>
          <h3>3. Third-party cookies</h3>
          <p>Some cookies or technologies may be provided by analytics, hosting, security, payment, CRM, email, support, advertising, or integrated tool providers. These third parties may process data under their own policies.</p>
          <h3>4. Preference management</h3>
          <p>Users may configure their browser to block, delete, or limit cookies. They may also use a cookie preference panel when Denario implements one. Blocking essential cookies may affect site or Service operation.</p>
          <h3>5. Changes</h3>
          <p>We may update this Cookie Policy to reflect technical, legal, or business changes. The current version is the one published on the site.</p>
          <h3>6. Contact</h3>
          <p>Cookie questions: <a href="mailto:privacidad@denario.lat">privacidad@denario.lat</a>.</p>
        </section>

        <section class="legal-doc" id="uso-aceptable">
          <span class="legal-doc__label">Document 05</span>
          <h2>Acceptable Use Policy</h2>
          <h3 class="no-border">1. Purpose</h3>
          <p>This Acceptable Use Policy sets minimum rules to protect Denario, users, third parties, markets, data providers, and infrastructure. It applies to all use of the site, Service, demos, runs, APIs, outputs, and deliverables.</p>
          <h3>2. Prohibited uses</h3>
          <p>The user may not use Denario for:</p>
          <ul>
            <li>Illegal, fraudulent, deceptive, abusive, or unauthorized activities.</li>
            <li>Personalized financial advice, client solicitation, securities promotion, portfolio management, intermediation, order receipt or transmission, or regulated research without required authorizations.</li>
            <li>Market manipulation, misuse of inside information, insider trading, front-running, rumor spreading, pump and dump, spoofing, layering, wash trades, deceptive scalping, or similar practices.</li>
            <li>Automated trading, operative signals, orders, execution alerts, or investment strategies intended to operate without human review and regulatory compliance.</li>
            <li>Uploading inside, confidential, sensitive, or third-party information without authorization.</li>
            <li>Bypassing data licenses, provider restrictions, copyrights, trademarks, trade secrets, or third-party terms.</li>
            <li>Reselling, redistributing, mass publishing, modifying, or commercially exploiting outputs outside the purchased license.</li>
            <li>Developing a competing product through systematic extraction, scraping, reverse engineering, unauthorized benchmarking, or copying workflows, outputs, prompts, designs, or methodology.</li>
            <li>Introducing malware, exploiting vulnerabilities, performing unauthorized intrusion tests, saturating services, evading controls, accessing other accounts, or compromising security.</li>
          </ul>
          <h3>3. Review and suspension</h3>
          <p>Denario may review abuse signals, limit requests, suspend access, reject runs, remove content, cancel accounts, or terminate relationships when there is reasonable suspicion of breach, legal risk, regulatory risk, reputational risk, security risk, or misuse.</p>
          <h3>4. Reports</h3>
          <p>To report misuse, vulnerabilities, or violations, write to <a href="mailto:legal@denario.lat">legal@denario.lat</a> or <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>.</p>
        </section>

        <section class="legal-doc" id="cancelaciones">
          <span class="legal-doc__label">Document 06</span>
          <h2>Cancellation, Withdrawal, Termination, and Refund Policy</h2>
          <h3 class="no-border">1. Scope</h3>
          <p>This policy applies to purchases, subscriptions, plans, paid demos, individual runs, research packages, licenses, enterprise services, and other services offered by Denario, unless a proposal, contract, or applicable law sets different conditions.</p>
          <h3>2. Consumer withdrawal rights</h3>
          <p>When the user contracts as a consumer through digital means and applicable law grants a withdrawal right, Denario will provide a clear channel to exercise it within the legal period. Where required by law, the site must include a visible, direct withdrawal button from the home page.</p>
          <p>To exercise withdrawal, the user must complete the form or write to <a href="mailto:soporte@denario.lat">soporte@denario.lat</a> with name, email, contract date, contracted service, proof, and optional reason. Denario will provide a receipt code or confirmation within the legally required period.</p>
          <h3>3. Subscription cancellation</h3>
          <p>Recurring subscriptions may be cancelled going forward from the account panel, available cancellation button/link, or by writing to <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>. If applicable law requires a cancellation button, Denario must implement it in a visible, accessible, direct place.</p>
          <p>Cancellation does not automatically refund already-started periods and does not necessarily remove already-paid access immediately, unless the plan terms, law, or written agreement say otherwise.</p>
          <h3>4. Executed runs and deliverables</h3>
          <p>Because runs may generate digital, personalized, on-demand deliverables, amounts tied to already executed runs, generated reports, downloaded files, personalized analysis, integrations, setup, consulting, or incurred third-party costs are not refundable unless required by law, caused by a Denario-attributable failure, or agreed in writing.</p>
          <h3>5. Service failures</h3>
          <p>If a run fails due to a Denario-attributable cause and no usable result is delivered, Denario may, depending on the contracted model, retry the run, grant credit, extend limits, replace the deliverable, or refund the specific failed run amount. This does not apply when failure comes from unavailable external data, nonexistent tickers, insufficient information, provider restrictions, misuse, force majeure, or incorrect user instructions.</p>
          <h3>6. Plan changes</h3>
          <p>Upgrades, downgrades, credits, prorations, or plan migrations follow the commercial conditions in force at the time of change. Denario may reject changes designed to bypass usage limits, license restrictions, or accrued payments.</p>
          <h3>7. Enterprise contracts</h3>
          <p>Enterprise contracts, paid pilots, integrations, annual licenses, custom packages, professional services, and B2B agreements are governed by the signed proposal or contract. Unless otherwise agreed in writing, committed payments for business services are not cancellable or refundable once the proposal is accepted or work has started.</p>
          <h3>8. Contact</h3>
          <p>For cancellations, withdrawal, termination, or refunds, write to <a href="mailto:soporte@denario.lat">soporte@denario.lat</a>.</p>
        </section>

        <section class="legal-doc" id="aviso-legal">
          <span class="legal-doc__label">Document 07</span>
          <h2>Site Legal Notice</h2>
          <div class="legal-callout legal-callout--green">
            <p>Denario / DeepFlow is an automated, non-personalized research service. Information published on this site and materials generated by the Service are for informational, educational, and general research purposes only. They are not financial advice, personalized investment recommendations, public offerings, buy/sell solicitations, intermediation, portfolio management, legal, tax, or accounting advice, or guarantees of results.</p>
          </div>
          <p>Financial markets are risky and users may lose part or all invested capital. Models, scenarios, valuation ranges, and target prices are estimates subject to assumptions, errors, delays, and uncertainty. Users must verify all information and consult duly authorized advisers before making decisions.</p>
          <p>Denario does not receive or execute orders, does not custody assets, does not manage portfolios, and does not replace human professional judgment. Use of the site means acceptance of the <a href="#terminos">Terms and Conditions</a>, <a href="#privacidad">Privacy Policy</a>, <a href="#cookies">Cookie Policy</a>, and <a href="#aviso-riesgo">Financial Non-Advice Notice</a>.</p>
        </section>
      </div>
    </div>
  `;

  function normalizeLanguage(value) {
    return String(value || "").toLowerCase().split(/[-_]/)[0] === "en" ? "en" : DEFAULT_LANG;
  }

  function storedLanguage() {
    try {
      const params = new URLSearchParams(window.location.search);
      return normalizeLanguage(params.get("lang") || localStorage.getItem(STORAGE_KEY));
    } catch (_error) {
      return DEFAULT_LANG;
    }
  }

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function setAttrs(selector, attrs) {
    const el = document.querySelector(selector);
    if (!el) return;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  }

  function applyLegalLanguage(language) {
    const lang = normalizeLanguage(language);
    const root = document.querySelector("[data-legal-i18n-root]");
    if (!root) return lang;

    if (!root.dataset.originalHtml) root.dataset.originalHtml = root.innerHTML;
    root.innerHTML = lang === "en" ? EN_LEGAL_HTML : root.dataset.originalHtml;
    document.documentElement.setAttribute("lang", lang);
    document.title = META[lang].title;
    setMeta('meta[name="description"]', META[lang].description);

    const nav = NAV[lang];
    setText('.nav__links a[href="/#producto"]', nav.product);
    setText('.nav__links a[href="/#proceso"]', nav.process);
    setText('.nav__links a[href="/#muestra"]', nav.sample);
    setText('.btn--nav-cta', nav.contact);
    setText(".footer__note", nav.footerNote);
    setText(".footer__legal", nav.footerLegal);
    setAttrs(".profile-button", { "aria-label": nav.profile, title: nav.profile });
    setAttrs("#theme-toggle", { "aria-label": nav.theme });
    setAttrs("#language-toggle", { "aria-label": nav.language || "Change language" });

    document.querySelectorAll("[data-lang-option]").forEach((button) => {
      const active = normalizeLanguage(button.getAttribute("data-lang-option")) === lang;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    return lang;
  }

  function setLanguage(language) {
    const lang = normalizeLanguage(language);
    localStorage.setItem(STORAGE_KEY, lang);
    window.location.reload();
  }

  window.DeepFlowLegalI18n = { applyLegalLanguage, normalizeLanguage, setLanguage };

  const current = applyLegalLanguage(storedLanguage());
  localStorage.setItem(STORAGE_KEY, current);
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.getAttribute("data-lang-option")));
  });
})();
