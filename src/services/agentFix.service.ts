import type { ScannerIssue, Severity, AgentFix } from '../rules/types';
import type { Language } from '../i18n/translations';

export type { AgentFix };

function priorityFromSeverity(severity: Severity): AgentFix['priority'] {
  switch (severity) {
    case 'High': return 'critical';
    case 'Medium': return 'high';
    default: return 'medium';
  }
}

function extractMs(text: string): number | null {
  const m = text.match(/(\d+)\s*ms/i);
  return m ? Number(m[1]) : null;
}

function extractCount(text: string): number | null {
  const m = text.match(/(\d+)\s+(?:DOM|bilder|images|fält|fields|länkar|links|förekomst|noder|nodes|script|element)/i)
    ?? text.match(/^(\d+)\s/);
  return m ? Number(m[1]) : null;
}

type FixBuilder = (issue: ScannerIssue) => Partial<Pick<AgentFix, 'goal' | 'steps' | 'code_changes' | 'acceptance_criteria' | 'do_not'>>;

const BUILDERS: Array<{ match: RegExp; build: FixBuilder }> = [
  {
    match: /långsam svarstid|slow response time|långsam ttfb|slow ttfb|ttfb can be improved|förbättringsbar ttfb/i,
    build: (issue) => {
      const ms = extractMs(issue.description) ?? 0;
      return {
        goal: `Sänk serverns svarstid (TTFB/load) till under 800 ms (nu ~${ms || '?'} ms).`,
        steps: [
          {
            order: 1,
            action: 'investigate',
            target: 'server/network',
            instruction: 'Mät TTFB med curl: curl -o /dev/null -s -w "ttfb:%{time_starttransfer}\\n" URL',
            verify: 'Bekräfta aktuell TTFB i ms'
          },
          {
            order: 2,
            action: 'configure',
            target: 'cache/CDN',
            instruction: 'Aktivera HTTP-cache (Cache-Control) för statiska assets och HTML där det är säkert. Koppla CDN (Cloudflare/Fastly/Vercel Edge) framför origin.',
            verify: 'Cache-Control syns i response headers för statiska filer'
          },
          {
            order: 3,
            action: 'optimize',
            target: 'backend',
            instruction: 'Optimera långsamma DB-frågor, undvik N+1, lägg till serverside-caching (Redis/in-memory) för tunga endpoints, och se till att SSR/SSG inte blockerar onödigt.',
            verify: 'TTFB < 800 ms på upprepade anrop'
          },
          {
            order: 4,
            action: 'verify',
            target: 'site',
            instruction: 'Kör om SiteScanner / PageSpeed och jämför TTFB före/efter.',
            verify: 'TTFB under 800 ms och "Långsam svarstid"/"Långsam TTFB" försvinner'
          }
        ],
        code_changes: [
          {
            type: 'config',
            language: 'nginx',
            file_hint: 'nginx.conf eller host-plattformens cache-inställningar',
            after: 'location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {\n  expires 30d;\n  add_header Cache-Control "public, max-age=2592000, immutable";\n}',
            notes: 'Anpassa till er webbserver (Nginx, Apache, Vercel headers, Cloudflare Cache Rules).'
          },
          {
            type: 'config',
            language: 'http',
            file_hint: 'response headers för HTML om cache är OK',
            after: 'Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
          }
        ],
        acceptance_criteria: [
          `TTFB under 800 ms (tidigare ~${ms || 'hög'} ms)`,
          'Inga High-severity "Långsam svarstid" / "Långsam TTFB" kvar i ny skanning'
        ],
        do_not: [
          'Cacha personliga/auth-sidor offentligt',
          'Dölj problemet genom att bara höja timeouts'
        ]
      };
    }
  },
  {
    match: /för många dom-element|too many dom elements/i,
    build: (issue) => {
      const nodes = extractCount(issue.description) ?? 0;
      return {
        goal: `Minska DOM-storleken till under 1500 noder (nu ${nodes || '?'}).`,
        steps: [
          {
            order: 1,
            action: 'investigate',
            target: 'DOM',
            instruction: 'Öppna DevTools → Elements och identifiera djupa wrapper-divs, upprepade listor och dolda sektioner som fortfarande renderas.',
            verify: `document.querySelectorAll('*').length ska ner från ${nodes || 'nuvarande'} mot < 1500`
          },
          {
            order: 2,
            action: 'replace',
            target: 'listor/grids',
            instruction: 'Virtualisera långa listor (t.ex. react-window / tanstack-virtual) så att bara synliga rader finns i DOM.',
            verify: 'Långa listor renderar bara synliga items'
          },
          {
            order: 3,
            action: 'remove',
            target: 'markup',
            instruction: 'Ta bort onödiga wrapper-element (<div> i <div> i <div>) och undvik att mounta dolda tabs/modals tills de öppnas.',
            verify: 'DOM-nodantal < 1500 på startsidan'
          }
        ],
        code_changes: [
          {
            type: 'replace',
            language: 'tsx',
            file_hint: 'Komponenter som renderar långa listor',
            before: '{items.map(item => <Row key={item.id} ... />)}',
            after: '<VirtualList items={items} rowHeight={48} renderRow={(item) => <Row ... />} />',
            notes: 'Använd projektets befintliga virtualiseringsbibliotek om det finns.'
          }
        ],
        acceptance_criteria: [
          'DOM-noder < 1500 på den skannade sidan',
          'Inga visuella regressioner i listor/navigation'
        ],
        do_not: ['Göm innehåll med display:none utan att ta bort det från DOM om målet är nodminskning']
      };
    }
  },
  {
    match: /bilder utan dimensioner|images without dimensions|cls-risk|cls risk/i,
    build: (issue) => ({
      goal: 'Ge alla <img> explicita width/height (eller CSS aspect-ratio) för att undvika CLS.',
      steps: [
        {
          order: 1,
          action: 'investigate',
          target: 'img',
          instruction: 'Hitta alla img utan width/height: document.querySelectorAll("img:not([width]), img:not([height]").',
          verify: 'Lista berörda bilder'
        },
        {
          order: 2,
          action: 'add',
          target: 'img attributes',
          instruction: 'Sätt width och height till bildens intrinsiska pixelstorlek, eller aspect-ratio i CSS.',
          verify: 'Inga img saknar dimensioner; CLS förbättras'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Templates/komponenter med <img>',
          selector: issue.selector,
          before: issue.codeSnippet ?? '<img src="hero.jpg" alt="...">',
          after: '<img src="hero.jpg" alt="..." width="1200" height="630" loading="lazy">'
        }
      ],
      acceptance_criteria: [
        'Alla content-bilder har width+height eller aspect-ratio',
        'CLS-varning försvinner eller förbättras tydligt'
      ],
      do_not: ['Sätt felaktiga proportioner som sträcker bilden']
    })
  },
  {
    match: /äldre bildformat|legacy image formats/i,
    build: () => ({
      goal: 'Konvertera JPEG/PNG till WebP/AVIF med fallback via <picture>.',
      steps: [
        {
          order: 1,
          action: 'optimize',
          target: 'image assets',
          instruction: 'Konvertera stora JPEG/PNG till AVIF + WebP (t.ex. sharp, squoosh, CDN image transform).',
          verify: 'Nya .webp/.avif-filer finns och är mindre'
        },
        {
          order: 2,
          action: 'replace',
          target: 'img markup',
          instruction: 'Byt till <picture> med AVIF/WebP source och JPEG/PNG fallback.',
          verify: 'Nätverkspanelen visar modern format där browser stöder det'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Bildkomponenter / HTML',
          before: '<img src="/images/hero.jpg" alt="Hero">',
          after: '<picture>\n  <source srcset="/images/hero.avif" type="image/avif">\n  <source srcset="/images/hero.webp" type="image/webp">\n  <img src="/images/hero.jpg" alt="Hero" width="1200" height="630" loading="lazy">\n</picture>'
        }
      ],
      acceptance_criteria: [
        'Majoriteten av content-bilder serveras som WebP/AVIF',
        'Fallback fungerar i äldre webbläsare'
      ],
      do_not: ['Ta bort fallback helt om ni fortfarande stödjer äldre browsers']
    })
  },
  {
    match: /trasiga css\/js|broken css\/js|trasiga länkar|broken links|trasiga bilder|broken images|misslyckade nätverks|failed network|aldrig slutfördes|never completed/i,
    build: (issue) => ({
      goal: 'Fixa eller ta bort trasiga resurs-URL:er så att alla kritiska requests returnerar 2xx.',
      steps: [
        {
          order: 1,
          action: 'investigate',
          target: issue.codeSnippet ?? 'broken URL',
          instruction: `Öppna/verifiera den trasiga URL:en: ${issue.codeSnippet ?? '(se description)'}. Kontrollera statuskod, CORS och om filen flyttats.`,
          verify: 'Statuskod och felorsak känd'
        },
        {
          order: 2,
          action: 'replace',
          target: 'href/src',
          instruction: 'Uppdatera src/href till korrekt sökväg, eller ta bort referensen om resursen inte behövs.',
          verify: 'Request ger 200/304 i Network-fliken'
        },
        {
          order: 3,
          action: 'verify',
          target: 'site',
          instruction: 'Ladda om sidan i mobil- och desktopvy och bekräfta att inga failed requests återstår för kritiska assets.',
          verify: 'Inga röda failed requests för CSS/JS/bilder i Network'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Template/komponent som refererar resursen',
          before: issue.codeSnippet ?? null,
          after: null,
          notes: 'Ersätt med korrekt absolut eller relativ URL, eller ta bort taggen.'
        }
      ],
      acceptance_criteria: [
        'Inga 4xx/5xx för CSS/JS/kritiska bilder',
        'Layout och funktionalitet intakt efter fix'
      ],
      do_not: ['Ignorera 404 genom att fånga fel i JS utan att laga URL:en']
    })
  },
  {
    match: /saknad title|missing title|för kort sidtitel|title too short|för lång sidtitel|title too long/i,
    build: (issue) => ({
      goal: 'Sätt en unik, beskrivande <title> på 50–60 tecken.',
      steps: [
        {
          order: 1,
          action: 'replace',
          target: 'head > title',
          instruction: 'Uppdatera <title> med primärt sökord + varumärke, 50–60 tecken.',
          verify: 'document.title längd 50–60'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: '<head> i layout/template',
          before: null,
          after: issue.codeSnippet ?? '<title>Primärt sökord – Varumärke</title>'
        }
      ],
      acceptance_criteria: ['Title finns och är 50–60 tecken'],
      do_not: ['Duplicera samma title på alla sidor']
    })
  },
  {
    match: /meta description|metabeskrivning/i,
    build: (issue) => ({
      goal: 'Sätt unik meta description på 120–160 tecken.',
      steps: [
        {
          order: 1,
          action: 'add',
          target: 'head meta[name=description]',
          instruction: 'Lägg till eller uppdatera meta description med lockande text och sökord.',
          verify: 'Meta description längd 120–160'
        }
      ],
      code_changes: [
        {
          type: issue.title.toLowerCase().includes('saknad') ? 'add' : 'replace',
          language: 'html',
          file_hint: '<head>',
          after: issue.codeSnippet ?? '<meta name="description" content="Beskrivning på 120–160 tecken.">'
        }
      ],
      acceptance_criteria: ['Meta description finns och är 120–160 tecken'],
      do_not: ['Keyword-stappa description']
    })
  },
  {
    match: /viewport/i,
    build: (issue) => ({
      goal: 'Lägg till viewport-meta för responsiv mobilvy.',
      steps: [
        {
          order: 1,
          action: 'add',
          target: 'head',
          instruction: 'Infoga viewport-meta tidigt i <head>.',
          verify: 'meta[name=viewport] finns'
        }
      ],
      code_changes: [
        {
          type: 'add',
          language: 'html',
          file_hint: '<head>',
          after: issue.codeSnippet ?? '<meta name="viewport" content="width=device-width, initial-scale=1">'
        }
      ],
      acceptance_criteria: ['Viewport-meta finns', 'Mobil layout skalar korrekt'],
      do_not: ['Använd user-scalable=no utan stark anledning']
    })
  },
  {
    match: /alt-text|saknade alt|missing alt/i,
    build: (issue) => ({
      goal: 'Lägg till beskrivande alt på alla meningsfulla bilder (tom alt="" endast för dekorativa).',
      steps: [
        {
          order: 1,
          action: 'add',
          target: 'img[alt]',
          instruction: 'Gå igenom img utan alt och sätt beskrivande text, eller alt="" för rent dekorativa bilder.',
          verify: 'Inga img saknar alt-attribut'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Bildkomponenter',
          selector: issue.selector,
          before: issue.codeSnippet ?? '<img src="...">',
          after: '<img src="..." alt="Kort beskrivning av bilden">'
        }
      ],
      acceptance_criteria: ['Alla img har alt-attribut'],
      do_not: ['Sätt meningslösa alt som "bild" eller filnamn']
    })
  },
  {
    match: /content-security-policy|csp/i,
    build: (issue) => ({
      goal: 'Inför en Content-Security-Policy som begränsar script-/style-källor.',
      steps: [
        {
          order: 1,
          action: 'configure',
          target: 'HTTP headers',
          instruction: 'Lägg till CSP-header på servern/CDN. Börja i Report-Only om ni vill testa.',
          verify: 'content-security-policy syns i response headers'
        }
      ],
      code_changes: [
        {
          type: 'config',
          language: 'http',
          file_hint: 'Server/CDN response headers',
          after: issue.codeSnippet ?? "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
      ],
      acceptance_criteria: ['CSP-header finns', 'Sidan fungerar utan konsolblockeringar (eller bara förväntade reports)'],
      do_not: ["Lämna script-src 'unsafe-inline' 'unsafe-eval' permanent utan plan"]
    })
  },
  {
    match: /render-blockerande javascript|render-blocking javascript|defer|async/i,
    build: (issue) => ({
      goal: 'Gör externa script icke-blockerande med defer eller async.',
      steps: [
        {
          order: 1,
          action: 'replace',
          target: 'script[src]',
          instruction: 'Lägg till defer på app-script (behåll ordning) eller async på oberoende tredjepart.',
          verify: 'Inga script[src] i <head> utan defer/async (förutom kritiska undantag)'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Layout / index.html',
          before: issue.codeSnippet ?? '<script src="app.js"></script>',
          after: '<script src="app.js" defer></script>'
        }
      ],
      acceptance_criteria: ['Kritiska script använder defer/async', 'Ingen regression i app-init'],
      do_not: ['Sätt async på script som måste köras i ordning']
    })
  }
];

function defaultBuilder(issue: ScannerIssue): ReturnType<FixBuilder> {
  const hasSnippet = !!issue.codeSnippet;
  return {
    goal: issue.recommendation ?? `Åtgärda problemet: ${issue.title}`,
    steps: [
      {
        order: 1,
        action: 'investigate',
        target: issue.selector ?? issue.category,
        instruction: `Läs problemet: "${issue.description}". Lokalisera orsaken i kodbasen${issue.selector ? ` via selector ${issue.selector}` : ''}.`,
        verify: 'Rotorsak identifierad'
      },
      {
        order: 2,
        action: hasSnippet ? 'replace' : 'optimize',
        target: issue.selector ?? 'relevant file',
        instruction: issue.recommendation ?? 'Applicera rekommenderad åtgärd i koden.',
        verify: 'Ändringen är implementerad'
      },
      {
        order: 3,
        action: 'verify',
        target: 'site',
        instruction: 'Verifiera i webbläsare och kör om SiteScanner så att samma issue inte återstår.',
        verify: `Issue "${issue.title}" borta eller tydligt förbättrad`
      }
    ],
    code_changes: hasSnippet
      ? [
          {
            type: 'replace',
            language: guessLanguage(issue.codeSnippet!),
            file_hint: issue.selector ? `Element: ${issue.selector}` : 'Relevant template/komponent',
            selector: issue.selector,
            before: null,
            after: issue.codeSnippet!,
            notes: 'Använd snippeten som målkod / referens.'
          }
        ]
      : [],
    acceptance_criteria: [
      `Problemet "${issue.title}" är åtgärdat`,
      'Ingen ny regression i samma kategori'
    ],
    do_not: [
      'Ignorera acceptance_criteria',
      'Gör breda refactors utanför issue-scope'
    ]
  };
}

function guessLanguage(snippet: string): string {
  if (/^\s*</.test(snippet)) return 'html';
  if (/Cache-Control|Content-Security|Strict-Transport|X-Frame/i.test(snippet)) return 'http';
  if (/^\s*{/.test(snippet) || /"@context"/.test(snippet)) return 'json';
  if (/function|const |let |=>/.test(snippet)) return 'javascript';
  return 'text';
}

export function buildAgentFix(issue: ScannerIssue, language?: Language): AgentFix {
  const builder = BUILDERS.find((b) => b.match.test(issue.title))?.build ?? defaultBuilder;
  const partial = builder(issue);
  const lang = language === 'sv' ? 'sv' : 'en';

  return {
    schema_version: '1.0',
    role: 'coding_agent',
    language: lang,
    issue: {
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      device: issue.device ?? 'both',
      summary: issue.description,
      source: issue.source
    },
    goal: partial.goal ?? issue.recommendation ?? issue.title,
    priority: priorityFromSeverity(issue.severity),
    constraints: lang === 'sv'
      ? [
          'Gör minsta möjliga ändring som löser just detta issue',
          'Behåll befintlig design/UX om inte issue kräver annat',
          'Följ steps i ordning och stanna när acceptance_criteria är uppfyllda',
          'Om code_changes.after finns: använd den som konkret målkod'
        ]
      : [
          'Make the smallest change that fixes this exact issue',
          'Keep existing design/UX unless the issue requires otherwise',
          'Follow steps in order and stop when acceptance_criteria are met',
          'If code_changes.after exists: treat it as the concrete target code'
        ],
    steps: partial.steps ?? [],
    code_changes: partial.code_changes ?? [],
    acceptance_criteria: partial.acceptance_criteria ?? [],
    do_not: partial.do_not ?? []
  };
}

export function attachAgentFixes(issues: ScannerIssue[], language?: Language): ScannerIssue[] {
  return issues.map((issue) => ({
    ...issue,
    agentFix: buildAgentFix(issue, language)
  }));
}

export function agentFixToJson(fix: AgentFix): string {
  return JSON.stringify(fix, null, 2);
}
