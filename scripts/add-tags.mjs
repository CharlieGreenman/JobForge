#!/usr/bin/env node

/**
 * add-tags.mjs
 *
 * Reads templates/portals.example.yml line-by-line and inserts a `tags:` array
 * on the line before `enabled:` for each tracked company.  Preserves all
 * comments, blank lines, and formatting exactly.
 *
 * Tag taxonomy is defined inline; assignment is driven by:
 *   1. The most-recent section comment (e.g. "# -- AI Labs & LLM providers --")
 *   2. The company name
 *   3. The `notes:` field (location, product signals, etc.)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, "..", "templates", "portals.example.yml");

// ── helpers ──────────────────────────────────────────────────────────────

/** Case-insensitive check for any of `needles` inside `haystack`. */
const has = (haystack, ...needles) =>
  needles.some((n) => haystack.toLowerCase().includes(n.toLowerCase()));

// ── per-company tag logic ────────────────────────────────────────────────

/**
 * Return 2-5 tags for a company given its context.
 *
 * @param {string} section  Most recent "# -- … --" header
 * @param {string} name     Company name
 * @param {string} notes    notes: field value (may be "")
 * @returns {string[]}
 */
function assignTags(section, name, notes) {
  const tags = new Set();
  const ctx = `${section} ${name} ${notes}`.toLowerCase();

  // ── Section-based primary tags ──

  if (has(section, "AI Labs", "LLM provider", "Model Provider")) {
    tags.add("ai-lab");
  }
  if (has(section, "Voice AI", "Conversational AI")) {
    tags.add("voice-ai");
    tags.add("conversational-ai");
  }
  if (has(section, "Contact Center", "Enterprise comms", "contact center")) {
    tags.add("conversational-ai");
  }
  if (has(section, "AI infra", "LLMOps", "AI Infrastructure", "Compute")) {
    tags.add("ai-infra");
  }
  if (has(section, "No-Code", "Low-Code", "Automation")) {
    tags.add("automation");
  }
  if (has(section, "AI-native platform", "FDE/SA")) {
    tags.add("developer-tools");
  }
  if (has(section, "Vector DB", "RAG Infrastructure")) {
    tags.add("vector-db");
  }
  if (has(section, "AI-Native Developer Tool", "AI Coding", "Code Gen")) {
    tags.add("ai-coding");
    tags.add("developer-tools");
  }
  if (has(section, "Data & ML Platform")) {
    tags.add("analytics");
    tags.add("developer-tools");
  }
  if (has(section, "Developer Platform", "AI-adjacent")) {
    tags.add("developer-tools");
  }
  if (has(section, "Security", "Cybersecurity")) {
    tags.add("security");
  }
  if (has(section, "Fintech")) {
    tags.add("fintech");
  }
  if (has(section, "Design", "Collaboration")) {
    tags.add("collaboration");
  }
  if (has(section, "HR", "Remote Work")) {
    tags.add("hr-tech");
  }
  if (has(section, "Big Tech", "Major Cloud")) {
    tags.add("ai-lab");
    tags.add("cloud");
  }
  if (has(section, "Autonomous", "Robotics")) {
    tags.add("autonomous");
    tags.add("robotics");
  }
  if (has(section, "Healthcare")) {
    tags.add("healthcare");
  }
  if (has(section, "Legal", "Compliance AI")) {
    tags.add("legal-tech");
  }
  if (has(section, "Enterprise SaaS", "Productivity")) {
    tags.add("enterprise-saas");
    tags.add("productivity");
  }
  if (has(section, "E-commerce", "Marketplace")) {
    tags.add("e-commerce");
  }
  if (has(section, "DevOps", "CI/CD", "Infrastructure")) {
    tags.add("devops");
  }
  if (has(section, "Data Analytics", "BI")) {
    tags.add("analytics");
  }
  if (has(section, "Sales", "Marketing", "RevOps")) {
    tags.add("crm");
    tags.add("automation");
  }
  if (has(section, "AI Agent", "Workflow Automation")) {
    tags.add("ai-agents");
    tags.add("automation");
  }
  if (has(section, "Cloud-Native", "Kubernetes")) {
    tags.add("cloud");
    tags.add("devops");
  }
  if (has(section, "EdTech", "Learning")) {
    tags.add("edtech");
  }
  if (has(section, "Gaming", "Creative AI")) {
    tags.add("gaming");
  }
  if (has(section, "Climate", "Energy")) {
    tags.add("climate");
  }
  if (has(section, "Supply Chain", "Logistics")) {
    tags.add("logistics");
  }
  if (has(section, "Real Estate", "PropTech")) {
    tags.add("real-estate");
  }
  if (has(section, "Telecom", "Connectivity")) {
    tags.add("networking");
  }
  if (has(section, "Music", "Audio AI")) {
    tags.add("media");
  }
  if (has(section, "Travel", "Mobility")) {
    tags.add("travel");
  }
  if (has(section, "Insurance", "RegTech")) {
    tags.add("insurance");
  }
  if (has(section, "Communication Platform")) {
    tags.add("communication");
  }
  if (has(section, "Observability", "Monitoring")) {
    tags.add("observability");
  }
  if (has(section, "Database", "Data Infrastructure")) {
    tags.add("database");
  }
  if (has(section, "AI Search", "Knowledge")) {
    tags.add("ai-search");
  }
  if (has(section, "Developer Experience", "API")) {
    tags.add("developer-tools");
  }
  if (has(section, "European tech", "EMEA")) {
    tags.add("eu");
  }
  if (has(section, "Israel Tech")) {
    tags.add("israel");
  }
  if (has(section, "India Tech")) {
    tags.add("apac");
  }
  if (has(section, "Horizontal AI Platform")) {
    tags.add("mlops");
  }
  if (has(section, "Vertical AI")) {
    tags.add("enterprise-saas");
  }
  if (has(section, "Identity", "Trust")) {
    tags.add("identity");
  }
  if (has(section, "Networking", "Edge")) {
    tags.add("networking");
  }
  if (has(section, "Testing", "QA")) {
    tags.add("testing");
  }
  if (has(section, "Open Source Companies")) {
    tags.add("open-source");
    tags.add("developer-tools");
  }
  if (has(section, "Media", "Content")) {
    tags.add("media");
  }
  if (has(section, "Food", "AgTech")) {
    tags.add("food-tech");
  }
  if (has(section, "Construction", "Industrial")) {
    tags.add("construction");
  }
  if (has(section, "Government", "Civic")) {
    tags.add("govtech");
    tags.add("defense");
  }
  if (has(section, "Misc High-Growth")) {
    tags.add("developer-tools");
  }
  if (has(section, "Ashby-based", "Lever-based", "Greenhouse-based")) {
    // These are grouping headers by ATS, not industry -- rely on name/notes
  }

  // ── Name / notes refinements ──

  // AI signals from notes/name
  if (has(ctx, "llmops")) tags.add("llmops");
  if (has(ctx, "mlops") || has(ctx, "experiment tracking") || has(ctx, "ml metadata")) tags.add("mlops");
  if (has(ctx, "observability") && !tags.has("observability")) tags.add("observability");
  if (has(ctx, "vector") || has(ctx, "embeddings database")) tags.add("vector-db");
  if (has(ctx, "voice ai") || has(ctx, "tts") || has(ctx, "stt") || has(ctx, "speech")) tags.add("voice-ai");
  if (has(ctx, "gpu cloud") || has(ctx, "gpu marketplace") || has(ctx, "gpu droplet")) tags.add("gpu-cloud");
  if (has(ctx, "inference") && has(ctx, "hardware") || has(ctx, "wafer-scale") || has(ctx, "ai chip") || has(ctx, "ai accelerator") || has(ctx, "lpu")) tags.add("chips");
  if (has(ctx, "no-code") || has(ctx, "no code")) tags.add("no-code");
  if (has(ctx, "low-code") || has(ctx, "low code")) tags.add("low-code");
  if (has(ctx, "rpa")) tags.add("rpa");
  if (has(ctx, "open-source") || has(ctx, "open source")) tags.add("open-source");
  if (has(ctx, "ai agent") || has(ctx, "ai agents") || has(ctx, "autonomous coding") || has(ctx, "ai software engineer")) tags.add("ai-agents");
  if (has(ctx, "ai search") || has(ctx, "search and answer")) tags.add("ai-search");
  if (has(ctx, "creative") || has(ctx, "image generation") || has(ctx, "video generation") || has(ctx, "3d capture")) tags.add("ai-creative");
  if (has(ctx, "generative ai") || has(ctx, "genai") || has(ctx, "generative model")) tags.add("ai-lab");
  if (has(ctx, "contact center") || has(ctx, "customer service") || has(ctx, "customer support")) tags.add("conversational-ai");
  if (has(ctx, "payments") || has(ctx, "payment") || has(ctx, "banking") || has(ctx, "bnpl") || has(ctx, "neobank") || has(ctx, "money transfer") || has(ctx, "trading platform") || has(ctx, "corporate finance") || has(ctx, "corporate card") || has(ctx, "financial")) tags.add("fintech");
  if (has(ctx, "defense") || has(ctx, "military") || has(ctx, "intelligence")) tags.add("defense");
  if (has(ctx, "robotics") || has(ctx, "humanoid") || has(ctx, "robotic")) tags.add("robotics");
  if (has(ctx, "autonomous driv") || has(ctx, "self-driving") || has(ctx, "autonomous vehicle") || has(ctx, "autonomous delivery")) tags.add("autonomous");
  if (has(ctx, "database") || has(ctx, "postgres") || has(ctx, "mysql") || has(ctx, "sql") || has(ctx, "olap")) tags.add("database");
  if (has(ctx, "healthcare") || has(ctx, "health") || has(ctx, "medical") || has(ctx, "precision medicine") || has(ctx, "pathology") || has(ctx, "drug discovery") || has(ctx, "oncology") || has(ctx, "life sciences")) tags.add("healthcare");
  if (has(ctx, "legal") || has(ctx, "contract management") || has(ctx, "e-signature")) tags.add("legal-tech");
  if (has(ctx, "construction") || has(ctx, "construction management")) tags.add("construction");
  if (has(ctx, "fraud") && has(ctx, "financial")) tags.add("fintech");
  if (has(ctx, "process mining")) tags.add("automation");
  if (has(ctx, "compliance") || has(ctx, "soc 2") || has(ctx, "supply chain security")) tags.add("compliance");
  if (has(ctx, "identity verification") || has(ctx, "ekyc") || has(ctx, "auth") || has(ctx, "sso") || has(ctx, "access management")) tags.add("identity");
  if (has(ctx, "incident management") || has(ctx, "aiops")) tags.add("observability");
  if (has(ctx, "feature flag")) tags.add("developer-tools");
  if (has(ctx, "ai coding") || has(ctx, "code completion") || has(ctx, "code assistant") || has(ctx, "ai-native editor") || has(ctx, "coding agent") || has(ctx, "code generation") || has(ctx, "ai writing")) tags.add("ai-coding");
  if (has(ctx, "cms") || has(ctx, "content platform") || has(ctx, "headless cms")) tags.add("developer-tools");

  // ── Company-specific overrides for big tech and notable names ──

  const n = name.toLowerCase();

  // Big tech
  if (n === "anthropic") { tags.add("ai-lab"); tags.add("us"); }
  if (n === "openai") { tags.add("ai-lab"); tags.add("us"); }
  if (n === "meta") { tags.add("ai-lab"); tags.add("us"); }
  if (n === "microsoft") { tags.add("ai-lab"); tags.add("cloud"); tags.add("us"); }
  if (n === "nvidia") { tags.add("ai-lab"); tags.add("chips"); tags.add("gpu-cloud"); tags.add("us"); }
  if (n === "google") { tags.add("ai-lab"); tags.add("cloud"); tags.add("us"); }
  if (n === "google deepmind") { tags.add("ai-lab"); tags.add("uk"); tags.add("us"); }
  if (n.includes("amazon")) { tags.add("ai-lab"); tags.add("cloud"); tags.add("us"); }
  if (n === "apple") { tags.add("ai-lab"); tags.add("us"); }
  if (n === "ibm") { tags.add("ai-lab"); tags.add("cloud"); tags.add("us"); }
  if (n === "intel") { tags.add("chips"); tags.add("us"); }
  if (n === "amd") { tags.add("chips"); tags.add("gpu-cloud"); tags.add("us"); }
  if (n === "qualcomm") { tags.add("chips"); tags.add("us"); }
  if (n === "oracle") { tags.add("cloud"); tags.add("enterprise-saas"); tags.add("us"); }
  if (n === "sap ai") { tags.add("enterprise-saas"); tags.add("eu"); }
  if (n === "cisco") { tags.add("networking"); tags.add("us"); }
  if (n === "dell technologies") { tags.add("cloud"); tags.add("us"); }
  if (n === "hpe") { tags.add("cloud"); tags.add("us"); }

  // AI labs & model providers
  if (n === "xai") { tags.add("ai-lab"); tags.add("us"); }
  if (n === "scale") { tags.add("ai-lab"); tags.add("ai-infra"); tags.add("us"); }
  if (n === "databricks") { tags.add("ai-infra"); tags.add("analytics"); tags.add("us"); }
  if (n === "snowflake") { tags.add("cloud"); tags.add("analytics"); tags.add("us"); }
  if (n === "confluent") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "perplexity") { tags.add("ai-lab"); tags.add("ai-search"); tags.add("us"); }
  if (n === "replicate") { tags.add("ai-infra"); tags.add("us"); }
  if (n === "hugging face") { tags.add("ai-lab"); tags.add("open-source"); tags.add("us"); }
  if (n === "groq") { tags.add("ai-infra"); tags.add("chips"); tags.add("us"); }
  if (n === "coreweave") { tags.add("ai-infra"); tags.add("gpu-cloud"); tags.add("us"); }
  if (n === "lambda") { tags.add("ai-infra"); tags.add("gpu-cloud"); tags.add("us"); }
  if (n === "modal") { tags.add("ai-infra"); tags.add("gpu-cloud"); tags.add("us"); }
  if (n === "fireworks ai") { tags.add("ai-infra"); tags.add("us"); }
  if (n === "together ai") { tags.add("ai-infra"); tags.add("open-source"); tags.add("us"); }
  if (n === "anyscale") { tags.add("ai-infra"); tags.add("us"); }
  if (n === "mistral ai") { tags.add("ai-lab"); tags.add("eu"); }
  if (n === "stability ai") { tags.add("ai-lab"); tags.add("ai-creative"); tags.add("uk"); }
  if (n === "ai21 labs") { tags.add("ai-lab"); tags.add("israel"); }
  if (n === "character ai") { tags.add("ai-lab"); tags.add("conversational-ai"); tags.add("us"); }
  if (n === "reka ai") { tags.add("ai-lab"); tags.add("us"); }
  if (n === "aleph alpha") { tags.add("ai-lab"); tags.add("eu"); }
  if (n === "cohere") { tags.add("ai-lab"); tags.add("remote-first"); }
  if (n === "cerebras") { tags.add("ai-infra"); tags.add("chips"); tags.add("us"); }
  if (n === "sambanova") { tags.add("ai-infra"); tags.add("chips"); tags.add("us"); }
  if (n === "modular") { tags.add("ai-infra"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "baseten") { tags.add("ai-infra"); tags.add("us"); }
  if (n === "runpod") { tags.add("ai-infra"); tags.add("gpu-cloud"); tags.add("us"); }
  if (n === "vast.ai") { tags.add("ai-infra"); tags.add("gpu-cloud"); tags.add("us"); }

  // Voice AI
  if (n === "polyai") { tags.add("voice-ai"); tags.add("uk"); }
  if (n === "parloa") { tags.add("voice-ai"); tags.add("eu"); }
  if (n === "hume ai") { tags.add("voice-ai"); tags.add("us"); }
  if (n === "elevenlabs") { tags.add("voice-ai"); tags.add("us"); }
  if (n === "deepgram") { tags.add("voice-ai"); tags.add("us"); }
  if (n === "vapi") { tags.add("voice-ai"); tags.add("ai-infra"); tags.add("us"); }
  if (n === "bland ai") { tags.add("voice-ai"); tags.add("ai-agents"); tags.add("us"); }
  if (n === "soundhound") { tags.add("voice-ai"); tags.add("us"); }
  if (n === "assemblyai") { tags.add("voice-ai"); tags.add("us"); }
  if (n === "speechmatics") { tags.add("voice-ai"); tags.add("uk"); }

  // Contact center / CX
  if (n === "intercom") { tags.add("conversational-ai"); tags.add("enterprise-saas"); tags.add("eu"); }
  if (n === "ada") { tags.add("conversational-ai"); tags.add("ai-agents"); tags.add("remote-first"); }
  if (n === "liveperson") { tags.add("conversational-ai"); tags.add("remote-first"); }
  if (n === "sierra") { tags.add("conversational-ai"); tags.add("ai-agents"); tags.add("us"); }
  if (n === "decagon") { tags.add("conversational-ai"); tags.add("ai-agents"); tags.add("us"); }
  if (n === "talkdesk") { tags.add("conversational-ai"); tags.add("eu"); }
  if (n === "twilio") { tags.add("communication"); tags.add("us"); }
  if (n === "dialpad") { tags.add("voice-ai"); tags.add("communication"); tags.add("us"); }
  if (n === "gong") { tags.add("voice-ai"); tags.add("crm"); tags.add("us"); }
  if (n === "genesys") { tags.add("conversational-ai"); tags.add("us"); }
  if (n === "salesforce") { tags.add("crm"); tags.add("ai-agents"); tags.add("us"); }
  if (n === "cognigy") { tags.add("conversational-ai"); tags.add("eu"); }

  // AI infra & LLMOps
  if (n === "langfuse") { tags.add("llmops"); tags.add("eu"); }
  if (n === "lindy") { tags.add("ai-agents"); tags.add("us"); }
  if (n === "langchain") { tags.add("ai-infra"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "arize ai") { tags.add("llmops"); tags.add("observability"); tags.add("us"); }

  // Vector DBs
  if (n === "pinecone") { tags.add("vector-db"); tags.add("us"); }
  if (n === "weaviate") { tags.add("vector-db"); tags.add("open-source"); tags.add("eu"); }
  if (n === "qdrant") { tags.add("vector-db"); tags.add("open-source"); tags.add("eu"); }
  if (n === "chroma") { tags.add("vector-db"); tags.add("open-source"); tags.add("us"); }
  if (n === "zilliz") { tags.add("vector-db"); tags.add("us"); }
  if (n === "vectara") { tags.add("vector-db"); tags.add("ai-search"); tags.add("us"); }
  if (n === "unstructured") { tags.add("ai-infra"); tags.add("us"); }

  // AI coding
  if (n === "cursor") { tags.add("ai-coding"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "replit") { tags.add("ai-coding"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "sourcegraph") { tags.add("ai-coding"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "codeium") { tags.add("ai-coding"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "tabnine") { tags.add("ai-coding"); tags.add("developer-tools"); tags.add("israel"); }
  if (n === "augment code") { tags.add("ai-coding"); tags.add("us"); }
  if (n === "magic ai") { tags.add("ai-coding"); tags.add("ai-lab"); tags.add("us"); }
  if (n === "poolside") { tags.add("ai-coding"); tags.add("ai-lab"); tags.add("us"); }
  if (n.includes("cognition")) { tags.add("ai-coding"); tags.add("ai-agents"); tags.add("us"); }
  if (n === "factory ai") { tags.add("ai-coding"); tags.add("ai-agents"); tags.add("us"); }

  // Developer platforms
  if (n === "retool") { tags.add("developer-tools"); tags.add("no-code"); tags.add("uk"); }
  if (n === "airtable") { tags.add("no-code"); tags.add("productivity"); tags.add("us"); }
  if (n === "vercel") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "cloudflare") { tags.add("cloud"); tags.add("networking"); tags.add("us"); }
  if (n === "gitlab") { tags.add("devops"); tags.add("developer-tools"); tags.add("remote-first"); }
  if (n === "linear") { tags.add("developer-tools"); tags.add("productivity"); tags.add("us"); }
  if (n === "notion") { tags.add("productivity"); tags.add("us"); }
  if (n === "temporal") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "writer") { tags.add("ai-creative"); tags.add("enterprise-saas"); tags.add("us"); }

  // No-code / Automation
  if (n === "n8n") { tags.add("automation"); tags.add("no-code"); tags.add("open-source"); tags.add("eu"); }
  if (n === "zapier") { tags.add("automation"); tags.add("no-code"); tags.add("remote-first"); }
  if (n.includes("make.com")) { tags.add("automation"); tags.add("no-code"); tags.add("eu"); }

  // Databases
  if (n === "mongodb") { tags.add("database"); tags.add("us"); }
  if (n === "supabase") { tags.add("database"); tags.add("developer-tools"); tags.add("remote-first"); }
  if (n === "neon") { tags.add("database"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "planetscale") { tags.add("database"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "cockroachdb") { tags.add("database"); tags.add("us"); }
  if (n === "singlestore") { tags.add("database"); tags.add("analytics"); tags.add("us"); }
  if (n === "clickhouse") { tags.add("database"); tags.add("analytics"); tags.add("us"); }
  if (n === "timescaledb") { tags.add("database"); tags.add("us"); }
  if (n === "starrocks") { tags.add("database"); tags.add("analytics"); tags.add("us"); }
  if (n === "motherduck") { tags.add("database"); tags.add("analytics"); tags.add("us"); }
  if (n === "turso") { tags.add("database"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "materialize") { tags.add("database"); tags.add("us"); }
  if (n === "risingwave") { tags.add("database"); tags.add("us"); }

  // Observability
  if (n === "elastic") { tags.add("observability"); tags.add("ai-search"); tags.add("us"); }
  if (n === "datadog") { tags.add("observability"); tags.add("us"); }
  if (n === "grafana labs") { tags.add("observability"); tags.add("open-source"); tags.add("remote-first"); }
  if (n === "new relic") { tags.add("observability"); tags.add("us"); }
  if (n.includes("splunk")) { tags.add("observability"); tags.add("security"); tags.add("us"); }
  if (n === "chronosphere") { tags.add("observability"); tags.add("us"); }
  if (n === "honeycomb") { tags.add("observability"); tags.add("us"); }
  if (n === "sentry") { tags.add("observability"); tags.add("developer-tools"); tags.add("us"); }

  // Security
  if (n === "wiz") { tags.add("security"); tags.add("cloud"); tags.add("us"); }
  if (n === "snyk") { tags.add("security"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "crowdstrike") { tags.add("security"); tags.add("us"); }
  if (n === "palo alto networks") { tags.add("security"); tags.add("us"); }
  if (n === "fortinet") { tags.add("security"); tags.add("us"); }
  if (n === "zscaler") { tags.add("security"); tags.add("cloud"); tags.add("us"); }
  if (n === "sentinelone") { tags.add("security"); tags.add("us"); }
  if (n === "lacework") { tags.add("security"); tags.add("cloud"); tags.add("us"); }
  if (n === "okta") { tags.add("identity"); tags.add("security"); tags.add("us"); }
  if (n === "1password") { tags.add("security"); tags.add("identity"); tags.add("remote-first"); }
  if (n === "cybereason") { tags.add("security"); tags.add("us"); }
  if (n === "darktrace") { tags.add("security"); tags.add("uk"); }
  if (n === "check point") { tags.add("security"); tags.add("israel"); }

  // Fintech
  if (n === "stripe") { tags.add("fintech"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "plaid") { tags.add("fintech"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "brex") { tags.add("fintech"); tags.add("us"); }
  if (n === "ramp") { tags.add("fintech"); tags.add("us"); }
  if (n === "mercury") { tags.add("fintech"); tags.add("remote-first"); }
  if (n === "wise") { tags.add("fintech"); tags.add("uk"); }
  if (n === "revolut") { tags.add("fintech"); tags.add("uk"); }
  if (n === "monzo") { tags.add("fintech"); tags.add("uk"); }
  if (n === "n26") { tags.add("fintech"); tags.add("eu"); }
  if (n === "adyen") { tags.add("fintech"); tags.add("eu"); }
  if (n === "checkout.com") { tags.add("fintech"); tags.add("uk"); }
  if (n === "affirm") { tags.add("fintech"); tags.add("remote-first"); }
  if (n === "robinhood") { tags.add("fintech"); tags.add("us"); }
  if (n === "coinbase") { tags.add("fintech"); tags.add("us"); }
  if (n.includes("square") || n.includes("block")) { tags.add("fintech"); tags.add("us"); }
  if (n === "klarna") { tags.add("fintech"); tags.add("eu"); }
  if (n === "razorpay") { tags.add("fintech"); tags.add("apac"); }

  // Design / collaboration
  if (n === "figma") { tags.add("collaboration"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "miro") { tags.add("collaboration"); tags.add("eu"); }
  if (n === "canva") { tags.add("ai-creative"); tags.add("collaboration"); tags.add("apac"); }

  // HR
  if (n === "deel") { tags.add("hr-tech"); tags.add("remote-first"); }
  if (n === "rippling") { tags.add("hr-tech"); tags.add("automation"); tags.add("us"); }
  if (n === "factorial") { tags.add("hr-tech"); tags.add("eu"); }
  if (n === "personio") { tags.add("hr-tech"); tags.add("eu"); }
  if (n === "workday") { tags.add("hr-tech"); tags.add("enterprise-saas"); tags.add("us"); }

  // Enterprise SaaS / Productivity
  if (n === "servicenow") { tags.add("enterprise-saas"); tags.add("ai-agents"); tags.add("us"); }
  if (n === "atlassian") { tags.add("productivity"); tags.add("collaboration"); tags.add("apac"); }
  if (n === "asana") { tags.add("productivity"); tags.add("us"); }
  if (n === "monday.com") { tags.add("productivity"); tags.add("israel"); }
  if (n === "clickup") { tags.add("productivity"); tags.add("us"); }
  if (n === "coda") { tags.add("productivity"); tags.add("us"); }
  if (n === "glean") { tags.add("ai-search"); tags.add("enterprise-saas"); tags.add("us"); }

  // CRM & Sales
  if (n === "hubspot") { tags.add("crm"); tags.add("us"); }
  if (n === "zendesk") { tags.add("crm"); tags.add("conversational-ai"); tags.add("us"); }
  if (n === "freshworks") { tags.add("crm"); tags.add("apac"); }
  if (n === "attio") { tags.add("crm"); tags.add("eu"); }
  if (n === "clay") { tags.add("automation"); tags.add("crm"); tags.add("us"); }
  if (n === "apollo.io") { tags.add("crm"); tags.add("us"); }
  if (n === "outreach") { tags.add("crm"); tags.add("us"); }
  if (n === "salesloft") { tags.add("crm"); tags.add("us"); }
  if (n === "zoominfo") { tags.add("crm"); tags.add("us"); }
  if (n === "clari") { tags.add("crm"); tags.add("us"); }
  if (n === "6sense") { tags.add("crm"); tags.add("us"); }

  // AI creative / marketing
  if (n === "jasper") { tags.add("ai-creative"); tags.add("us"); }
  if (n === "copy.ai") { tags.add("ai-creative"); tags.add("automation"); tags.add("us"); }
  if (n === "runway") { tags.add("ai-creative"); tags.add("us"); }
  if (n === "midjourney") { tags.add("ai-creative"); tags.add("us"); }
  if (n === "pika") { tags.add("ai-creative"); tags.add("us"); }
  if (n === "luma ai") { tags.add("ai-creative"); tags.add("us"); }

  // Comms
  if (n === "zoom") { tags.add("communication"); tags.add("us"); }
  if (n.includes("slack")) { tags.add("communication"); tags.add("collaboration"); tags.add("us"); }
  if (n === "discord") { tags.add("communication"); tags.add("us"); }
  if (n === "loom") { tags.add("communication"); tags.add("collaboration"); tags.add("us"); }
  if (n.includes("vonage")) { tags.add("communication"); tags.add("us"); }
  if (n === "messagebird") { tags.add("communication"); tags.add("eu"); }
  if (n === "sinch") { tags.add("communication"); tags.add("eu"); }

  // E-commerce
  if (n === "shopify") { tags.add("e-commerce"); tags.add("remote-first"); }
  if (n === "instacart") { tags.add("e-commerce"); tags.add("logistics"); tags.add("us"); }
  if (n === "doordash") { tags.add("e-commerce"); tags.add("logistics"); tags.add("us"); }
  if (n === "etsy") { tags.add("e-commerce"); tags.add("us"); }
  if (n === "faire") { tags.add("e-commerce"); tags.add("remote-first"); }
  if (n === "zalando") { tags.add("e-commerce"); tags.add("eu"); }

  // Travel
  if (n === "airbnb") { tags.add("travel"); tags.add("us"); }
  if (n === "uber") { tags.add("travel"); tags.add("logistics"); tags.add("us"); }
  if (n === "lyft") { tags.add("travel"); tags.add("us"); }
  if (n === "booking.com") { tags.add("travel"); tags.add("eu"); }
  if (n === "travelperk") { tags.add("travel"); tags.add("eu"); }
  if (n === "blablacar") { tags.add("travel"); tags.add("eu"); }

  // Autonomous / Robotics
  if (n === "waymo") { tags.add("autonomous"); tags.add("us"); }
  if (n === "aurora") { tags.add("autonomous"); tags.add("us"); }
  if (n === "nuro") { tags.add("autonomous"); tags.add("us"); }
  if (n === "zoox") { tags.add("autonomous"); tags.add("us"); }
  if (n === "cruise") { tags.add("autonomous"); tags.add("us"); }
  if (n === "anduril") { tags.add("defense"); tags.add("autonomous"); tags.add("us"); }
  if (n === "shield ai") { tags.add("defense"); tags.add("autonomous"); tags.add("us"); }
  if (n === "figure ai") { tags.add("robotics"); tags.add("us"); }
  if (n === "covariant") { tags.add("robotics"); tags.add("us"); }
  if (n === "boston dynamics") { tags.add("robotics"); tags.add("us"); }
  if (n === "built robotics") { tags.add("robotics"); tags.add("autonomous"); tags.add("construction"); tags.add("us"); }
  if (n === "samsara") { tags.add("logistics"); tags.add("us"); }

  // Healthcare
  if (n === "tempus ai") { tags.add("healthcare"); tags.add("us"); }
  if (n === "pathai") { tags.add("healthcare"); tags.add("us"); }
  if (n === "insitro") { tags.add("healthcare"); tags.add("us"); }
  if (n === "recursion") { tags.add("healthcare"); tags.add("us"); }
  if (n === "viz.ai") { tags.add("healthcare"); tags.add("us"); }
  if (n === "oscar health") { tags.add("healthcare"); tags.add("us"); }
  if (n === "flatiron health") { tags.add("healthcare"); tags.add("us"); }
  if (n === "hippocratic ai") { tags.add("healthcare"); tags.add("ai-lab"); tags.add("us"); }
  if (n === "doctolib") { tags.add("healthcare"); tags.add("eu"); }

  // Legal
  if (n.includes("casetext")) { tags.add("legal-tech"); tags.add("us"); }
  if (n === "ironclad") { tags.add("legal-tech"); tags.add("us"); }
  if (n === "docusign") { tags.add("legal-tech"); tags.add("enterprise-saas"); tags.add("us"); }
  if (n === "harvey") { tags.add("legal-tech"); tags.add("ai-agents"); tags.add("us"); }

  // Data / ML platform
  if (n === "dbt labs") { tags.add("analytics"); tags.add("developer-tools"); tags.add("remote-first"); }
  if (n === "fivetran") { tags.add("analytics"); tags.add("us"); }
  if (n === "airbyte") { tags.add("analytics"); tags.add("open-source"); tags.add("us"); }
  if (n === "dagster") { tags.add("analytics"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "prefect") { tags.add("analytics"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "hex") { tags.add("analytics"); tags.add("us"); }
  if (n === "census") { tags.add("analytics"); tags.add("us"); }
  if (n === "posthog") { tags.add("analytics"); tags.add("open-source"); tags.add("remote-first"); }

  // DevOps / infra
  if (n === "hashicorp") { tags.add("devops"); tags.add("cloud"); tags.add("us"); }
  if (n === "pulumi") { tags.add("devops"); tags.add("open-source"); tags.add("us"); }
  if (n === "fly.io") { tags.add("cloud"); tags.add("developer-tools"); tags.add("remote-first"); }
  if (n === "render") { tags.add("cloud"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "launchdarkly") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "stytch") { tags.add("identity"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "workos") { tags.add("identity"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "jfrog") { tags.add("devops"); tags.add("us"); }
  if (n === "circleci") { tags.add("devops"); tags.add("us"); }
  if (n === "buildkite") { tags.add("devops"); tags.add("remote-first"); }
  if (n === "kong") { tags.add("devops"); tags.add("networking"); tags.add("us"); }
  if (n === "postman") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "fastly") { tags.add("cloud"); tags.add("networking"); tags.add("us"); }
  if (n === "netlify") { tags.add("developer-tools"); tags.add("remote-first"); }
  if (n === "docker") { tags.add("devops"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "digitalocean") { tags.add("cloud"); tags.add("us"); }
  if (n === "akamai") { tags.add("cloud"); tags.add("networking"); tags.add("us"); }

  // Analytics & BI
  if (n === "thoughtspot") { tags.add("analytics"); tags.add("ai-search"); tags.add("us"); }
  if (n === "amplitude") { tags.add("analytics"); tags.add("us"); }
  if (n === "mixpanel") { tags.add("analytics"); tags.add("us"); }
  if (n.includes("segment")) { tags.add("analytics"); tags.add("us"); }
  if (n === "heap") { tags.add("analytics"); tags.add("us"); }
  if (n === "metabase") { tags.add("analytics"); tags.add("open-source"); tags.add("us"); }
  if (n.includes("preset")) { tags.add("analytics"); tags.add("open-source"); tags.add("us"); }
  if (n === "observable") { tags.add("analytics"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "hightouch") { tags.add("analytics"); tags.add("us"); }
  if (n === "contentsquare") { tags.add("analytics"); tags.add("eu"); }

  // AI Agents
  if (n === "relevance ai") { tags.add("ai-agents"); tags.add("apac"); }
  if (n === "fixie ai") { tags.add("ai-agents"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "dust") { tags.add("ai-agents"); tags.add("eu"); }
  if (n === "moveworks") { tags.add("ai-agents"); tags.add("enterprise-saas"); tags.add("us"); }
  if (n === "adept ai") { tags.add("ai-agents"); tags.add("us"); }
  if (n === "voiceflow") { tags.add("conversational-ai"); tags.add("no-code"); tags.add("us"); }
  if (n === "tray.io") { tags.add("automation"); tags.add("enterprise-saas"); tags.add("us"); }
  if (n === "workato") { tags.add("automation"); tags.add("enterprise-saas"); tags.add("us"); }

  // European
  if (n === "tinybird") { tags.add("analytics"); tags.add("developer-tools"); tags.add("remote-first"); }
  if (n === "clarity ai") { tags.add("analytics"); tags.add("climate"); tags.add("eu"); }
  if (n === "dataiku") { tags.add("mlops"); tags.add("eu"); }
  if (n === "algolia") { tags.add("ai-search"); tags.add("developer-tools"); tags.add("eu"); }
  if (n === "snorkel ai") { tags.add("mlops"); tags.add("us"); }
  if (n === "collibra") { tags.add("analytics"); tags.add("compliance"); tags.add("eu"); }
  if (n === "celonis") { tags.add("automation"); tags.add("analytics"); tags.add("eu"); }
  if (n === "uipath") { tags.add("rpa"); tags.add("automation"); tags.add("eu"); }
  if (n === "typeform") { tags.add("enterprise-saas"); tags.add("eu"); }
  if (n === "pitch") { tags.add("productivity"); tags.add("eu"); }

  // Israel
  if (n === "wix") { tags.add("developer-tools"); tags.add("no-code"); tags.add("israel"); }
  if (n === "taboola") { tags.add("media"); tags.add("israel"); }

  // EdTech
  if (n === "duolingo") { tags.add("edtech"); tags.add("us"); }
  if (n === "coursera") { tags.add("edtech"); tags.add("us"); }
  if (n === "khan academy") { tags.add("edtech"); tags.add("us"); }
  if (n === "chegg") { tags.add("edtech"); tags.add("us"); }

  // Gaming
  if (n === "unity") { tags.add("gaming"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "epic games") { tags.add("gaming"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "roblox") { tags.add("gaming"); tags.add("ai-creative"); tags.add("us"); }

  // Climate
  if (n === "climavision") { tags.add("climate"); tags.add("us"); }
  if (n === "watershed") { tags.add("climate"); tags.add("us"); }
  if (n === "arcadia") { tags.add("climate"); tags.add("us"); }

  // Logistics
  if (n === "flexport") { tags.add("logistics"); tags.add("us"); }
  if (n === "project44") { tags.add("logistics"); tags.add("us"); }
  if (n === "fourkites") { tags.add("logistics"); tags.add("us"); }

  // Real estate
  if (n === "opendoor") { tags.add("real-estate"); tags.add("us"); }
  if (n === "zillow") { tags.add("real-estate"); tags.add("us"); }

  // Telecom
  if (n.includes("starlink") || n.includes("spacex")) { tags.add("networking"); tags.add("us"); }

  // Music / Media
  if (n === "spotify") { tags.add("media"); tags.add("eu"); }

  // Insurance
  if (n === "lemonade") { tags.add("insurance"); tags.add("us"); }
  if (n === "tractable") { tags.add("insurance"); tags.add("uk"); }

  // Identity
  if (n === "persona") { tags.add("identity"); tags.add("us"); }
  if (n === "jumio") { tags.add("identity"); tags.add("us"); }
  if (n === "onfido") { tags.add("identity"); tags.add("uk"); }

  // Networking
  if (n === "tailscale") { tags.add("networking"); tags.add("remote-first"); }
  if (n === "cloudinary") { tags.add("developer-tools"); tags.add("israel"); }
  if (n === "imgix") { tags.add("developer-tools"); tags.add("us"); }

  // Testing
  if (n === "browserstack") { tags.add("testing"); tags.add("apac"); }
  if (n === "sauce labs") { tags.add("testing"); tags.add("us"); }
  if (n.includes("testim")) { tags.add("testing"); tags.add("us"); }

  // Open source
  if (n === "gitpod") { tags.add("developer-tools"); tags.add("open-source"); tags.add("remote-first"); }
  if (n === "coder") { tags.add("developer-tools"); tags.add("open-source"); tags.add("remote-first"); }
  if (n === "meilisearch") { tags.add("ai-search"); tags.add("open-source"); tags.add("eu"); }
  if (n === "minio") { tags.add("cloud"); tags.add("open-source"); tags.add("us"); }

  // Media / Content
  if (n === "reddit") { tags.add("media"); tags.add("us"); }
  if (n === "pinterest") { tags.add("media"); tags.add("e-commerce"); tags.add("us"); }
  if (n === "snap") { tags.add("media"); tags.add("ai-creative"); tags.add("us"); }
  if (n.includes("new york times")) { tags.add("media"); tags.add("us"); }
  if (n === "substack") { tags.add("media"); tags.add("us"); }
  if (n === "twitch") { tags.add("media"); tags.add("gaming"); tags.add("us"); }

  // Food
  if (n === "toast") { tags.add("food-tech"); tags.add("us"); }
  if (n.includes("grubhub")) { tags.add("food-tech"); tags.add("logistics"); tags.add("us"); }

  // Gov / defense
  if (n === "govini") { tags.add("govtech"); tags.add("defense"); tags.add("us"); }
  if (n === "primer ai") { tags.add("govtech"); tags.add("defense"); tags.add("us"); }

  // Misc
  if (n === "grammarly") { tags.add("ai-creative"); tags.add("remote-first"); }
  if (n === "webflow") { tags.add("no-code"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "palantir") { tags.add("analytics"); tags.add("defense"); tags.add("us"); }
  if (n === "weights & biases") { tags.add("mlops"); tags.add("us"); }
  if (n === "red hat") { tags.add("cloud"); tags.add("open-source"); tags.add("us"); }
  if (n === "suse") { tags.add("cloud"); tags.add("open-source"); tags.add("eu"); }
  if (n === "canonical") { tags.add("cloud"); tags.add("open-source"); tags.add("remote-first"); }
  if (n.includes("isovalent")) { tags.add("networking"); tags.add("open-source"); tags.add("us"); }
  if (n === "worldcoin") { tags.add("identity"); tags.add("us"); }
  if (n === "pagerduty") { tags.add("observability"); tags.add("us"); }
  if (n === "firehydrant") { tags.add("observability"); tags.add("us"); }
  if (n === "rootly") { tags.add("observability"); tags.add("us"); }
  if (n === "vanta") { tags.add("compliance"); tags.add("security"); tags.add("us"); }
  if (n === "drata") { tags.add("compliance"); tags.add("us"); }
  if (n === "chainguard") { tags.add("security"); tags.add("open-source"); tags.add("us"); }
  if (n === "teleport") { tags.add("security"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "liveblocks") { tags.add("collaboration"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "convex") { tags.add("developer-tools"); tags.add("database"); tags.add("us"); }
  if (n === "railway") { tags.add("cloud"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "deno") { tags.add("developer-tools"); tags.add("open-source"); tags.add("us"); }
  if (n === "val town") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "sanity") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "contentful") { tags.add("developer-tools"); tags.add("eu"); }
  if (n === "storyblok") { tags.add("developer-tools"); tags.add("eu"); }
  if (n === "redpanda") { tags.add("developer-tools"); tags.add("open-source"); tags.add("us"); }
  if (n === "warpstream") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "buf") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "hasura") { tags.add("developer-tools"); tags.add("open-source"); tags.add("us"); }
  if (n === "prisma") { tags.add("developer-tools"); tags.add("open-source"); tags.add("eu"); }
  if (n === "drizzle") { tags.add("developer-tools"); tags.add("open-source"); tags.add("remote-first"); }
  if (n === "grafbase") { tags.add("developer-tools"); tags.add("eu"); }
  if (n === "gitguardian") { tags.add("security"); tags.add("developer-tools"); tags.add("eu"); }
  if (n === "doppler") { tags.add("security"); tags.add("developer-tools"); tags.add("us"); }
  if (n === "resend") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "inngest") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "trigger.dev") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "nango") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "svix") { tags.add("developer-tools"); tags.add("us"); }
  if (n === "comet ml") { tags.add("mlops"); tags.add("us"); }
  if (n === "neptune.ai") { tags.add("mlops"); tags.add("eu"); }
  if (n.includes("determined ai")) { tags.add("mlops"); tags.add("us"); }
  if (n === "labelbox") { tags.add("mlops"); tags.add("us"); }
  if (n === "humanloop") { tags.add("llmops"); tags.add("uk"); }
  if (n === "eigen technologies") { tags.add("fintech"); tags.add("uk"); }
  if (n === "featurespace") { tags.add("fintech"); tags.add("security"); tags.add("uk"); }
  if (n === "procore") { tags.add("construction"); tags.add("us"); }
  if (n === "veeva systems") { tags.add("healthcare"); tags.add("enterprise-saas"); tags.add("remote-first"); }
  if (n === "coactive ai") { tags.add("ai-search"); tags.add("us"); }
  if (n === "you.com") { tags.add("ai-search"); tags.add("us"); }
  if (n === "hebbia") { tags.add("ai-search"); tags.add("fintech"); tags.add("us"); }

  // ── Region from notes ──

  const notesLower = notes.toLowerCase();
  if (has(notesLower, "remote-first") || has(notesLower, "remote first") || (has(notesLower, "remote") && has(notesLower, "friendly"))) {
    tags.add("remote-first");
  }
  if (has(notesLower, "tel aviv") || has(notesLower, "israel")) tags.add("israel");
  if (has(notesLower, "berlin") || has(notesLower, "munich") || has(notesLower, "paris") || has(notesLower, "amsterdam") ||
      has(notesLower, "barcelona") || has(notesLower, "madrid") || has(notesLower, "lisbon") ||
      has(notesLower, "dusseldorf") || has(notesLower, "düsseldorf") || has(notesLower, "heidelberg") ||
      has(notesLower, "nuremberg") || has(notesLower, "brussels") || has(notesLower, "tallinn") ||
      has(notesLower, "bucharest") || has(notesLower, "linz") || has(notesLower, "warsaw") ||
      has(notesLower, "walldorf") || has(notesLower, "stockholm") ||
      has(notesLower, "european") || has(notesLower, "emea")) {
    tags.add("eu");
  }
  if (has(notesLower, "london") || has(notesLower, "cambridge uk") || has(notesLower, "uk.") || has(notesLower, "uk ") ||
      notesLower.endsWith("uk") || has(notesLower, "dublin")) {
    tags.add("uk");
  }
  if (has(notesLower, "sydney") || has(notesLower, "bangalore") || has(notesLower, "chennai") || has(notesLower, "tokyo") ||
      has(notesLower, "singapore")) {
    tags.add("apac");
  }

  // ── Ensure at least one region tag ──
  const regionTags = ["us", "eu", "uk", "apac", "israel", "remote-first"];
  if (!regionTags.some((r) => tags.has(r))) {
    // Default to US for companies without explicit location
    tags.add("us");
  }

  // ── Cap at 5 tags, ensure at least 2 ──
  let result = [...tags];

  // If we have more than 5 tags, prioritize: keep region, then industry/platform
  if (result.length > 5) {
    const regions = result.filter((t) => regionTags.includes(t));
    const nonRegions = result.filter((t) => !regionTags.includes(t));
    // Keep 1 region + up to 4 non-region
    const keepRegions = regions.slice(0, 1);
    const keepOther = nonRegions.slice(0, 4);
    result = [...keepOther, ...keepRegions];
  }

  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────

const raw = readFileSync(FILE, "utf8");
const lines = raw.split("\n");

const out = [];
let currentSection = "";
let companyName = "";
let companyNotes = "";
let inTrackedCompanies = false;

// We need two passes: first collect company info, then insert tags.
// Since we're line-by-line and a company block looks like:
//   - name: Foo
//     careers_url: ...
//     [api: ...]
//     [notes: ...]
//     enabled: true/false
//
// We buffer lines until we hit `enabled:`, compute tags, insert, then flush.

let buffer = [];
let seenTags = false; // does current company already have tags?

function flushWithTags() {
  if (buffer.length === 0) return;

  // Find the `enabled:` line and company context
  const enabledIdx = buffer.findIndex((l) => l.match(/^\s+enabled:/));
  if (enabledIdx === -1 || !inTrackedCompanies || seenTags) {
    // No enabled line or already has tags or not in tracked_companies -- pass through
    out.push(...buffer);
    buffer = [];
    seenTags = false;
    return;
  }

  const tags = assignTags(currentSection, companyName, companyNotes);
  const indent = buffer[enabledIdx].match(/^(\s*)/)[1]; // match indentation
  const tagLine = `${indent}tags: [${tags.map((t) => `"${t}"`).join(", ")}]`;

  // Insert tag line before enabled line
  buffer.splice(enabledIdx, 0, tagLine);
  out.push(...buffer);
  buffer = [];
  seenTags = false;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect tracked_companies section
  if (line.match(/^tracked_companies:/)) {
    inTrackedCompanies = true;
    out.push(line);
    continue;
  }

  if (!inTrackedCompanies) {
    out.push(line);
    continue;
  }

  // Detect section comments like "# -- AI Labs & LLM providers --"
  const sectionMatch = line.match(/^\s*#\s*--\s*(.+?)\s*--/);
  if (sectionMatch) {
    flushWithTags();
    currentSection = sectionMatch[1];
    out.push(line);
    continue;
  }

  // Detect start of new company entry
  const nameMatch = line.match(/^\s+-\s+name:\s*(.+)/);
  if (nameMatch) {
    flushWithTags();
    companyName = nameMatch[1].trim();
    companyNotes = "";
    seenTags = false;
    buffer.push(line);
    continue;
  }

  // Collect notes
  const notesMatch = line.match(/^\s+notes:\s*"?(.+)"?\s*$/);
  if (notesMatch) {
    companyNotes = notesMatch[1].replace(/^"|"$/g, "");
    buffer.push(line);
    continue;
  }

  // Check if company already has tags
  if (line.match(/^\s+tags:/)) {
    seenTags = true;
    buffer.push(line);
    continue;
  }

  // On `enabled:` line, add it to buffer then flush (tags get inserted before it)
  if (line.match(/^\s+enabled:/)) {
    buffer.push(line);
    flushWithTags();
    continue;
  }

  // Other lines inside a company block (api:, careers_url:, scan_method:, etc.)
  if (buffer.length > 0) {
    buffer.push(line);
    continue;
  }

  // Blank lines and other comments between companies
  out.push(line);
}

// Flush any remaining buffer
flushWithTags();

writeFileSync(FILE, out.join("\n"), "utf8");

console.log("Done. Tags added to tracked companies in portals.example.yml");
