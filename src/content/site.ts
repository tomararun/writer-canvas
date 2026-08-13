export const site = {
  name: "Maya Ellsworth",
  role: "Writer, systems thinker, occasional builder",
  tagline: "Essays on craft, attention, and the systems we build to think.",
  email: "hello@mayaellsworth.com",
  location: "Lisbon, Portugal",
  socials: [
    { label: "Newsletter", href: "#newsletter" },
    { label: "RSS", href: "/rss.xml" },
    { label: "Bluesky", href: "https://bsky.app" },
    { label: "GitHub", href: "https://github.com" },
  ],
};

export type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: number;
  featured?: boolean;
  body: string[];
  bodyMd?: string;
};

export const posts: Post[] = [
  {
    slug: "the-quiet-work",
    title: "The Quiet Work",
    dek: "Most of writing happens before the first sentence — in the noticing, the collecting, the long stare out the window.",
    date: "2026-07-14",
    category: "Essays",
    tags: ["craft", "attention", "process"],
    readingTime: 8,
    featured: true,
    body: [
      "There is a kind of labour that leaves no trace in the document. It happens on walks, in the margins of other people's books, in the twenty minutes before sleep when the day finally stops arguing with you.",
      "I used to measure a writing day in words. Now I measure it in noticings: the small, specific, unrepeatable details that arrive only when you have been paying attention long enough to be boring to yourself.",
      "Craft, in the end, is a willingness to stay in the room with an unfinished thought. Everything else — structure, rhythm, the pleasing turn at the end of a paragraph — is downstream of that patience.",
      "So here is the practice. Collect without purpose. Write badly on purpose. Cut what you love most and see whether the piece misses it. If it doesn't, you have learned something about the piece. If it does, you have learned something about yourself.",
    ],
  },
  {
    slug: "notes-on-structure",
    title: "Notes on Structure",
    dek: "An essay is a shape before it is an argument. Five structures I return to, and when each one earns its keep.",
    date: "2026-06-02",
    category: "Craft",
    tags: ["structure", "essays", "craft"],
    readingTime: 11,
    featured: true,
    body: [
      "Structure is the writer's kindest gift to a reader: a promise that the time being asked for has been accounted for.",
      "The braid works when two ideas are more interesting adjacent than sequential. The spiral works when the subject resists a single approach. The list works when the pleasure is accumulation rather than argument.",
      "Choose the shape early, then break it deliberately once. Readers remember the fracture more than the frame.",
    ],
  },
  {
    slug: "a-tool-for-thinking",
    title: "A Tool for Thinking",
    dek: "Why I rebuilt my note system for the fourth time, and what finally stuck.",
    date: "2026-04-21",
    category: "Tutorials",
    tags: ["tools", "notes", "systems"],
    readingTime: 6,
    featured: true,
    body: [
      "Every note system fails at the same point: retrieval. Capture is easy and slightly addictive. Retrieval is unglamorous and the only part that matters.",
      "What worked was reducing the taxonomy to three buckets — observations, arguments, and sources — and writing a weekly digest by hand.",
      "The friction is the feature. Anything that automates the review also automates the forgetting.",
    ],
  },
  {
    slug: "against-the-blank-page",
    title: "Against the Blank Page",
    dek: "The blank page is not a discipline problem. It is an information problem.",
    date: "2026-02-09",
    category: "Opinions",
    tags: ["process", "craft"],
    readingTime: 5,
    body: [
      "When I cannot start, it is almost never because I lack willpower. It is because I do not yet know enough to have a position.",
      "The cure is not a timer. It is another hour of reading, or a conversation with someone who disagrees with me.",
    ],
  },
  {
    slug: "on-revising-in-public",
    title: "On Revising in Public",
    dek: "What changes when you let readers see the seams.",
    date: "2025-11-30",
    category: "Reflections",
    tags: ["publishing", "process"],
    readingTime: 7,
    body: [
      "Publishing a draft is a small act of trust. It says: I would rather be useful now than immaculate later.",
      "The cost is real. Half-formed ideas attract confident corrections. But the correction is the content.",
    ],
  },
  {
    slug: "reading-like-a-writer",
    title: "Reading Like a Writer",
    dek: "A slow method for taking sentences apart without killing them.",
    date: "2025-09-18",
    category: "Craft",
    tags: ["reading", "craft"],
    readingTime: 9,
    body: [
      "Copy the paragraph by hand. Then rewrite it three ways, each worse than the original, until you can name exactly what the writer chose.",
      "Analysis that does not change your own next sentence is entertainment.",
    ],
  },
];

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  client: string;
  year: string;
  role: string;
  tags: string[];
  featured?: boolean;
  background: string;
  problem: string;
  process: { step: string; detail: string }[];
  implementation: string[];
  outcomes: string;
  metrics: { label: string; value: string }[];
  learnings: string[];
  gallery: { caption: string; tone: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "field-notes-redesign",
    title: "Rewriting a 12-year-old science magazine",
    summary:
      "Editorial strategy and voice guide for a print-first publication moving to a reader-funded digital model.",
    client: "Field Notes Quarterly",
    year: "2026",
    role: "Editorial lead & content strategist",
    tags: ["editorial", "strategy", "voice"],
    featured: true,
    background:
      "Field Notes had 40,000 print subscribers and a website that read like a PDF. Trust was high; attention was leaking.",
    problem:
      "Long features were being abandoned at 20% scroll. The archive was invisible to search, and the voice shifted between contributors with no shared spine.",
    process: [
      { step: "Audit", detail: "Read 180 published pieces and coded them for structure, promise, and payoff." },
      { step: "Interviews", detail: "Twelve readers, six contributors, two editors. Asked what they skipped and why." },
      { step: "Voice guide", detail: "Wrote a 14-page guide with worked before/after examples rather than adjectives." },
      { step: "Templates", detail: "Three article shapes: the dispatch, the explainer, the argument." },
      { step: "Pilot", detail: "Ran six pieces through the new system and measured scroll depth against a matched control." },
    ],
    implementation: [
      "Rebuilt the article template around a standing dek, a pull-through question, and section markers every 600 words.",
      "Introduced a 90-word summary block written last, not first.",
      "Migrated the archive to canonical slugs with structured data and per-piece descriptions.",
    ],
    outcomes:
      "The pilot pieces held readers roughly twice as far into the page, and the archive began earning search traffic for the first time in years.",
    metrics: [
      { label: "Median scroll depth", value: "20% → 58%" },
      { label: "Newsletter conversion", value: "1.1% → 3.4%" },
      { label: "Archive sessions / mo", value: "2.1k → 19k" },
      { label: "Contributor onboarding", value: "3 weeks → 4 days" },
    ],
    learnings: [
      "A voice guide only works when it argues with real sentences from your own archive.",
      "Summary blocks written last are honest; written first they are marketing.",
      "The archive is the product. New work is the advertisement for it.",
    ],
    gallery: [
      { caption: "Structure audit board", tone: "warm" },
      { caption: "Voice guide spreads", tone: "cool" },
      { caption: "Article template studies", tone: "sand" },
    ],
  },
  {
    slug: "atlas-knowledge-base",
    title: "A knowledge base people actually read",
    summary:
      "Information architecture and writing system for a support library serving 2M monthly readers.",
    client: "Atlas Software",
    year: "2025",
    role: "Content architect",
    tags: ["information architecture", "documentation"],
    featured: true,
    background:
      "Six hundred articles written by forty people over eight years, with no owner and no shared shape.",
    problem:
      "Support deflection had plateaued. Readers landed from search on the wrong article and bounced rather than navigating.",
    process: [
      { step: "Card sort", detail: "Open sort with 60 users produced four durable top-level groupings." },
      { step: "Content inventory", detail: "Tagged every article by job-to-be-done and last verified date." },
      { step: "Pruning", detail: "Merged or retired 210 articles; wrote redirects for all of them." },
      { step: "Pattern library", detail: "Task, concept, and troubleshooting patterns with strict opening sentences." },
    ],
    implementation: [
      "Each article opens with the outcome, not the feature name.",
      "Added a 'verified on' date rendered from CMS metadata to make staleness visible.",
      "Built related-article links from the job tag rather than from full-text similarity.",
    ],
    outcomes:
      "Fewer, better articles. Support tickets fell while traffic stayed flat — the right kind of trade.",
    metrics: [
      { label: "Articles", value: "600 → 390" },
      { label: "Ticket deflection", value: "+22%" },
      { label: "Search exit rate", value: "-31%" },
      { label: "Time to publish", value: "9 days → 2 days" },
    ],
    learnings: [
      "Deleting is the highest-leverage editing move in documentation.",
      "Visible staleness dates build more trust than a redesign.",
    ],
    gallery: [
      { caption: "Card sort clusters", tone: "cool" },
      { caption: "Article patterns", tone: "sand" },
      { caption: "Redirect map", tone: "warm" },
    ],
  },
  {
    slug: "the-margins-newsletter",
    title: "Growing a newsletter without growth tactics",
    summary: "Two years of writing weekly for a small audience, and what compounded.",
    client: "Self-directed",
    year: "2024",
    role: "Writer & publisher",
    tags: ["newsletter", "audience"],
    background:
      "I started The Margins with 40 readers, mostly friends, and one rule: never publish something I would skim.",
    problem:
      "Every growth playbook I read optimised for the wrong thing — arrival rather than return.",
    process: [
      { step: "Cadence", detail: "One essay a week, same hour, for 104 weeks." },
      { step: "Feedback loop", detail: "Read every reply; kept a file of the sentences readers quoted back." },
      { step: "Format tests", detail: "Tried five formats and kept the two with the highest reply rate." },
    ],
    implementation: [
      "Wrote the subject line last, from the strongest sentence in the piece.",
      "Replaced the archive page with a curated 'start here' reading path.",
    ],
    outcomes: "Slow, boring, compounding growth with an unusually high reply rate.",
    metrics: [
      { label: "Subscribers", value: "40 → 11,400" },
      { label: "Open rate", value: "62%" },
      { label: "Reply rate", value: "4.8%" },
      { label: "Weeks published", value: "104 / 104" },
    ],
    learnings: [
      "Reply rate predicts retention better than open rate.",
      "A start-here path outperforms a reverse-chronological archive every time.",
    ],
    gallery: [
      { caption: "Issue layouts", tone: "sand" },
      { caption: "Reader quote wall", tone: "warm" },
      { caption: "Format tests", tone: "cool" },
    ],
  },
];

