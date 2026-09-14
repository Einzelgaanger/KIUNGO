export type WalkthroughStep = {
  id: string;
  personaId: string;
  href: string;
  title: string;
  do: string;
  lookFor: string[];
  note?: string;
};

export type Walkthrough = {
  slug: string;
  index: string;
  minutes: string;
  title: string;
  person: string;
  role: string;
  promise: string;
  setup: string;
  outcome: string;
  steps: WalkthroughStep[];
};

export const WALKTHROUGHS: Walkthrough[] = [
  {
    slug: "amina-delivery",
    index: "01",
    minutes: "9 min",
    title: "Amina reports a delivery",
    person: "Amina Wanjiru",
    role: "Supplier · Kariobangi Metal Works",
    promise:
      "A youth- and women-owned fabricator in Nairobi submits evidence at Mukuru. A site officer approves it. Settlement and reliability follow the work — not a form.",
    setup:
      "Work as Amina, then as Daniel the site officer, then Amina again to read the receipt. Send the WhatsApp delivery once. Daniel must still approve it on Review.",
    outcome:
      "A claim exists, a reviewer has decided, Amina can open the receipt, and finance can price her on evidenced work.",
    steps: [
      {
        id: "find-herself",
        personaId: "user-amina",
        href: "/registry?q=Kariobangi&county=047&category=FABRICATOR&ownership=YOUTH",
        title: "Find her on the live registry",
        do: "You are Amina. The registry is already filtered to Nairobi · Fabricator · Youth, with search “Kariobangi”. Open Kariobangi Metal Works Ltd — not a neighbouring workshop with a similar name.",
        lookFor: [
          "Legal name Kariobangi Metal Works Ltd, category Fabricator, county Nairobi",
          "Verification badge Verified — this is identity, not a directory listing",
          "Ownership chips Youth, Women and Jua Kali",
          "A reliability score computed from her delivery history (this file typically shows around 73, not a typed-in 78)",
        ],
      },
      {
        id: "read-profile",
        personaId: "user-amina",
        href: "/registry/kariobangi-metal-works",
        title: "Read the entity file",
        do: "Stay on the profile. Scroll the reliability block, the certification table (authority, scheme, expiry), the map of site pins, and the delivery history. This is what a contractor or a financier sees before they transact.",
        lookFor: [
          "Capability and history that include steel door frame 900mm",
          "Site pins that include Mukuru Phase 2",
          "Certificates with an issuing authority (KEBS or MSEA) and an expiry date",
          "Evidenced deliveries with claim refs — not self-reported volume",
        ],
      },
      {
        id: "whatsapp-play",
        personaId: "user-amina",
        href: "/whatsapp",
        title: "Submit from WhatsApp",
        do: "Press Send this delivery once. Do not mash it. The chat walks contract AHP/MKR/2026/0142, quantity 40, a delivery photo, and a GPS pin 84 m from Mukuru Phase 2. Wait until a claim reference appears.",
        lookFor: [
          "Edge checks: EXIF, timestamp, duplicate hash, quantity within balance (40 ≤ remaining)",
          "On a wide screen, Show checks lists POST /claims, geo.resolve → mukuru-phase-2, drift=84m",
          "A claim reference (CLM-2026-…) when the write succeeds — note it, you will hunt it next",
        ],
        note: "The chat will say the claim is queued. Live approval is the next step. Live value is typically 1.10 / KSh 213,400.",
      },
      {
        id: "daniel-queue",
        personaId: "user-daniel",
        href: "/review",
        title: "Daniel works the queue",
        do: "You are now Daniel Kiptoo, site officer. The left list is grouped by site, oldest claims first. Open the Mukuru Phase 2 group. Find Kariobangi Metal Works · steel door frame 900mm · 40 units — that is the WhatsApp write. Select the row. Press A to approve (or the on-screen Approve control).",
        lookFor: [
          "Photo, GPS drift in metres, and pass/fail chips — chips are checks, not claim status",
          "Keyboard: J/K move the list, A approve, Q query, R reject. Query and reject need a comment",
          "Approve selected stays disabled when a hard fail is in the selection — that is intentional",
        ],
        note: "If the queue is long, use the site filter “Mukuru Phase 2”. Seeded Kariobangi rows may already sit in the queue; the WhatsApp one is quantity 40 on the door-frame line.",
      },
      {
        id: "amina-receipt",
        personaId: "user-amina",
        href: "/console/claims",
        title: "Amina reads the receipt",
        do: "Switch back to Amina. This list is newest first — the opposite of Daniel’s queue. Open the top row if you just played WhatsApp, or search the ref you noted. This is the settlement receipt the supplier actually sees.",
        lookFor: [
          "Status past Queued once Daniel decided (Approved, then Settled after the engine runs)",
          "Quality multiplier from the live engine (typically 1.10 on this door-frame example, not the chat’s 1.05)",
          "Split 80 / 10 / 10 and the supplier share (typically KSh 170,720 of KSh 213,400)",
        ],
      },
      {
        id: "amina-finance",
        personaId: "user-amina",
        href: "/finance",
        title: "Credit priced off work",
        do: "Still as Amina, open Finance. Products unlock from verified identity plus the computed score — not from a Nairobi form. Note what is under Available to you, then read Not yet available.",
        lookFor: [
          "Header: verified deliveries and a reliability number, not a blank KYC card",
          "An application already in review: Supplier Invoice Advance · KSh 420,000",
          "The contrast you will meet in Peter’s walkthrough: same product class, pending identity",
        ],
      },
    ],
  },
  {
    slug: "grace-discover",
    index: "02",
    minutes: "4 min",
    title: "Grace finds a verified fabricator",
    person: "Grace Njeri",
    role: "Contractor · Sample Builders · Mukuru",
    promise:
      "A main contractor does not pick a supplier from a PDF. She searches a verified registry, reads certifications and reliability, then looks at the site those deliveries already serve.",
    setup:
      "You are Grace. You need steel door frames into Mukuru Phase 2. You will use the same registry a citizen or a financier would hit — then open the site you run.",
    outcome: "You can explain why Kariobangi is selectable and an unverified workshop is not.",
    steps: [
      {
        id: "filter-registry",
        personaId: "user-grace",
        href: "/registry?county=047&category=FABRICATOR&verification=VERIFIED&ownership=YOUTH",
        title: "Filter like a buyer",
        do: "County Nairobi, category Fabricator, verification Verified, ownership Youth. Toggle Grid and Table so a reviewer sees both surfaces. Open Kariobangi Metal Works Ltd.",
        lookFor: [
          "Filters stack in the URL — this is a registry query, not a marketing page",
          "Unverified names drop out when Verified is on",
          "Grid cards and the table are the same records, different density",
        ],
      },
      {
        id: "inspect-file",
        personaId: "user-grace",
        href: "/registry/kariobangi-metal-works",
        title: "Inspect before you invite",
        do: "Read capability, certifications, reliability and evidenced deliveries into Mukuru. Invite to quote adds them to your shortlist — it is a request, not a contract award.",
        lookFor: [
          "Issuing authority and expiry on each certificate",
          "Delivery history you could defend in an audit",
          "Invite to quote on the profile — shortlist, not a contract rewrite",
        ],
      },
      {
        id: "her-site",
        personaId: "user-grace",
        href: "/sites/mukuru-phase-2",
        title: "Open the site she runs",
        do: "Open Mukuru Phase 2. This is Grace’s site. Use the tabs: Overview, Suppliers, Claims, Contracts. Kariobangi is on the supplier list because the door-frame contract is live.",
        lookFor: [
          "Programme name, county Nairobi, units complete vs planned",
          "Map pin for the site — the same pin geo-resolution uses for Daniel’s queue",
          "Suppliers and claims that include Kariobangi Metal Works",
        ],
      },
    ],
  },
  {
    slug: "daniel-review",
    index: "03",
    minutes: "5 min",
    title: "Daniel clears a site queue",
    person: "Daniel Kiptoo",
    role: "Reviewer · Affordable Housing Board",
    promise:
      "A site officer does not “trust the photo”. The queue is geo-routed, edge-checked, and decided with a keyboard.",
    setup:
      "You are Daniel. Claims from WhatsApp and web land here after edge checks. The list is oldest-first, grouped by site. If you just sent Amina’s WhatsApp delivery, decide that 40-unit door-frame row.",
    outcome:
      "You can approve, query or reject with evidence on screen, and you know why batch approve sometimes refuses.",
    steps: [
      {
        id: "open-queue",
        personaId: "user-daniel",
        href: "/review",
        title: "Open the queue",
        do: "You are Daniel. Click a row in the left list. The right pane is the evidence pack: photo, pin, drift, checks. Change the site / age / check / verification filters — they only reshape this list, they do not hide the decision.",
        lookFor: [
          "Groups by site name, with a waiting count on each header",
          "Age dots: grey under 24h, gold over 24h, clay over 48h (clock is 9 Sep 2026)",
          "Pass/fail chips on the evidence pack — checks, not claim status",
        ],
      },
      {
        id: "decide",
        personaId: "user-daniel",
        href: "/review",
        title: "Decide one claim",
        do: "Select a Queued or Edge-checked claim. Press A to approve. To query, press Q and type a comment first. To see the hard-fail lock: tick a row whose check dots include clay, then look at Approve selected.",
        lookFor: [
          "A / Q / R on the keyboard; J / K move without a mouse",
          "Approve selected disabled, with copy that a hard check failed",
          "After approve, the row leaves this queue and the count drops",
        ],
        note: "If you just sent Amina’s WhatsApp delivery, her new claim is Kariobangi · 40 units · steel door frame under Mukuru Phase 2.",
      },
      {
        id: "site-page",
        personaId: "user-daniel",
        href: "/sites/mukuru-phase-2",
        title: "See the site the pin resolved to",
        do: "Open Mukuru Phase 2 (from the claim’s site name, or this step). Geo-resolution is why Daniel — not a random officer — received the queue.",
        lookFor: [
          "Site coordinates on the map",
          "Claims and contracts against this site",
          "Why routing is geographic: the pin belongs to this site’s node",
        ],
      },
    ],
  },
  {
    slug: "peter-blocked",
    index: "04",
    minutes: "4 min",
    title: "Peter cannot skip verification",
    person: "Peter Otieno",
    role: "Supplier · Kondele Fabricators · PENDING",
    promise:
      "The platform is not a directory you can talk your way into. Pending identity blocks supplier credit even when the workshop has deliveries.",
    setup:
      "You are Peter in Kisumu. Contrast him with Amina. Same role class. He is not an empty file — he has recorded deliveries into Lumumba Housing Estate. The gate is verification, not existence.",
    outcome:
      "Reviewers see why “just onboard everyone” would break credit and procurement: PENDING is a state, not a missing row.",
    steps: [
      {
        id: "peter-profile",
        personaId: "user-peter",
        href: "/registry/kondele-fabricators",
        title: "Read a pending file",
        do: "Open Kondele Fabricators Self-Help Group. Verification is Pending. He may still show a computed reliability number from recorded claims — that is allowed. Certification is unconfirmed.",
        lookFor: [
          "Pending, not Verified — banner says certification is unconfirmed",
          "Kisumu / Kondele ward, not Nairobi / Embakasi South",
          "Youth and Jua Kali tags; no Women tag (Amina has both Youth and Women)",
          "A thinner delivery trail into Lumumba Housing Estate, not Mukuru",
        ],
      },
      {
        id: "peter-console",
        personaId: "user-peter",
        href: "/console",
        title: "His console is the same product, thinner",
        do: "Open Console as Peter. Greeting and layout match Amina’s. Volume does not. This is the empty-ish side of the same product — not a different app.",
        lookFor: [
          "Good morning, Peter — the greeting is Peter, not a caption",
          "A short claims list (Kisumu), not Amina’s Mukuru receipt trail",
          "What a supplier sees before they are in the verified programme",
        ],
      },
      {
        id: "peter-finance",
        personaId: "user-peter",
        href: "/finance",
        title: "Supplier finance stays closed",
        do: "Open Finance. Citizen mortgages may still list — they do not price a supplier. Every product that requires a verified supplier sits under Not yet available, even if his reliability number would have been high enough.",
        lookFor: [
          "Available: Affordable Housing Mortgage and Diaspora Home Loan (citizen products)",
          "Not yet available: invoice advance, jua kali asset finance, performance bond",
          "Cards that say a VERIFIED identity is required because this file is still pending",
        ],
        note: "Do not brief “Peter has no score”. Brief “Peter is not verified”. That is the gate.",
      },
    ],
  },
  {
    slug: "faith-programme",
    index: "05",
    minutes: "5 min",
    title: "Faith reads the programme",
    person: "Faith Muthoni",
    role: "Programme · Affordable Housing Board",
    promise:
      "National staff do not wait for a slide deck. They watch deliveries, counties, materials and exceptions on a live dashboard.",
    setup:
      "You are Faith. Demo “today” is 9 September 2026. Filters are query parameters — share the URL and the view is the same.",
    outcome: "You can brief a room from Intelligence without leaving the product.",
    steps: [
      {
        id: "intel-home",
        personaId: "user-faith",
        href: "/intelligence",
        title: "National dashboard",
        do: "Open Intelligence. Read the statement metrics, the weekly charts, the county table, then Needs attention. Click 8 weeks, then set county to Nairobi — the page recomputes and the URL is the briefing.",
        lookFor: [
          "Deliveries and value over the selected weeks — caption names the first and latest week",
          "Needs attention: queued over 48h, certificates expiring, hot sites",
          "Housing is the vertical; the widgets (map, league, exceptions) are sector-agnostic",
        ],
      },
      {
        id: "counties",
        personaId: "user-faith",
        href: "/intelligence/counties",
        title: "County league",
        do: "Open Counties. This is how a programme officer compares Nairobi to Kisumu without a spreadsheet export. Rank, volume, and mix should be speakable in a room.",
        lookFor: [
          "Ranked counties with claims, suppliers and value",
          "Nairobi versus Kisumu — Amina’s county versus Peter’s",
          "Top item and top supplier on a county row",
        ],
      },
      {
        id: "public-api",
        personaId: "user-faith",
        href: "/how-it-works#api",
        title: "Show the machine-readable layer",
        do: "Scroll to For integrators. The preview is Kariobangi Metal Works with phones and values stripped. Then open the same file in the registry so you can show the human view and the machine view side by side.",
        lookFor: [
          "GET /api/public/entities, /entities/kariobangi-metal-works, and /stats — listed, not dumped as a new page",
          "Preview has no phone and no contract value",
          "Open this file in the registry stays inside Kiungo",
        ],
      },
    ],
  },
  {
    slug: "samuel-credit",
    index: "06",
    minutes: "4 min",
    title: "Samuel prices counterparties",
    person: "Samuel Barasa",
    role: "Financier · Sample Bank A",
    promise: "A credit officer prices verified work history, not a form filled in Nairobi.",
    setup:
      "You are Samuel. You see verified entities with a reliability number, applications, and the same history Amina earned in the delivery loop. Pending names do not enter this book.",
    outcome: "You can show why Amina is bankable in-product and Peter is not yet.",
    steps: [
      {
        id: "book",
        personaId: "user-samuel",
        href: "/finance",
        title: "Open the counterparty book",
        do: "You are Samuel. Finance is a book of verified names, reliability, 12-week activity, and applications — not the supplier “matched finance” page Amina saw.",
        lookFor: [
          "Heading Verified counterparties — PENDING names are absent",
          "Kariobangi Metal Works Ltd with a score and a sparkline",
          "Applications to triage: Kariobangi · Supplier Invoice Advance · KSh 420,000 · IN_REVIEW",
        ],
      },
      {
        id: "amina-from-bank",
        personaId: "user-samuel",
        href: "/registry/kariobangi-metal-works",
        title: "Read Amina as a counterparty",
        do: "Open Kariobangi from the registry. This is the file a credit committee could be walked through without leaving Kiungo.",
        lookFor: [
          "Verified, with Youth / Women / Jua Kali",
          "Reliability from claims, not a form score",
          "Evidenced deliveries into a named site (Mukuru Phase 2)",
        ],
      },
      {
        id: "peter-from-bank",
        personaId: "user-samuel",
        href: "/registry/kondele-fabricators",
        title: "Read Peter as a decline",
        do: "Open Kondele Fabricators. Same product, opposite credit decision. Say this out loud: the layer prices evidence plus a verified identity. Go back to Finance if you need to show he never entered the book.",
        lookFor: [
          "Pending — this name would not appear on Samuel’s counterparty list",
          "Kisumu, not Nairobi",
          "Why a supplier product stays closed until identity clears",
        ],
      },
    ],
  },
];

