import React from 'react';
import { Language } from '../i18n/translations';

export type LegalKind = 'terms' | 'privacy' | 'cookies';

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalContent {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

const UPDATED_SV = 'Senast uppdaterad: 12 november 2026';
const UPDATED_EN = 'Last updated: 12 November 2026';

const SV: Record<LegalKind, LegalContent> = {
  terms: {
    title: 'Köpvillkor',
    updated: UPDATED_SV,
    intro:
      'Dessa villkor gäller när du använder SiteScanner Pro och när du köper en Pro-licens. Läs igenom dem innan du använder tjänsten.',
    sections: [
      {
        heading: '1. Om tjänsten',
        paragraphs: [
          'SiteScanner Pro analyserar offentligt tillgängliga webbplatser och sammanställer automatiska rapporter inom SEO, prestanda, säkerhet, tillgänglighet och kodkvalitet.',
          'Rapporterna är vägledande. De ersätter inte en manuell granskning, pen-test, juridisk bedömning eller fullständig tillgänglighetsrevision. Du ansvarar själv för de beslut och ändringar du gör utifrån en rapport.'
        ]
      },
      {
        heading: '2. Pro-licens och betalning',
        paragraphs: [
          'Pro är ett engångsköp på 10,99 EUR som ger en personlig, livslång licens för den aktuella versionen av tjänsten. Betalning sker via Ko-fi.',
          'Licensnyckeln är personlig och får inte delas, säljas vidare eller publiceras. Vi kan spärra en nyckel vid missbruk eller läckage. Om du tappar bort din nyckel kan du kontakta oss med köpbevis.'
        ]
      },
      {
        heading: '3. Tillåten användning',
        paragraphs: [
          'Du får endast skanna webbplatser som du äger eller har uttryckligt tillstånd att analysera. Automatiserad masskanning, kringgående av hastighetsbegränsningar och försök att nå privata eller interna nätverk är förbjudet.',
          'Vi kan stänga av åtkomst vid missbruk, olaglig användning eller försök att störa tjänsten.'
        ]
      },
      {
        heading: '4. Tillgänglighet och garantier',
        paragraphs: [
          'Tjänsten tillhandahålls i befintligt skick. Vi strävar efter hög tillgänglighet men garanterar inte att tjänsten är oavbruten eller felfri. Underhåll, uppdateringar och tekniska problem kan påverka åtkomsten.',
          'Resultat kan variera mellan skanningar eftersom webbplatser, nätverk och tredjepartsdata förändras.'
        ]
      },
      {
        heading: '5. Ansvarsbegränsning',
        paragraphs: [
          'Vi ansvarar inte för indirekta skador, förlorade intäkter eller beslut som fattas utifrån en rapport. Vårt sammanlagda ansvar är begränsat till det belopp du betalat för Pro-licensen.',
          'Inget i dessa villkor begränsar ansvar som inte får begränsas enligt tvingande lag.'
        ]
      },
      {
        heading: '6. Ändringar',
        paragraphs: [
          'Vi kan uppdatera dessa villkor. Väsentliga ändringar publiceras på webbplatsen med nytt datum. Fortsatt användning efter en ändring innebär att du accepterar de uppdaterade villkoren.'
        ]
      },
      {
        heading: '7. Tillämplig lag och kontakt',
        paragraphs: [
          'Dessa villkor styrs av svensk lag. Frågor om köp, licenser eller dessa villkor skickas till bynrnworld@gmail.com.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Integritetspolicy',
    updated: UPDATED_SV,
    intro:
      'Vi behandlar så lite personuppgifter som möjligt. Den här sidan förklarar vad vi samlar in, varför och hur länge.',
    sections: [
      {
        heading: '1. Personuppgiftsansvarig',
        paragraphs: [
          'nRn World ansvarar för behandlingen av personuppgifter i SiteScanner Pro. Kontakt: bynrnworld@gmail.com.'
        ]
      },
      {
        heading: '2. Vilka uppgifter vi behandlar',
        bullets: [
          'Webbadressen till den sida du skannar samt tekniska data som hämtas från sidan.',
          'IP-adress och tekniska förfrågningsuppgifter i samband med hastighetsbegränsning och säkerhet.',
          'Licensnyckel och sessions-token som sparas lokalt i din webbläsare när du aktiverar Pro.',
          'E-postadress och en hash av lösenordet om du skapar ett konto.',
          'Övervakade webbadresser, intervall, poänghistorik och rapportlänkar om du använder övervakning.',
          'En HttpOnly-sessionscookie när du är inloggad.',
          'Namn, e-postadress och meddelande om du använder kontaktformuläret.',
          'Sparade rapporter, inklusive skärmdumpar och fynd, i upp till 30 dagar.'
        ]
      },
      {
        heading: '3. Varför vi behandlar dem',
        bullets: [
          'För att kunna utföra skanningen och visa rapporten.',
          'För att spara rapporten så att en delad länk fungerar och överlever en omladdning.',
          'För att skydda tjänsten mot missbruk och överbelastning.',
          'För att kunna logga in, spara dina övervakade sajter och visa deras historik.',
          'För att kunna svara på support- och kontaktförfrågningar.'
        ]
      },
      {
        heading: '4. Rättslig grund',
        paragraphs: [
          'Behandlingen grundar sig på avtalet med dig när du använder tjänsten, vårt berättigade intresse av att skydda tjänsten samt ditt samtycke när du skickar ett kontaktmeddelande.'
        ]
      },
      {
        heading: '5. Lagringstider',
        bullets: [
          'Sparade rapporter och tillhörande skärmdumpar: upp till 30 dagar.',
          'Serverloggar: kortast tid som behövs för drift och säkerhet.',
          'Licensuppgifter: så länge licensen är aktiv eller tills den spärras.',
          'Kontouppgifter: tills du begär radering; inloggningssessioner löper ut efter 30 dagar.',
          'Övervakningshistorik: tills du tar bort den övervakade sajten.',
          'Kontaktärenden: tills ärendet är avslutat, därefter så länge som krävs enligt lag.'
        ]
      },
      {
        heading: '6. Underleverantörer',
        paragraphs: [
          'Vi använder Render för drift av applikationen, Ko-fi för betalningar och kan använda Google PageSpeed Insights för att hämta Core Web Vitals när en API-nyckel är konfigurerad. Dessa leverantörer behandlar uppgifter enligt sina egna villkor och dataskyddsavtal.',
          'Vi säljer inte personuppgifter och använder dem inte för reklam.'
        ]
      },
      {
        heading: '7. Dina rättigheter',
        paragraphs: [
          'Du har rätt att begära tillgång till, rättelse eller radering av dina personuppgifter, att begränsa behandlingen och att invända mot den. Du kan också begära dataportabilitet.',
          'Om du anser att vi behandlar uppgifter felaktigt kan du klaga hos Integritetsskyddsmyndigheten (IMY) eller din lokala dataskyddsmyndighet.'
        ]
      },
      {
        heading: '8. Kontakt',
        paragraphs: [
          'Skicka frågor om integritet och dataskydd till bynrnworld@gmail.com. Vi svarar så snart vi kan.'
        ]
      }
    ]
  },
  cookies: {
    title: 'Cookies och lokal lagring',
    updated: UPDATED_SV,
    intro:
      'SiteScanner Pro använder inga spårningscookies och ingen tredjepartsannonsering. Vi använder en nödvändig sessionscookie när du loggar in och lokal lagring i webbläsaren för att tjänsten ska fungera.',
    sections: [
      {
        heading: '1. Cookies',
        paragraphs: [
          'När du loggar in sätter vi en nödvändig HttpOnly-cookie (ssp_session) för att hålla dig inloggad. Den används inte för analys, annonsering eller profilering. När du går vidare till Ko-fi för betalning kan Ko-fi sätta cookies enligt sina egna villkor.'
        ]
      },
      {
        heading: '2. Lokal lagring i din webbläsare',
        bullets: [
          'siteScannerLanguage – sparar ditt språkval.',
          'siteScannerHistory – sparar dina senaste skanningar lokalt.',
          'siteScannerLicenseToken – sparar din Pro-session så att du slipper aktivera nyckeln varje gång.',
          'siteScannerVipSession – markerar en pågående VIP-session.'
        ]
      },
      {
        heading: '3. Varför lokal lagring behövs',
        paragraphs: [
          'Utan lokal lagring skulle språkval, historik och Pro-aktivering försvinna varje gång du laddar om sidan. Uppgifterna stannar i din webbläsare och skickas inte till oss om du inte aktivt använder en funktion som kräver dem.'
        ]
      },
      {
        heading: '4. Så rensar du uppgifterna',
        paragraphs: [
          'Du kan rensa lokal lagring via webbläsarens inställningar för webbplatsdata. Om du rensar Pro-token behöver du aktivera din licensnyckel igen.'
        ]
      }
    ]
  }
};

const EN: Record<LegalKind, LegalContent> = {
  terms: {
    title: 'Terms of Service',
    updated: UPDATED_EN,
    intro:
      'These terms apply when you use SiteScanner Pro and when you purchase a Pro licence. Please read them before using the service.',
    sections: [
      {
        heading: '1. The service',
        paragraphs: [
          'SiteScanner Pro analyses publicly available websites and produces automated reports covering SEO, performance, security, accessibility and code quality.',
          'Reports are guidance, not a substitute for manual review, penetration testing, legal advice or a full accessibility audit. You are responsible for the decisions and changes you make based on a report.'
        ]
      },
      {
        heading: '2. Pro licence and payment',
        paragraphs: [
          'Pro is a one-time purchase of EUR 10.99 granting a personal, lifetime licence for the current version of the service. Payment is handled by Ko-fi.',
          'The licence key is personal and may not be shared, resold or published. We may revoke a key in case of abuse or leakage. If you lose your key, contact us with proof of purchase.'
        ]
      },
      {
        heading: '3. Acceptable use',
        paragraphs: [
          'You may only scan websites that you own or have explicit permission to analyse. Automated mass scanning, bypassing rate limits and attempts to reach private or internal networks are prohibited.',
          'We may suspend access in case of abuse, unlawful use or attempts to disrupt the service.'
        ]
      },
      {
        heading: '4. Availability and warranties',
        paragraphs: [
          'The service is provided as is. We aim for high availability but do not guarantee uninterrupted or error-free operation. Maintenance, updates and technical issues may affect access.',
          'Results may vary between scans because websites, networks and third-party data change.'
        ]
      },
      {
        heading: '5. Limitation of liability',
        paragraphs: [
          'We are not liable for indirect damages, lost revenue or decisions made based on a report. Our total liability is limited to the amount you paid for the Pro licence.',
          'Nothing in these terms limits liability that cannot be limited under mandatory law.'
        ]
      },
      {
        heading: '6. Changes',
        paragraphs: [
          'We may update these terms. Material changes are published on the website with a new date. Continued use after a change means you accept the updated terms.'
        ]
      },
      {
        heading: '7. Governing law and contact',
        paragraphs: [
          'These terms are governed by Swedish law. Questions about purchases, licences or these terms can be sent to bynrnworld@gmail.com.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    updated: UPDATED_EN,
    intro:
      'We process as little personal data as possible. This page explains what we collect, why and for how long.',
    sections: [
      {
        heading: '1. Data controller',
        paragraphs: [
          'nRn World is the controller of personal data processed by SiteScanner Pro. Contact: bynrnworld@gmail.com.'
        ]
      },
      {
        heading: '2. What we process',
        bullets: [
          'The URL of the page you scan and technical data retrieved from that page.',
          'IP address and technical request data used for rate limiting and security.',
          'The licence key and session token stored locally in your browser when you activate Pro.',
          'Email address and a password hash if you create an account.',
          'Monitored URLs, intervals, score history and report links if you use monitoring.',
          'An HttpOnly session cookie while you are signed in.',
          'Name, email address and message if you use the contact form.',
          'Saved reports, including screenshots and findings, for up to 30 days.'
        ]
      },
      {
        heading: '3. Why we process it',
        bullets: [
          'To perform the scan and display the report.',
          'To save the report so a shared link works and survives a page reload.',
          'To protect the service against abuse and overload.',
          'To sign you in, save your monitored sites and show their history.',
          'To respond to support and contact requests.'
        ]
      },
      {
        heading: '4. Legal basis',
        paragraphs: [
          'Processing is based on our contract with you when you use the service, our legitimate interest in protecting the service, and your consent when you send a contact message.'
        ]
      },
      {
        heading: '5. Retention',
        bullets: [
          'Saved reports and screenshots: up to 30 days.',
          'Server logs: the shortest period needed for operations and security.',
          'Licence data: while the licence is active or until it is revoked.',
          'Account data: until you request deletion; sign-in sessions expire after 30 days.',
          'Monitoring history: until you remove the monitored site.',
          'Contact cases: until the case is closed, then as long as required by law.'
        ]
      },
      {
        heading: '6. Subprocessors',
        paragraphs: [
          'We use Render to host the application, Ko-fi for payments, and may use Google PageSpeed Insights to retrieve Core Web Vitals when an API key is configured. These providers process data under their own terms and data processing agreements.',
          'We do not sell personal data and do not use it for advertising.'
        ]
      },
      {
        heading: '7. Your rights',
        paragraphs: [
          'You may request access to, correction or deletion of your personal data, restrict processing and object to it. You may also request data portability.',
          'If you believe we process data incorrectly, you can complain to the Swedish Authority for Privacy Protection (IMY) or your local data protection authority.'
        ]
      },
      {
        heading: '8. Contact',
        paragraphs: [
          'Send privacy and data protection questions to bynrnworld@gmail.com. We reply as soon as we can.'
        ]
      }
    ]
  },
  cookies: {
    title: 'Cookies and local storage',
    updated: UPDATED_EN,
    intro:
      'SiteScanner Pro does not use tracking cookies or third-party advertising. We use a necessary session cookie when you sign in and browser local storage so the service can work.',
    sections: [
      {
        heading: '1. Cookies',
        paragraphs: [
          'When you sign in, we set a necessary HttpOnly cookie (ssp_session) to keep you signed in. It is not used for analytics, advertising or profiling. When you continue to Ko-fi for payment, Ko-fi may set cookies under its own policy.'
        ]
      },
      {
        heading: '2. Local storage in your browser',
        bullets: [
          'siteScannerLanguage – stores your language choice.',
          'siteScannerHistory – stores your recent scans locally.',
          'siteScannerLicenseToken – stores your Pro session so you do not need to activate the key every time.',
          'siteScannerVipSession – marks an active VIP session.'
        ]
      },
      {
        heading: '3. Why local storage is needed',
        paragraphs: [
          'Without local storage, your language choice, history and Pro activation would disappear on every page reload. The data stays in your browser and is only sent to us when you actively use a feature that requires it.'
        ]
      },
      {
        heading: '4. How to clear it',
        paragraphs: [
          'You can clear local storage from your browser settings for site data. If you clear the Pro token, you will need to activate your licence key again.'
        ]
      }
    ]
  }
};

interface LegalPageProps {
  kind: LegalKind;
  language: Language;
}

const LegalPage: React.FC<LegalPageProps> = ({ kind, language }) => {
  const content = (language === 'sv' ? SV : EN)[kind];

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      <header className="space-y-3 border-b-2 border-ink pb-5">
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase leading-none">
          {content.title}
        </h1>
        <p className="font-mono text-xs text-ink/50 uppercase tracking-wider">{content.updated}</p>
        {content.intro && (
          <p className="font-mono text-sm text-ink/70 leading-relaxed">{content.intro}</p>
        )}
      </header>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-xl font-display font-bold uppercase tracking-wide">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="font-mono text-sm text-ink/70 leading-relaxed">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 space-y-1.5 font-mono text-sm text-ink/70 leading-relaxed">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="font-mono text-xs text-ink/40 border-t border-ink/10 pt-4">
        SiteScanner Pro · nRn World · bynrnworld@gmail.com
      </p>
    </article>
  );
};

export default LegalPage;