export type Journal = {
  slug: string;
  title: string;
  date: string;
  topic: string;
  reflection: string[];
  reflectionMd?: string;
  resources: { label: string; href: string }[];
};

export const journal: Journal[] = [
  {
    slug: "week-31-typography",
    title: "Week 31 — Typography as argument",
    date: "2026-08-02",
    topic: "Typography",
    reflection: [
      "Spent the week setting the same essay in five typefaces. The argument did not change; my confidence in it did.",
      "Measure matters more than family. At 68 characters I read; at 92 I scan and resent the writer.",
    ],
    resources: [
      { label: "Practical Typography — Butterick", href: "https://practicaltypography.com" },
      { label: "The Elements of Typographic Style", href: "https://example.com" },
    ],
  },
  {
    slug: "week-28-interviewing",
    title: "Week 28 — Learning to interview",
    date: "2026-07-12",
    topic: "Reporting",
    reflection: [
      "Ran six practice interviews. My worst habit is filling silence; the best material arrived three seconds after I wanted to speak.",
      "Prepared questions are scaffolding, not a script. I now write five and expect to use two.",
    ],
    resources: [{ label: "Longform Podcast archive", href: "https://example.com" }],
  },
  {
    slug: "week-22-sql-for-writers",
    title: "Week 22 — SQL for writers",
    date: "2026-05-31",
    topic: "Data",
    reflection: [
      "Learned enough SQL to stop asking analysts for numbers I could get myself. Joins finally clicked when I drew them as Venn diagrams on paper.",
      "The reporting benefit is not the query. It is being able to ask a second question in the same afternoon.",
    ],
    resources: [{ label: "Select Star SQL", href: "https://example.com" }],
  },
  {
    slug: "week-14-reading-slower",
    title: "Week 14 — Reading slower on purpose",
    date: "2026-04-05",
    topic: "Reading",
    reflection: [
      "Cut my reading list by half and reread three books instead. Retention up, anxiety down, note quality noticeably better.",
    ],
    resources: [],
  },
];

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  year: string;
  status: "Live" | "In progress" | "Archived";
  link?: string;
  caseStudy?: string;
};

export const projects: Project[] = [
  {
    slug: "the-margins",
    name: "The Margins",
    blurb: "A weekly newsletter about craft, attention, and the systems we build to think.",
    year: "2024 —",
    status: "Live",
    caseStudy: "the-margins-newsletter",
  },
  {
    slug: "field-notes",
    name: "Field Notes Quarterly",
    blurb: "Editorial strategy and voice system for a reader-funded science magazine.",
    year: "2026",
    status: "Live",
    caseStudy: "field-notes-redesign",
  },
  {
    slug: "atlas",
    name: "Atlas Knowledge Base",
    blurb: "Information architecture for a 600-article support library.",
    year: "2025",
    status: "Live",
    caseStudy: "atlas-knowledge-base",
  },
  {
    slug: "commonplace",
    name: "Commonplace",
    blurb: "A small tool for keeping quotes, arguments, and sources in one searchable place.",
    year: "2026",
    status: "In progress",
  },
];

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