export function getWalkthrough(slug: string): Walkthrough | undefined {
  return WALKTHROUGHS.find((item) => item.slug === slug);
}

export function nextWalkthrough(slug: string): Walkthrough | undefined {
  const index = WALKTHROUGHS.findIndex((item) => item.slug === slug);
  if (index === -1) return undefined;
  return WALKTHROUGHS[index + 1];
}

export function hrefPathname(href: string): string {
  const noHash = href.split("#")[0] ?? href;
  const q = noHash.indexOf("?");
  return q === -1 ? noHash : noHash.slice(0, q);
}

export function withWalkQuery(href: string, slug: string, step: number): string {
  if (href.startsWith("/api/")) return href;
  const hashIndex = href.indexOf("#");
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const base = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}wt=${encodeURIComponent(slug)}&wts=${step}${hash}`;
}

export function appendWalkParams(
  href: string,
  wt?: string | null,
  wts?: string | number | null,
): string {
  if (!wt) return href;
  const step = typeof wts === "number" ? wts : Number.parseInt(String(wts ?? "0"), 10);
  return withWalkQuery(href, wt, Number.isFinite(step) ? step : 0);
}

export function stepMatches(href: string, pathname: string): boolean {
  const path = hrefPathname(href);
  if (path.startsWith("/api/")) {
    return pathname.startsWith("/api/");
  }
  if (path === "/registry") {
    return pathname === "/registry";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function clampStep(walkthrough: Walkthrough, step: number): number {
  if (!Number.isFinite(step)) return 0;
  return Math.min(walkthrough.steps.length - 1, Math.max(0, Math.trunc(step)));
}
