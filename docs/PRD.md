# Product Requirements Document (PRD)
# Adnify — Next-Gen AI Gateway & Intelligence Platform

> **Versi:** 2.0.0  
> **Tanggal:** 8 Juni 2026  
> **Status:** Draft  
> **Codename:** NEXUS  

---

## 1. Executive Summary

**Adnify** bukan sekadar AI router. Adnify adalah **AI Gateway & Intelligence Platform** yang merevolusi cara developer berinteraksi dengan AI providers. Dibanding freegate (proxy via Tor) dan 9router (router dengan token saver), Adnify adalah **generasi berikutnya** dengan AI-powered decision making, semantic caching, dan predictive cost management.

**Tagline:** *One Gateway. Infinite AI. Zero Waste.*

**Visi:** Menjadi operating system untuk AI API consumption — bukan hanya meroute request, tapi secara aktif mengoptimalkan setiap token, setiap dollar, dan setiap detik.

---

## 2. Competitive Intelligence — Why We're Different

### 2.1 Limitasi Kompetitor

| Masalah | freegate | 9router | Solusi Adnify |
|---------|----------|---------|---------------|
| Routing statis | Ya | Ya (priority saja) | **AI-powered dynamic routing** |
| Tidak belajar dari pattern | Ya | Ya | **Machine learning routing** |
| Token compression basic | N/A | RTK 20-40% | **Neural Compressor 40-65%** |
| Tanpa semantic cache | Ya | Ya | **Embedding-based semantic cache** |
| Fallback manual/linear | Ya | 3-tier linear | **Decision tree fallback** |
| Tidak predict cost | Ya | Ya | **Predictive cost engine** |
| Dashboard informatif saja | Ya | Ya | **Actionable intelligence dashboard** |
| Tanpa auto-scaling | Ya | Ya | **Adaptive rate management** |
| Provider relationship 1:1 | Ya | Ya | **Provider mesh network** |
| Tidak ada model aliasing | Ya | Ya | **Universal model namespace** |
| Tanpa A/B testing model | Ya | Ya | **Model quality benchmarking** |
| Logging pasif | Ya | Ya | **Smart request forensics** |
| Tidak punya MCP support | Ya | Ya | **Native MCP gateway** |
| Tanpa prompt optimization | Ya | Ya | **Prompt pre-processor** |
| Tidak punya memory/amnesia | Ya | Ya | **Persistent Memory Engine** |
| Tidak belajar dari experience | Ya | Ya | **Self-Learning & Distiller** |
| Tanpa skill management | Ya | Ya | **Dynamic Skill Rotation Engine** |
| Tanpa skill creation | Ya | Ya | **Skill Forge (create & group skills)** |

### 2.2 Breakthrough Features (Tidak Ada di Kompetitor Manapun)

1. **Neural Router** — AI yang belajar pattern user dan otomatis memilih provider terbaik
2. **Semantic Cache** — Cache berbasis makna, bukan exact match (hemat 15-30% requests)
3. **Adaptive Token Squeezer** — Compression yang belajar dan meningkat dari waktu ke waktu
4. **Predictive Cost Engine** — Prediksi biaya bulanan dan auto-adjust routing
5. **Model Quality Benchmark** — A/B test antar model, track quality score
6. **Universal Model Namespace** — Satu model ID bisa resolve ke banyak provider
7. **Provider Mesh Network** — Providers saling cover, optimal utilization
8. **Smart Request Forensics** — Analyze kenapa request gagal, suggest fix
9. **MCP Gateway** — Native Model Context Protocol support
10. **Prompt Pre-processor** — Optimize prompt sebelum dikirim untuk hasil lebih baik
11. **Request Pipeline Builder** — Visual pipeline untuk customize processing
12. **Real-time Collaboration** — Share sessions, combo configs antar team
13. **Conversation Context Manager** — Smart context window management
14. **Provider Arbitrage** — Auto-switch ke provider termurah per request
15. **Zero-Config Auto-Discovery** — Otomatis detect dan configure providers
16. **Persistent Memory & Self-Learning** — Tidak pernah amnesia, semakin pintar seiring waktu
17. **Experience Distiller** — Merangkum apa yang sudah dikerjakan menjadi reusable knowledge
18. **Adaptive Intelligence** — Belajar dari feedback, error, sukses, dan pattern user
19. **Dynamic Skill Rotation** — Rotasi skill secara dinamis per request, tanpa mencampur skill
20. **Skill Forge** — Buat, kelompokkan, dan kelola custom skills + import dari OpenClaw
21. **Skill Groups** — Kategorikan skill menjadi groups, rotasi per group untuk organisasi yang rapi

---

## 3. Architecture — The Neural Gateway

```
                          ┌──────────────────────────────┐
                          │       Client Tools            │
                          │ Claude|Cursor|Codex|Cline|... │
                          └──────────────┬───────────────┘
                                         │
                              http://localhost:3333/v1
                                         │
                          ┌──────────────▼───────────────┐
                          │       INTELLIGENCE LAYER      │
                          │                               │
                          │  ┌─────────────────────────┐  │
                          │  │   Neural Router Engine   │  │
                          │  │  (ML-based routing that  │  │
                          │  │   learns from patterns)  │  │
                          │  └──────────┬──────────────┘  │
                          │             │                  │
                          │  ┌──────────▼──────────────┐  │
                          │  │   Request Pipeline       │  │
                          │  │  ┌─────┐ ┌─────┐ ┌────┐ │  │
                          │  │  │Prompt│→│Token│→│Fmt │ │  │
                          │  │  │PrePro│ │Sque │ │Xlat│ │  │
                          │  │  └─────┘ └─────┘ └────┘ │  │
                          │  └──────────┬──────────────┘  │
                          │             │                  │
                          │  ┌──────────▼──────────────┐  │
                          │  │   Semantic Cache         │  │
                          │  │  (embedding-based,       │  │
                          │  │   not exact match)       │  │
                          │  └──────────┬──────────────┘  │
                          │             │                  │
                          │  ┌──────────▼──────────────┐  │
                          │  │   Decision Fallback Tree │  │
                          │  │  (context-aware, not     │  │
                          │  │   linear)                │  │
                          │  └──────────┬──────────────┘  │
                          └─────────────┼─────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
            ┌───────▼──────┐  ┌────────▼──────┐  ┌────────▼──────┐
            │  PROVIDER     │  │  PROVIDER     │  │  PROVIDER     │
            │  MESH LAYER   │  │  MESH LAYER   │  │  MESH LAYER   │
            │               │  │               │  │               │
            │ ┌───────────┐ │  │ ┌───────────┐ │  │ ┌───────────┐ │
            │ │ Account A │ │  │ │ Account A │ │  │ │ Account A │ │
            │ │ Account B │ │  │ │ Account B │ │  │ │ Account B │ │
            │ │ Account C │ │  │ │ Account C │ │  │ │ Account C │ │
            │ └───────────┘ │  │ └───────────┘ │  │ └───────────┘ │
            │    Claude     │  │    OpenAI     │  │    Gemini     │
            └───────────────┘  └───────────────┘  └───────────────┘
```

### 3.1 Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Runtime | **Bun** (fallback Node.js 20+) | 3x faster than Node, native TS |
| Framework | **Next.js 15** (App Router) | SSR + API + Dashboard unified |
| Language | **TypeScript** (strict) | Type safety |
| Database | **SQLite** (better-sqlite3 + Turso option) | Local-first, optional cloud sync |
| ORM | **Drizzle ORM** | Type-safe, lightweight |
| AI/ML | **ONNX Runtime** (local inference) | Neural router + embeddings |
| Embeddings | **Local TF-IDF + MiniLM** | Semantic cache tanpa API call |
| Styling | **Tailwind CSS 4 + Radix UI** | Modern, accessible, performant |
| Charts | **Tremor** | Beautiful dashboard components |
| Real-time | **Server-Sent Events + WebSocket** | Hybrid approach |
| Auth | **JWT + WebAuthn** | Passwordless support |
| Validation | **Zod** | Runtime type safety |
| Testing | **Vitest + Playwright** | Fast + comprehensive |
| Logging | **Pino** | Structured logging |
| CLI | **Commander.js** | Rich CLI experience |
| Package | **npm** (global CLI) | `npm i -g adnify` |

---

## 4. Core Features — Deep Dive

### 4.1 NEURAL ROUTER ENGINE (Breakthrough #1)

**Konsep:** Router yang belajar dari historical data dan secara otomatis menentukan provider terbaik untuk setiap request.

**Cara Kerja:**
```
Setiap request menghasilkan feature vector:
  [model, hour_of_day, prompt_length, has_code, has_tools, 
   streaming, temperature, user_id]

Router memprediksi:
  → Best provider (accuracy score)
  → Expected latency
  → Expected cost
  → Likelihood of success

Training data: Semua request_logs (success + failure)
Update model: Setiap 1000 requests atau 1 jam
Inference time: <5ms (ONNX)
```

**Routing Modes:**
1. **Auto (Neural)** — AI decides, learns from your patterns
2. **Balanced** — Neural + rule-based hybrid
3. **Manual** — Traditional priority/latency/cost routing
4. **Adaptive** — Switches between modes based on confidence

**ML Pipeline:**
```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│ Feature  │ →  │  Feature   │ →  │  Neural  │ →  │ Provider │
│ Extract  │    │  Vector    │    │  Model   │    │ Selection│
└──────────┘    └───────────┘    └──────────┘    └──────────┘
      ↑                                                │
      │          ┌───────────┐                         │
      └──────────│ Feedback  │←────────────────────────┘
                 │  Loop     │   (success/failure/latency/cost)
                 └───────────┘
```

**Kapan Neural Router aktif:**
- Setelah 100+ requests (minimum data untuk training)
- Confidence score >70% (fallback ke rule-based jika di bawah)
- User bisa toggle on/off

### 4.2 SEMANTIC CACHE (Breakthrough #2)

**Konsep:** Cache berbasis makna/semantik, bukan exact string match. Dua prompt yang berbeda kata tapi sama maksudnya akan hit cache yang sama.

**Cara Kerja:**
```
Prompt: "Explain how async/await works in JavaScript"
  → Generate embedding (local MiniLM, 384-dim)
  → Search similar embeddings in cache (cosine similarity >0.95)
  → Found: "How does async await work in JS?" (similarity: 0.97)
  → Return cached response (instant, $0 cost)

Prompt: "What is React hooks?"
  → Generate embedding
  → Search cache → Not found (best match: 0.72, below threshold)
  → Forward to provider → Cache response with embedding
```

**Configuration:**
```json
{
  "semanticCache": {
    "enabled": true,
    "similarityThreshold": 0.95,
    "ttlMinutes": 30,
    "maxEntries": 10000,
    "embeddingModel": "local-minilm",
    "excludeModels": ["creative-*"],
    "excludePatterns": ["*random*", "*generate*"]
  }
}
```

**Teknis:**
- Embedding: Local MiniLM-L6 (22MB, runs on CPU, <10ms per embedding)
- Storage: SQLite dengan vector extension (or brute-force untuk <10K entries)
- Search: Cosine similarity, approximate nearest neighbor
- Privacy: Embedding tidak dikirim ke external service
- Bypass: Temperature > 0, creative tasks, user can opt-out per request

**Savings Target:** 15-30% of requests served from cache

### 4.3 ADAPTIVE TOKEN SQUEEZER (Breakthrough #3)

**Konsep:** Token compression yang terus belajar dan meningkat. Tidak sekadar regex-based seperti RTK, tapi memahami konteks.

**Evolution dari RTK:**

| Aspek | RTK (9router) | Adnify Token Squeezer |
|-------|---------------|----------------------|
| Detection | Regex pattern | Regex + AST parsing + ML classifier |
| Compression | Single-pass filter | Multi-pass adaptive pipeline |
| Learning | Static rules | Learns optimal compression per model |
| Context-aware | No | Yes (knows model context window) |
| Statistics | Before/after | Before/after/quality score |
| Aggressiveness | Fixed | Adaptive (based on context fill %) |
| Code handling | Generic | Language-aware (JS, Python, Go, etc.) |

**Pipeline:**
```
Input Message
  │
  ├─ 1. DETECT: Classifier identifies content type per message block
  │     (code, git-diff, log, file-tree, natural language, etc.)
  │
  ├─ 2. ANALYZE: Calculate current context usage
  │     tokens_used / context_window = fill_percentage
  │
  ├─ 3. DECIDE: Choose compression strategy based on fill %
  │     <50% → Light compression (metadata only)
  │     50-75% → Medium compression (filters active)
  │     75-90% → Aggressive compression (multi-pass)
  │     >90% → Emergency truncation (keep most relevant)
  │
  ├─ 4. COMPRESS: Apply selected filters
  │     git-diff: Semantic diff (keep meaningful changes only)
  │     file-tree: Collapse irrelevant paths
  │     logs: Extract unique patterns, remove duplicates
  │     code: Language-aware (preserve semantics, remove boilerplate)
  │     generic: Smart truncate with summarization
  │
  ├─ 5. VERIFY: Ensure compression didn't lose critical info
  │     checksums match, no code syntax broken
  │
  └─ 6. STATS: Record compression metrics
        original_tokens, compressed_tokens, savings_%,
        filters_used, quality_score
```

**Language-Aware Code Compression:**
```javascript
// Before (142 tokens):
function calculateTotalPrice(items: CartItem[], discount: Discount, taxRate: number): number {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  const discountAmount = discount.type === 'percentage' 
    ? subtotal * (discount.value / 100) 
    : discount.value;
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * taxRate;
  return afterDiscount + tax;
}

// After compression (58 tokens, -59%):
fn calculateTotalPrice(items, discount, taxRate):
  subtotal = sum(item.price * item.quantity)
  discountAmt = discount.type == '%' ? subtotal * discount.value/100 : discount.value
  return (subtotal - discountAmt) * (1 + taxRate)
```

**Quality Scoring:**
Setiap compression mendapat quality score:
- **1.0** — Lossless (metadata only removed)
- **0.9** — Near-lossless (whitespace/comments removed)
- **0.8** — Acceptable (minor detail loss, semantics preserved)
- **0.7** — Degraded (some info loss, may affect response quality)
- **<0.7** — Rejected (use original)

### 4.4 PREDICTIVE COST ENGINE (Breakthrough #4)

**Konsep:** Prediksi biaya dan secara otomatis optimalkan routing berdasarkan budget.

**Features:**
1. **Real-time cost tracking** — Per request, per provider, per model, per day
2. **Cost prediction** — "Based on your usage pattern, you'll spend $47 this month"
3. **Budget alerts** — "You've used 80% of your monthly budget"
4. **Auto-optimization** — When approaching budget, switch to cheaper providers
5. **Cost comparison** — Show how much each provider would cost for the same usage
6. **ROI analysis** — "Claude Opus costs 5x more but produces 2x better code"

**Auto-Optimization Rules:**
```
Budget: $50/month

Week 1: Used $10 → All providers available (normal routing)
Week 2: Used $25 → Prefer cheap/free providers (cost-optimized)
Week 3: Used $40 → Free providers only (budget-conserving)
Week 4: Used $48 → Strict free-only mode (budget-protection)

Monthly reset → Back to normal routing
```

**Dashboard Widget:**
```
┌─────────────────────────────────────────────────┐
│ Monthly Budget: $50.00                          │
│ ████████████████░░░░░░░░ 68% used ($34.20)     │
│                                                 │
│ Projected: $48.50 (within budget ✅)            │
│ Savings: $127.30 (via Adnify optimization)      │
│                                                 │
│ Auto-optimization:                              │
│   Week 1-2: All tiers → Normal routing          │
│   Week 3-4: Cheap+Free only → Cost-saving mode  │
│                                                 │
│ [Adjust Budget] [Export Report] [Reset]         │
└─────────────────────────────────────────────────┘
```

### 4.5 MODEL QUALITY BENCHMARK (Breakthrough #5)

**Konsep:** A/B test antar model untuk task yang sama, track quality score secara otomatis.

**Cara Kerja:**
```
1. User sends request to "auto/" namespace
2. Adnify routes to 2+ models simultaneously (shadow mode)
3. Primary model response → returned to user
4. Shadow model response → evaluated silently
5. Quality metrics recorded:
   - Response latency
   - Token efficiency (output tokens / usefulness)
   - Error rate (syntax errors in code, hallucinations)
   - User satisfaction (implicit: was response accepted or retried?)
6. Dashboard shows quality comparison per model per task-type
```

**Benchmark Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ Model Quality Benchmark — Code Generation Tasks          │
│                                                          │
│ Model              │ Latency │ Tokens │ Quality │ Cost   │
│────────────────────┼─────────┼────────┼─────────┼────────│
│ cc/claude-opus-4-7 │ 4.2s    │ 890    │ 92/100  │ $0.045 │
│ oa/gpt-5.5         │ 3.1s    │ 720    │ 89/100  │ $0.038 │
│ glm/glm-5.1        │ 2.8s    │ 650    │ 85/100  │ $0.004 │
│ ds/deepseek-v4     │ 3.5s    │ 780    │ 87/100  │ $0.002 │
│ kr/claude-sonnet   │ 3.8s    │ 810    │ 88/100  │ $0.000 │
│                                                          │
│ Best Value: ds/deepseek-v4 (87 quality, $0.002)        │
│ Best Quality: cc/claude-opus-4-7 (92 quality)           │
│ Best Speed: glm/glm-5.1 (2.8s)                          │
└─────────────────────────────────────────────────────────┘
```

### 4.6 UNIVERSAL MODEL NAMESPACE (Breakthrough #6)

**Konsep:** Satu model ID yang otomatis resolve ke provider terbaik. User tidak perlu tahu provider mana yang menyediakan.

**Namespace Resolution:**
```
User requests: "best/code-model"
  → Resolve based on:
    1. Which providers have this model available?
    2. Which has cheapest price?
    3. Which has lowest latency right now?
    4. Which has most quota remaining?
  → Select optimal provider
  → Route request

User requests: "free/any"
  → Find any free model that can handle this task
  → Prefer highest quality among free options

User requests: "fast/flash"
  → Find lowest-latency model available
  → Route to fastest provider
```

**Built-in Namespaces:**
| Namespace | Behavior |
|-----------|----------|
| `best/{task}` | Highest quality model available |
| `fast/{task}` | Lowest latency model |
| `cheap/{task}` | Cheapest model |
| `free/{task}` | Best free model |
| `auto/{task}` | Neural router decides |
| `balanced/{task}` | Best quality/price ratio |
| `{provider}/{model}` | Specific provider (explicit) |
| `{combo_name}` | User-defined combo |

**Task Types:**
| Task | Description | Preferred Models |
|------|-------------|-----------------|
| `code` | Code generation/editing | Claude Opus, GPT-5.5, DeepSeek |
| `chat` | General conversation | Claude Sonnet, GPT-5.4 |
| `reason` | Complex reasoning | Claude Opus, o3, DeepSeek R1 |
| `fast` | Quick responses | Haiku, Flash, MiniMax |
| `review` | Code review | Claude Opus, GPT-5.5 |
| `translate` | Code translation | Claude, GPT |
| `debug` | Debug assistance | Claude, DeepSeek |
| `doc` | Documentation | Claude Sonnet, GPT |

### 4.7 PROVIDER MESH NETWORK (Breakthrough #7)

**Konsep:** Providers berbagi beban secara cerdas. Jika satu provider down, request otomatis didistribusikan ke providers lain yang punya model serupa.

**Mesh Topology:**
```
┌──────────────────────────────────────────────────────────┐
│                    MODEL REGISTRY                         │
│                                                           │
│  claude-sonnet-4.5 available on:                          │
│    ├─ kr/claude-sonnet-4.5  (free, unlimited)            │
│    ├─ an/claude-sonnet-4.5  (API key, $3/1M)             │
│    ├─ or/claude-sonnet-4.5  (OpenRouter, $3/1M)          │
│    └─ gh/claude-sonnet-4.5  (Copilot, subscription)      │
│                                                           │
│  Request for claude-sonnet-4.5:                           │
│    1. Check all 4 providers health                        │
│    2. Check quota on each                                 │
│    3. Check account availability                          │
│    4. Route to optimal (free > sub > cheap > paid)        │
│    5. If primary fails → instant mesh failover            │
└──────────────────────────────────────────────────────────┘
```

**Mesh Intelligence:**
- **Load balancing** — Distribute across all providers that have the same model
- **Quota maximization** — Use every provider's quota before falling to paid
- **Geographic optimization** — Route to closest provider endpoint
- **Health-aware** — Skip unhealthy providers automatically
- **Cost cascade** — Free → Subscription → Cheap → Pay-per-use

### 4.8 SMART REQUEST FORENSICS (Breakthrough #8)

**Konsep:** Setiap error dianalisis secara mendalam dan diberi saran perbaikan.

**Forensics Analysis:**
```
Request FAILED:
  Model: cc/claude-opus-4-7
  Provider: Anthropic (claude-code)
  Error: HTTP 429 "rate_limit_exceeded"
  
  Forensics:
  ├─ Root cause: Quota exhausted (5h rolling window)
  ├─ Quota used: 48,200 / 50,000 tokens (96.4%)
  ├─ Reset in: 23 minutes
  ├─ Pattern: High usage detected (3.2x normal)
  │
  ├─ Suggestions:
  │   1. Switch to kr/claude-sonnet-4.5 (free, same model family)
  │   2. Use glm/glm-5.1 until reset (cheap, $0.004 saved)
  │   3. Enable Semantic Cache (would have saved 12% this session)
  │   4. Increase Token Squeezer aggressiveness to "aggressive"
  │
  ├─ Auto-action taken:
  │   → Fallback to kr/claude-sonnet-4.5 (successful)
  │   → 3 similar requests automatically rerouted
  │
  └─ Impact: Zero downtime, $0.00 cost for fallback requests
```

### 4.9 MCP GATEWAY (Breakthrough #9)

**Konsep:** Native Model Context Protocol gateway. Adnify menjadi MCP server yang bisa diakses oleh MCP clients.

**MCP Features:**
- Adnify acts as **MCP Server** — expose tools, resources, prompts
- Adnify acts as **MCP Client** — connect to external MCP servers
- **Tool proxy** — AI coding tools can discover and use Adnify's tools via MCP
- **Resource provider** — Expose provider health, quota, cost as MCP resources
- **Prompt templates** — Pre-built prompt templates via MCP

**MCP Tools exposed:**
```
adnify.get_provider_health    — Check provider status
adnify.list_models            — List available models
adnify.get_quota              — Check quota status
adnify.get_cost_report        — Get cost report
adnify.create_combo           — Create a combo
adnify.test_connection        — Test provider connection
adnify.get_recommendations    — Get model recommendations
adnify.get_benchmark          — Get quality benchmarks
```

### 4.10 PROMPT PRE-PROCESSOR (Breakthrough #10)

**Konsep:** Optimize user prompts sebelum dikirim ke model untuk hasil yang lebih baik dan token lebih hemat.

**Optimizations:**
1. **System prompt injection** — Tambahkan optimal system prompt berdasarkan task
2. **Context deduplication** — Hapus informasi duplikat dalam conversation
3. **Instruction clarity** — Restrukturisasi prompt untuk clarity
4. **Tool output summarization** — Ringkas output tool yang terlalu panjang
5. **Language normalization** — Standardize language ke English untuk hasil lebih baik
6. **Code context optimization** — Hanya kirim relevant code context

**Example:**
```
Original prompt (340 tokens):
"Can you please look at this code and tell me what's wrong with it? 
I've been trying to fix this bug for hours and I can't figure it out. 
The error message says 'TypeError: Cannot read property 'map' of undefined' 
and it happens when I click the button. Here's the code..."

Optimized prompt (180 tokens, -47%):
"Debug: TypeError on button click — 'map' of undefined

Identify root cause in provided component:
- Check if data prop is null/undefined before .map()
- Verify data flow from parent to child
- Suggest fix with null-safe pattern"
```

### 4.11 REQUEST PIPELINE BUILDER (Breakthrough #11)

**Konsep:** Visual pipeline builder untuk customize bagaimana request diproses.

**Default Pipeline:**
```
Input → Auth → Rate Limit → Format Detect → Prompt Pre-Process → 
Token Squeeze → Semantic Cache Check → Neural Router → 
Format Translate → Send to Provider → Response → Format Translate Back → 
Cache Store → Log → Output
```

**Custom Pipeline Example:**
```
Input → Auth → [Custom: PII Redactor] → Token Squeeze → 
[Custom: Sentiment Analyzer] → Neural Router → Send → 
[Custom: Response Validator] → [Custom: Profanity Filter] → Output
```

**Pipeline Nodes:**
- Auth, Rate Limit, CORS (built-in)
- Token Squeezer (built-in)
- Prompt Pre-processor (built-in)
- Format Translation (built-in)
- Semantic Cache (built-in)
- Neural Router (built-in)
- Custom JavaScript nodes (user-defined)
- Conditional routing (if/else based on request properties)
- Branching (parallel processing)
- Transform nodes (modify request/response)

### 4.12 CONVERSATION CONTEXT MANAGER (Breakthrough #12)

**Konsep:** Manage conversation context secara cerdas agar tidak melewati context window.

**Features:**
1. **Auto-summarization** — Saat context hampir penuh, ringkas pesan lama
2. **Relevance ranking** — Hanya kirim pesan yang relevan dengan pertanyaan terakhir
3. **Sliding window** — Keep last N messages + summary of older messages
4. **Semantic selection** — Pilih pesan yang paling relevan berdasarkan embedding
5. **Token budget allocation** — Allocate budget per message type:
   ```
   System prompt: 10% of context
   Recent messages: 50% of context
   Relevant history: 25% of context
   Tool outputs: 15% of context (compressed)
   ```

### 4.13 PROVIDER ARBITRAGE (Breakthrough #13)

**Konsep:** Secara otomatis mencari provider termurah untuk setiap request.

**Arbitrage Engine:**
```
Request: claude-sonnet-4.5, 2000 input tokens

Available providers for this model:
  kr/claude-sonnet-4.5  → $0.000 (free)
  gh/claude-sonnet-4.5  → $0.000 (subscription, quota remaining)
  an/claude-sonnet-4.5  → $0.006 (API, $3/1M input)
  or/claude-sonnet-4.5  → $0.007 (OpenRouter, $3.5/1M)

→ Route to kr/ (free, save $0.007)

If kr/ quota exhausted:
→ Route to gh/ (subscription, save $0.007)

If gh/ quota exhausted:
→ Route to an/ (cheapest paid)
```

### 4.14 ZERO-CONFIG AUTO-DISCOVERY (Breakthrough #14)

**Konsep:** Adnify otomatis mendeteksi providers yang sudah terkonfigurasi di system.

**Auto-Detection:**
```
Scan system for:
  ├─ ~/.claude/config.json          → Detect Claude Code
  ├─ ~/.codex/config.json           → Detect Codex
  ├─ ~/.cursor/settings.json        → Detect Cursor
  ├─ ~/.config/kiro/                → Detect Kiro
  ├─ ANTHROPIC_API_KEY env var      → Detect Anthropic
  ├─ OPENAI_API_KEY env var         → Detect OpenAI
  ├─ GOOGLE_API_KEY env var         → Detect Gemini
  ├─ localhost:11434                → Detect Ollama
  ├─ localhost:1234                 → Detect LM Studio
  └─ git config                     → Detect GitHub

→ Auto-configure detected providers
→ Show in dashboard: "3 providers auto-detected! [Review]"
→ User just clicks "Confirm" → Ready to use
```

### 4.15 REAL-TIME COLLABORATION (Breakthrough #15)

**Konsep:** Share combos, pipeline configs, dan benchmark results antar team members.

**Features:**
- Share combo via link (encrypted)
- Team workspace (shared provider pool)
- Benchmark sharing (compare models across team)
- Pipeline sharing (reuse custom pipelines)
- Usage aggregation (team-wide analytics)

### 4.16 PERSISTENT MEMORY ENGINE (Breakthrough #16)

**Konsep:** Adnify tidak pernah lupa. Setiap keputusan, hasil, error, dan pattern disimpan permanen dan digunakan untuk membuat keputusan yang lebih baik di masa depan. Tidak seperti kompetitor yang reset saat restart, Adnify membangun knowledge base yang terus bertumbuh.

**Masalah yang dipecahkan:**
- freegate & 9router: Setiap restart → semua metrics hilang, semua learning hilang
- Tidak ada memory antar sessions
- Tidak bisa belajar dari kesalahan yang sama
- Tidak bisa mengenali pattern user

**Memory Architecture:**
```
┌──────────────────────────────────────────────────────────────┐
│                    PERSISTENT MEMORY LAYER                    │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │   EPISODIC       │  │   SEMANTIC       │  │  PROCEDURAL │ │
│  │   MEMORY         │  │   MEMORY         │  │  MEMORY     │ │
│  │                  │  │                  │  │             │ │
│  │ "Apa yang terjadi"│ │ "Apa yang diketahui"│ │ "Cara melakukan"│
│  │                  │  │                  │  │             │ │
│  │ • Request logs   │  │ • Model knowledge│  │ • Routing   │ │
│  │ • Error history  │  │ • Provider facts │  │  rules      │ │
│  │ • Success chains │  │ • User patterns  │  │ • Fallback  │ │
│  │ • Fallback paths │  │ • Cost patterns  │  │  strategies │ │
│  │ • Token savings  │  │ • Quality scores │  │ • Compress  │ │
│  │                  │  │                  │  │  patterns   │ │
│  │ TTL: 90 days     │  │ TTL: Forever     │  │ TTL: Forever│ │
│  │ (raw detail)     │  │ (summarized)     │  │ (compiled)  │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│          │                      │                    │        │
│          └──────────────────────┼────────────────────┘        │
│                                 │                              │
│                    ┌────────────▼─────────────┐               │
│                    │    EXPERIENCE DISTILLER   │               │
│                    │                           │               │
│                    │  Episodic → Semantic →    │               │
│                    │  Procedural (compaction)  │               │
│                    │                           │               │
│                    │  "Dari 10,000 requests,   │               │
│                    │   aku belajar bahwa..."    │               │
│                    └────────────┬──────────────┘               │
│                                 │                              │
│                    ┌────────────▼─────────────┐               │
│                    │    KNOWLEDGE BASE         │               │
│                    │    (SQLite, persistent)   │               │
│                    └──────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

**Tiga Jenis Memory:**

**1. Episodic Memory (Apa yang terjadi)**
```
Menyimpan setiap event/episode:

Request Episode:
  timestamp: 2026-06-08T14:23:02Z
  event: "request_completed"
  model: "glm/glm-5.1"
  provider: "GLM/Zhipu"
  task_type: "code_generation"
  input_tokens: 2340
  output_tokens: 890
  tokens_saved: 1240 (squeezer)
  latency_ms: 2100
  cost: $0.002
  quality_score: 0.85
  success: true
  cache_hit: false
  
Error Episode:
  timestamp: 2026-06-08T14:25:01Z
  event: "request_failed"
  model: "cc/claude-opus-4-7"
  provider: "Claude Code"
  error_type: "rate_limit_429"
  root_cause: "quota_exhausted"
  quota_remaining: 180
  quota_reset_in: "23m"
  fallback_to: "kr/claude-sonnet-4.5"
  fallback_success: true
```

**2. Semantic Memory (Apa yang diketahui)**
```
Pengetahuan yang sudah dirangkum dan disimpan permanen:

Model Knowledge:
  "glm/glm-5.1":
    avg_latency: { p50: 2100, p95: 4500, p99: 8000 }
    avg_quality: 0.85
    best_for: ["code_generation", "translation"]
    worst_for: ["complex_reasoning", "creative_writing"]
    error_rate: 0.03
    cost_efficiency: 9.2/10
    learned_from: 3420 requests
    
Provider Knowledge:
  "kr/ (Kiro)":
    reliability: 0.98
    peak_hours: ["09:00-12:00", "14:00-17:00"]
    best_models: ["claude-sonnet-4.5", "glm-5"]
    avg_daily_quota: "unlimited"
    rate_limit_pattern: "very_rare"
    learned_from: 89 days of data
    
User Pattern Knowledge:
  "default_user":
    preferred_models: ["claude-opus", "glm-5.1"]
    peak_usage_hours: [9, 10, 11, 14, 15]
    avg_daily_requests: 87
    avg_daily_tokens: 245000
    common_task_types: ["code_gen: 45%", "debug: 25%", "review: 20%", "doc: 10%"]
    budget_sensitivity: "medium"
    quality_preference: "high"
    learned_from: 89 days of data
    
Compression Knowledge:
  "git_diff_compression":
    avg_savings: 0.42
    best_strategy: "semantic_hunk_collapse"
    quality_impact: 0.02 (minimal)
    language_specific: { "js": 0.48, "python": 0.45, "go": 0.38 }
    learned_from: 1520 samples
```

**3. Procedural Memory (Cara melakukan sesuatu)**
```
Aturan dan strategi yang sudah terbukti berhasil:

Routing Rules (auto-generated):
  IF task_type == "code_generation" AND hour IN peak_hours:
    → prefer glm/glm-5.1 (99.2% success, $0.002)
    → fallback kr/claude-sonnet (97.8% success, $0.000)
    
  IF user_budget_remaining < 20%:
    → strict free-only mode
    → prefer kr/ then oc/
    
  IF model == "claude-opus" AND provider == "cc/":
    → check quota first (avg exhaustion at 48K tokens)
    → if quota < 5K → preemptive fallback to kr/claude-sonnet

Fallback Rules (auto-generated):
  IF error == "429" AND provider == "cc/":
    → 87% chance quota exhausted → immediate mesh failover
    → don't waste time retrying (learned: retry success rate only 12%)
    
  IF error == "timeout" AND model_family == "claude":
    → try different provider in mesh (not same provider)
    → learned: same provider timeout = 73% chance of repeated timeout

Compression Rules (auto-generated):
  IF context_fill > 80% AND content_type == "git_diff":
    → apply aggressive multi-pass compression
    → learned: quality impact only 3% at aggressive level
    
  IF model == "glm-5.1" AND task == "code":
    → compress more aggressively (model handles compressed input well)
    → learned: quality score only drops 1.2% with 50% compression
```

**Memory Persistence:**
```
Storage Location: ~/.adnify/memory/
├── episodic/              # Recent detailed events (SQLite)
│   └── episodes.db        # Rolling 90-day window
├── semantic/              # Summarized knowledge (SQLite)  
│   └── knowledge.db       # Permanent, grows over time
├── procedural/            # Compiled rules (SQLite)
│   └── rules.db           # Auto-generated + user-verified
├── models/                # Trained ML models
│   ├── neural-router.onnx # Trained routing model
│   ├── embeddings/        # Cached embeddings
│   └── compression/       # Learned compression params
└── distill/               # Distillation checkpoints
    └── last-distill.json  # Last distillation metadata
```

**Memory Lifecycle:**
```
                    ┌─────────────┐
                    │   EVENT     │
                    │ (real-time) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  EPISODIC   │ ← Store raw event immediately
                    │  MEMORY     │
                    │  (SQLite)   │
                    └──────┬──────┘
                           │
              ┌────────────┤ Every 6 hours or 1000 events
              │            │ (whichever comes first)
              │     ┌──────▼──────┐
              │     │  DISTILLER  │ ← Summarize, extract patterns
              │     │  ENGINE     │
              │     └──────┬──────┘
              │            │
              │     ┌──────▼──────┐
              │     │  SEMANTIC   │ ← Update knowledge base
              │     │  MEMORY     │
              │     │  (permanent)│
              │     └──────┬──────┘
              │            │
              │     ┌──────▼──────┐
              │     │  PROCEDURAL │ ← Generate/update rules
              │     │  MEMORY     │
              │     │  (compiled) │
              │     └──────┬──────┘
              │            │
              │     ┌──────▼──────┐
              │     │  COMPACT    │ ← Archive old episodic data
              │     │  EPISODIC   │   (keep 90 days raw, forever summarized)
              │     └─────────────┘
              │
     User restarts?
              │
     ┌────────▼────────┐
     │  AUTO-RESTORE   │ ← Load all 3 memory types
     │  FROM DISK      │ ← Resume exactly where left off
     └─────────────────┘ ← Zero amnesia
```

---

### 4.17 EXPERIENCE DISTILLER (Breakthrough #17)

**Konsep:** Engine yang secara berkala merangkum semua experience menjadi knowledge yang lebih padat dan actionable. Seperti otak manusia yang mengonsolidasi memori saat tidur.

**Distillation Pipeline:**
```
┌─────────────────────────────────────────────────────────────┐
│                  EXPERIENCE DISTILLER                        │
│                                                              │
│  Trigger: Every 6 hours OR every 1000 new episodes          │
│                                                              │
│  Step 1: AGGREGATE                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SELECT all episodic data since last distillation       │ │
│  │ Group by: provider, model, task_type, hour, outcome    │ │
│  │ Calculate: avg, p50, p95, success_rate, error_rate     │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  Step 2: EXTRACT PATTERNS                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pattern Mining:                                        │ │
│  │ • "Provider X fails 73% of the time between 14:00-15:00│ │
│  │ • "Model Y gives best quality for task Z"              │ │
│  │ • "User prefers model A over B for code review"        │ │
│  │ • "Compression saves most on TypeScript files"         │ │
│  │ • "Fallback from X→Y succeeds 94% of the time"        │ │
│  │                                                         │ │
│  │ Anomaly Detection:                                     │ │
│  │ • "Provider X latency increased 3x today"              │ │
│  │ • "Error rate for model Y doubled this week"           │ │
│  │ • "User usage pattern shifted to more debugging"       │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  Step 3: UPDATE KNOWLEDGE                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Merge new findings with existing semantic memory:       │ │
│  │                                                         │ │
│  │ Old: glm-5.1 avg_quality: 0.85 (from 2840 requests)    │ │
│  │ New: glm-5.1 avg_quality: 0.83 (from 580 new requests) │ │
│  │ → Updated: glm-5.1 avg_quality: 0.847 (3420 requests)  │ │
│  │                                                         │ │
│  │ Confidence-weighted merge:                              │ │
│  │ weight_new = new_samples / (new_samples + old_samples)  │ │
│  │ result = old * (1 - weight_new) + new * weight_new      │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  Step 4: GENERATE RULES                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Auto-generate procedural rules from patterns:           │ │
│  │                                                         │ │
│  │ IF pattern confidence > 85%:                            │ │
│  │   → Generate routing rule                               │ │
│  │   → Generate fallback rule                              │ │
│  │   → Generate compression rule                           │ │
│  │                                                         │ │
│  │ IF pattern contradicts existing rule:                   │ │
│  │   → Flag for review (don't auto-replace)                │ │
│  │   → Show in dashboard: "Rule X may be outdated"         │ │
│  │                                                         │ │
│  │ IF pattern is entirely new:                             │ │
│  │   → Create new rule with "auto-generated" tag           │ │
│  │   → Monitor effectiveness for 7 days                    │ │
│  │   → If effective → promote to "verified"                │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  Step 5: RETRAIN MODELS                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Retrain Neural Router with new data:                    │ │
│  │ • Add new training samples from episodes                │ │
│  │ • Retrain ONNX model                                    │ │
│  │ • Validate accuracy > old model                         │ │
│  │ • If better → deploy new model                          │ │
│  │ • If worse → keep old model, log failure                │ │
│  │                                                         │ │
│  │ Update compression parameters:                          │ │
│  │ • Adjust filter aggressiveness per content type         │ │
│  │ • Update language-specific compression rules            │ │
│  │ • Refine quality thresholds based on feedback           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  Step 6: COMPACT & ARCHIVE                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Archive episodic data older than 90 days              │ │
│  │ • Keep only summarized version in semantic memory       │ │
│  │ • Optimize SQLite (VACUUM)                              │ │
│  │ • Save distillation checkpoint                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Distillation Schedule:**
```
┌─────────────┬──────────────────────┬─────────────────────┐
│ Frequency   │ What                 │ Why                  │
├─────────────┼──────────────────────┼─────────────────────┤
│ Real-time   │ Store episodes       │ No data loss         │
│ Every 1h    │ Update health scores │ Quick reaction       │
│ Every 6h    │ Full distillation    │ Pattern extraction   │
│ Every 24h   │ Rule generation      │ Procedural learning  │
│ Every 7d    │ Model retraining     │ Neural improvement   │
│ Every 30d   │ Deep analysis        │ Long-term patterns   │
│ On restart  │ Memory restoration   │ Zero amnesia         │
└─────────────┴──────────────────────┴─────────────────────┘
```

**Distillation Intelligence Level:**
```
Day 1-7:     "Learning basic patterns" — Simple statistical rules
Day 8-30:    "Understanding preferences" — User model + provider profiles
Day 31-90:   "Predicting outcomes" — Neural router accuracy improves
Day 91+:     "Expert optimization" — Proactive optimization, anomaly detection
Day 365+:    "Mastery" — Deep understanding of user workflow, auto-suggests combos
```

---

### 4.18 ADAPTIVE INTELLIGENCE LAYER (Breakthrough #18)

**Konsep:** Layer yang menghubungkan semua memory dan membuat keputusan cerdas berdasarkan accumulated knowledge.

**Intelligence Loop:**
```
                    ┌──────────────────┐
                    │   NEW REQUEST    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  CONSULT MEMORY  │
                    │                  │
                    │  Episodic:       │
                    │  "What happened  │
                    │   last time I    │
                    │   routed this    │
                    │   model?"        │
                    │                  │
                    │  Semantic:       │
                    │  "What do I know │
                    │   about this     │
                    │   provider?"     │
                    │                  │
                    │  Procedural:     │
                    │  "What rules     │
                    │   should I       │
                    │   follow?"       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  MAKE DECISION   │
                    │                  │
                    │  Confidence?     │
                    │  ├─ High (>80%)  │ → Execute automatically
                    │  ├─ Med (50-80%) │ → Execute + monitor
                    │  └─ Low (<50%)   │ → Execute + flag for review
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  EXECUTE &       │
                    │  OBSERVE         │
                    │                  │
                    │  Record outcome  │
                    │  in episodic     │
                    │  memory          │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  LEARN & ADAPT   │
                    │                  │
                    │  Was prediction  │
                    │  correct?        │
                    │  ├─ Yes → Reinforce│
                    │  └─ No  → Adjust  │
                    │                  │
                    │  Feed to next    │
                    │  distillation    │
                    └──────────────────┘
```

**Adaptive Behaviors (Semakin pintar seiring waktu):**

**1. Routing Intelligence**
```
Week 1: "I see you use claude-opus a lot. It's working well."
Week 2: "I noticed claude-opus fails more during 14:00-15:00. I'll preemptively use glm-5.1 during that time."
Week 4: "Based on 2,340 requests, I've optimized your routing. Your avg latency dropped from 4.2s to 2.8s."
Week 8: "I've learned your code-review tasks get 94% quality with claude-opus but only 78% with glm. I'll always route code reviews to claude."
```

**2. Compression Intelligence**
```
Week 1: "Applying standard compression. Saved 35% tokens."
Week 2: "I noticed you work mostly with TypeScript. I've optimized TS-specific compression. Saved 45%."
Week 4: "Your git diffs have a pattern — mostly import changes and type annotations. I've learned to preserve these while compressing other parts. Saved 52%."
Week 8: "Based on your feedback loop, I've found the optimal compression level for each task type. Average savings: 58%."
```

**3. Cost Intelligence**
```
Week 1: "You've spent $12 this week."
Week 2: "I could have saved you $4 by routing 23 requests to free providers instead of paid. I'll do this automatically now."
Week 4: "I've optimized your routing. Projected monthly cost dropped from $180 to $67 while maintaining same quality."
Week 8: "Budget alert: At current rate, you'll exceed $50 budget on June 25. I've auto-switched to cost-saving mode."
```

**4. Fallback Intelligence**
```
Week 1: "Provider A failed. Falling back to Provider B."
Week 2: "I've learned that when Provider A fails with 429, retrying is useless (12% success). I'll immediately failover from now on."
Week 4: "I've built a fallback decision tree based on 500+ failures. Average recovery time reduced from 3.2s to 0.8s."
Week 8: "I can predict provider failures 30 seconds before they happen based on latency degradation patterns. Preemptive switching active."
```

**5. Quality Intelligence**
```
Week 1: "Model X generated code. I can't assess quality yet."
Week 2: "I've noticed Model X's code has syntax errors 8% of the time. Model Y only 2%. I'll prefer Model Y for code tasks."
Week 4: "I've built quality scores for all models across 6 task types. Your 'best/code' namespace now resolves to the ACTUAL best model, not just the most expensive one."
Week 8: "Shadow testing revealed that glm-5.1 produces equal quality to claude-opus for your specific codebase patterns at 1/15th the cost. Updated routing."
```

**Memory Dashboard Widget:**
```
┌──────────────────────────────────────────────────────────────┐
│ 🧠 Memory & Learning Status                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Episodic:  12,340 events stored (90-day rolling window)     │
│ Semantic:  847 knowledge entries (permanent, growing)       │
│ Procedural: 156 auto-generated rules (134 verified ✅)      │
│                                                              │
│ Learning Progress:                                           │
│ ████████████████████░░░░ 82% ("Expert optimization")        │
│                                                              │
│ Knowledge Highlights:                                        │
│ • Best model for YOUR code: glm-5.1 (92% quality, $0.002)  │
│ • Your peak hours: 09:00-12:00, 14:00-17:00                │
│ • Your prefered style: concise, technical                   │
│ • Learned 23 unique fallback paths                          │
│ • Compression optimized for TypeScript (your main language) │
│                                                              │
│ Recent Insights:                                             │
│ 💡 "I've learned that DeepSeek V4 gives you the best       │
│    results for debugging tasks. Updated auto-routing."       │
│ ⚡ "Detected new pattern: you do more code reviews on        │
│    Fridays. I'll pre-load relevant models."                  │
│ 📊 "After 4,500 requests, I've reduced your avg latency    │
│    from 3.8s to 2.1s (45% improvement)"                     │
│ 💰 "Optimized routing saved you $127 this month vs direct  │
│    API usage. That's 68% savings."                           │
│                                                              │
│ Memory Usage: 23.4 MB / 100 MB                               │
│ Next distillation: in 2h 14m                                 │
│ Last model retrain: 5 days ago (accuracy: 94.2%)            │
│                                                              │
│ [View Knowledge Base] [View Rules] [Export Memory]           │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.19 DYNAMIC SKILL ROTATION ENGINE (Breakthrough #19)

**Konsep:** Adnify bisa me-rotasi "skill" (system prompts + behavior configs) secara dinamis per request. Setiap request mendapat satu skill yang aktif — tidak pernah dicampur. Skill dirotasi berdasarkan task type, schedule, atau user preference.

**Mengapa Ini Berbeda dari Kompetitor:**
- freegate/9router: Tidak punya konsep skill sama sekali
- OpenClaw: Punya skill tapi statis, harus manual switch
- Adnify: Skill dirotasi OTOMATIS berdasarkan konteks request

**Skill Definition:**
```typescript
interface Skill {
  id: string
  name: string
  description: string
  version: string
  author: string                   // 'system' | 'user' | 'openclaw' | 'community'
  
  // Core skill content
  systemPrompt: string             // System prompt yang di-inject
  behavior: {
    temperature?: number           // Override temperature
    maxTokens?: number             // Override max tokens
    modelPreferences?: string[]    // Preferred models for this skill
    compressionLevel?: 'none' | 'light' | 'balanced' | 'aggressive'
    responseFormat?: 'concise' | 'detailed' | 'code-only' | 'explanatory'
  }
  
  // Rotation config
  rotation: {
    enabled: boolean
    trigger: 'task_match' | 'schedule' | 'round_robin' | 'quality_based' | 'manual'
    taskTypes?: string[]           // ['code', 'debug', 'review', 'doc', 'chat']
    schedule?: string              // cron expression for schedule rotation
    priority?: number              // Higher = preferred when multiple match
    cooldownMs?: number            // Minimum time before this skill activates again
  }
  
  // Metadata
  group: string                    // Skill group name
  tags: string[]
  qualityScore?: number            // Learned quality score
  usageCount: number
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Rotation Strategies:**

**1. Task-Match Rotation (Default)**
```
Request arrives with task_type: "code_generation"
→ Search skills where rotation.taskTypes includes "code_generation"
→ Found 3 matching skills:
    skill/typescript-expert    (priority: 90, quality: 94)
    skill/fullstack-dev        (priority: 70, quality: 88)
    skill/code-general         (priority: 50, quality: 85)
→ Select "skill/typescript-expert" (highest priority)
→ Inject its systemPrompt into request
→ NEVER mix — only ONE skill active per request
```

**2. Round-Robin Rotation**
```
Group: "code-review-skills"
  Skills: [skill/code-reviewer-v1, skill/code-reviewer-v2, skill/code-reviewer-v3]

Request 1 (code-review) → skill/code-reviewer-v1
Request 2 (code-review) → skill/code-reviewer-v2
Request 3 (code-review) → skill/code-reviewer-v3
Request 4 (code-review) → skill/code-reviewer-v1 (rotate back)
```

**3. Quality-Based Rotation**
```
Track quality score per skill per task type:
  skill/typescript-expert  → code_gen quality: 94/100
  skill/fullstack-dev      → code_gen quality: 88/100

When task = code_gen → always use typescript-expert
BUT if typescript-expert has been used 10x in a row →
  rotate to fullstack-dev for 1 request (prevent staleness)
  compare quality → update scores
```

**4. Schedule-Based Rotation**
```
Morning (06:00-12:00): skill/fresh-coder    (energetic, detailed)
Afternoon (12:00-18:00): skill/focused-dev   (concise, productive)
Evening (18:00-22:00): skill/night-owl       (creative, exploratory)
Night (22:00-06:00): skill/quiet-mode        (minimal, fast)
```

**5. Weighted Random Rotation**
```
Group: "debugging-skills"
  skill/debug-detective    weight: 50%  (proven best)
  skill/log-analyzer       weight: 30%  (good for logs)
  skill/error-whisperer    weight: 20%  (experimental)

Random selection with weights → ensures variety while favoring best
```

**Rotation Rules (NO MIXING):**
```
┌──────────────────────────────────────────────────────────┐
│                   SKILL ROTATION RULES                    │
│                                                          │
│ 1. ONE SKILL PER REQUEST — never combine/mix skills      │
│ 2. Skill is injected as systemPrompt — replaces default  │
│ 3. Skill rotation happens BEFORE request reaches provider│
│ 4. If no skill matches → use default (no skill)          │
│ 5. Skills within same group rotate, never mix            │
│ 6. Cross-group: only one group active per request        │
│ 7. Skill cooldown prevents rapid re-activation           │
│ 8. Quality scores auto-update from distiller             │
└──────────────────────────────────────────────────────────┘
```

**Built-in Skills:**

| Skill | Group | Trigger | Description |
|-------|-------|---------|-------------|
| `code-architect` | coding | task=code | Designs clean, scalable code architecture |
| `debug-detective` | debugging | task=debug | Systematic debugging with root cause analysis |
| `code-reviewer` | review | task=review | Thorough code review with suggestions |
| `doc-writer` | docs | task=doc | Writes clear, comprehensive documentation |
| `api-designer` | coding | task=api | RESTful API design expert |
| `test-engineer` | testing | task=test | Comprehensive test case generation |
| `perf-optimizer` | optimization | task=perf | Performance bottleneck identification |
| `security-scanner` | security | task=security | Security vulnerability detection |
| `refactor-pro` | refactoring | task=refactor | Clean code refactoring patterns |
| `sql-architect` | database | task=sql | Database schema and query optimization |

---

### 4.20 SKILL FORGE — Create & Manage Skills (Breakthrough #20)

**Konsep:** User bisa membuat custom skills, mengelompokkannya, mengimport dari OpenClaw, dan mengelola semuanya dari dashboard.

**Skill Creation:**
```
┌──────────────────────────────────────────────────────────────┐
│ ⚒️ Skill Forge — Create New Skill                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Basic Info:                                                  │
│   Name: [my-react-expert           ]                        │
│   Description: [React/Next.js specialist with TypeScript  ] │
│   Version: [1.0.0]   Author: [user]                        │
│   Tags: [react, nextjs, typescript, frontend]               │
│                                                              │
│ System Prompt:                                               │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ You are an expert React and Next.js developer.       │  │
│   │ Always use TypeScript with strict typing.            │  │
│   │ Prefer functional components with hooks.             │  │
│   │ Use Server Components when possible.                 │  │
│   │ Follow the App Router pattern.                       │  │
│   │ Error boundaries are required for all data fetching. │  │
│   │ ...                                                  │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│ Behavior Overrides:                                          │
│   Temperature: [0.3] (lower = more deterministic)           │
│   Max Tokens: [4096]                                        │
│   Compression: [balanced ▾]                                 │
│   Response Format: [code-only ▾]                            │
│   Preferred Models: [claude-sonnet, glm-5.1, deepseek]      │
│                                                              │
│ Rotation Config:                                             │
│   Enable Rotation: [✓]                                      │
│   Trigger: [task_match ▾]                                   │
│   Task Types: [code, review] ← when to activate             │
│   Group: [frontend-skills] ← group for rotation             │
│   Priority: [80] ← higher = preferred                       │
│   Cooldown: [30s] ← min time between activations            │
│                                                              │
│ [Test Skill]  [Save as Draft]  [Publish]                    │
└──────────────────────────────────────────────────────────────┘
```

**OpenClaw Skill Import:**
```
┌──────────────────────────────────────────────────────────────┐
│ 📥 Import from OpenClaw                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Source: [OpenClaw Registry URL or local path]                │
│                                                              │
│ Found 5 skills:                                              │
│   ☑ skill/openclaw-code-review     (v2.1) — Code review     │
│   ☑ skill/openclaw-debug           (v1.8) — Debug assistant │
│   ☐ skill/openclaw-refactor        (v3.0) — Refactoring     │
│   ☐ skill/openclaw-test-gen        (v1.5) — Test generator  │
│   ☑ skill/openclaw-api-design      (v2.0) — API designer    │
│                                                              │
│ Import Options:                                              │
│   Import to group: [openclaw-imports]                        │
│   Enable rotation: [✓]                                      │
│   Map task types automatically: [✓]                          │
│                                                              │
│ [Import Selected (3 skills)]                                 │
└──────────────────────────────────────────────────────────────┘
```

**Skill Compatibility Layer (OpenClaw → Adnify):**
```typescript
// OpenClaw skill format → Adnify skill format converter
function convertOpenClawSkill(openclawSkill: OpenClawSkill): Skill {
  return {
    id: `openclaw/${openclawSkill.id}`,
    name: openclawSkill.name,
    description: openclawSkill.description,
    version: openclawSkill.version,
    author: 'openclaw',
    systemPrompt: openclawSkill.systemPrompt || openclawSkill.instructions,
    behavior: {
      temperature: openclawSkill.temperature,
      maxTokens: openclawSkill.maxTokens,
      compressionLevel: 'balanced',
      responseFormat: 'detailed',
    },
    rotation: {
      enabled: true,
      trigger: 'task_match',
      taskTypes: mapOpenClawCategories(openclawSkill.categories),
      priority: openclawSkill.priority || 50,
      cooldownMs: 30000,
    },
    group: 'openclaw-imports',
    tags: openclawSkill.tags || [],
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
```

---

### 4.21 SKILL GROUPS — Organize & Rotate by Group (Breakthrough #21)

**Konsep:** Skills dikelompokkan menjadi groups. Setiap group punya rotasi sendiri. Satu request hanya pernah menggunakan SATU skill dari SATU group. Tidak pernah mencampur.

**Group Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    SKILL GROUPS                              │
│                                                              │
│  📁 coding-skills (active)                                   │
│  │  ├── skill/typescript-expert    (priority: 90) ★ 94/100 │
│  │  ├── skill/python-wizard        (priority: 80)   91/100 │
│  │  ├── skill/go-specialist        (priority: 70)   88/100 │
│  │  └── skill/rustacean            (priority: 60)   86/100 │
│  │   Rotation: round_robin | task_match                     │
│  │   Active skill: skill/typescript-expert                  │
│  │                                                          │
│  📁 debugging-skills (active)                                │
│  │  ├── skill/debug-detective      (priority: 90) ★ 95/100 │
│  │  ├── skill/log-analyzer         (priority: 70)   89/100 │
│  │  └── skill/error-whisperer      (priority: 50)   82/100 │
│  │   Rotation: quality_based                                │
│  │   Active skill: skill/debug-detective                    │
│  │                                                          │
│  📁 review-skills (active)                                   │
│  │  ├── skill/code-reviewer        (priority: 90)   93/100 │
│  │  └── skill/arch-reviewer        (priority: 80)   87/100 │
│  │   Rotation: task_match                                   │
│  │   Active skill: skill/code-reviewer                      │
│  │                                                          │
│  📁 openclaw-imports (active)                                │
│  │  ├── skill/openclaw-code-review (priority: 70)   85/100 │
│  │  ├── skill/openclaw-debug       (priority: 60)   83/100 │
│  │  └── skill/openclaw-api-design  (priority: 60)   81/100 │
│  │   Rotation: round_robin                                  │
│  │                                                          │
│  📁 custom-experiments (draft)                               │
│  │  └── skill/my-experiment-v1     (priority: 50)   ??/100 │
│  │   Rotation: manual                                       │
│                                                              │
│  ★ = highest quality in group                               │
│  Active = skill that will be used on next matching request   │
└─────────────────────────────────────────────────────────────┘
```

**Group Resolution per Request:**
```
Request arrives: task_type = "code_generation", lang = "typescript"

1. Find matching groups:
   coding-skills → has skills for "code" task → MATCH
   debugging-skills → no skills for "code" task → SKIP
   review-skills → no skills for "code" task → SKIP

2. Select group: coding-skills (only matching group)

3. Select skill within group (based on group's rotation strategy):
   round_robin → next in rotation → skill/python-wizard
   OR task_match → match lang=typescript → skill/typescript-expert
   
4. Apply skill:
   - Inject systemPrompt from skill/typescript-expert
   - Apply behavior overrides (temperature, maxTokens, etc.)
   - Apply model preferences
   
5. Send to provider with skill active

Result: ONE group, ONE skill, NO mixing
```

**Group Configuration:**
```typescript
interface SkillGroup {
  id: string
  name: string
  description: string
  
  // Which skills belong to this group
  skillIds: string[]
  
  // Rotation config for this group
  rotation: {
    strategy: 'round_robin' | 'task_match' | 'quality_based' | 'weighted_random' | 'schedule'
    taskTypes: string[]         // Which task types trigger this group
    languages?: string[]        // Optional: only match specific languages
    schedule?: string           // Cron for schedule-based rotation
  }
  
  // Group state
  activeSkillId: string         // Currently active skill in rotation
  rotationIndex: number         // For round-robin tracking
  lastRotatedAt: Date
  
  // Group status
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Skill Quality Tracking (Integration with Distiller):**
```
Every distillation run (every 6 hours):

1. Analyze requests grouped by skill:
   skill/typescript-expert:
     total_requests: 234
     avg_quality_score: 94/100
     avg_latency: 2.8s
     avg_tokens_saved: 45%
     user_acceptance_rate: 91% (did user retry after this skill?)
   
   skill/python-wizard:
     total_requests: 187
     avg_quality_score: 91/100
     avg_latency: 3.1s
     avg_tokens_saved: 42%
     user_acceptance_rate: 88%

2. Update skill quality scores:
   typescript-expert: 94 → 94 (stable)
   python-wizard: 91 → 92 (improving)

3. Auto-adjust rotation priorities:
   If quality_based rotation:
     → Always prefer typescript-expert for TypeScript code
     → Rotate to python-wizard only for Python code
   
4. Generate insights:
   "skill/typescript-expert is your best coding skill (94/100 quality)"
   "skill/debug-detective has 95% quality — consider using it more"
   "skill/my-experiment-v1 quality dropped to 72/100 — review needed"
```

**Skill Dashboard Page:**
```
┌──────────────────────────────────────────────────────────────┐
│ ⚒️ Skills                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ Active Rotations ───────────────────────────────────────┐│
│ │                                                          ││
│ │ coding-skills:                                           ││
│ │   [typescript-expert] → python-wizard → go-specialist    ││
│ │   ▲ active      rotation: round_robin                    ││
│ │                                                          ││
│ │ debugging-skills:                                        ││
│ │   [debug-detective] → log-analyzer → error-whisperer     ││
│ │   ▲ active      rotation: quality_based                  ││
│ │                                                          ││
│ │ review-skills:                                           ││
│ │   [code-reviewer] → arch-reviewer                        ││
│ │   ▲ active      rotation: task_match                     ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Skill Performance ──────────────────────────────────────┐│
│ │                                                          ││
│ │ Skill                 │ Used │ Quality │ Accept │ Avg ms ││
│ │───────────────────────┼──────┼─────────┼────────┼────────││
│ │ typescript-expert     │ 234  │ 94/100  │ 91%    │ 2.8s   ││
│ │ debug-detective       │ 189  │ 95/100  │ 93%    │ 3.1s   ││
│ │ code-reviewer         │ 156  │ 93/100  │ 90%    │ 4.2s   ││
│ │ python-wizard         │ 187  │ 91/100  │ 88%    │ 3.1s   ││
│ │ go-specialist         │  98  │ 88/100  │ 85%    │ 2.9s   ││
│ │ openclaw-debug        │  67  │ 83/100  │ 80%    │ 3.5s   ││
│ │ my-experiment-v1      │  12  │ 72/100  │ 75%    │ 4.1s   ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ [+ Create Skill] [📥 Import from OpenClaw] [⚙️ Manage Groups]│
└──────────────────────────────────────────────────────────────┘
```

**Skill Creation from Experience (Integration with Memory):**
```
After 30+ days of learning, Distiller can AUTO-SUGGEST new skills:

"I've noticed that when you work on React projects, you always 
customize the system prompt to include TypeScript strict mode, 
Server Components, and App Router patterns.

This combination has produced 94% quality across 450 requests.

[Create as Skill: 'react-typescript-expert']"

→ User clicks "Create" → Skill auto-populated from learned patterns
→ Added to "coding-skills" group
→ Immediately available for rotation
```

**Skill Import Sources:**
1. **OpenClaw Registry** — Import skills from OpenClaw's skill marketplace
2. **Local Files** — Import `.md` or `.json` skill files from disk
3. **URL** — Import skill from any URL
4. **Community** — Import shared skills from other Adnify users
5. **Auto-Generated** — Skills auto-created by Distiller from user patterns

---

## 5. Dashboard — The Intelligence Center

### 5.1 Dashboard Pages

| Page | Description | Key Widgets |
|------|-------------|-------------|
| **Command Center** | Real-time overview | Neural Router status, live request feed, cost ticker, savings counter |
| **Providers** | Provider management | Health matrix, mesh topology, auto-discovery |
| **Models** | Model browser | Quality benchmarks, pricing comparison, namespace resolver |
| **Routes** | Routing & Combos | Neural Router config, combo builder, pipeline builder |
| **Skills** | Skill management | Skill forge, rotation config, group manager, OpenClaw import |
| **Intelligence** | AI Analytics | Predictions, benchmarks, forensics, recommendations |
| **Playground** | Chat playground | Multi-model compare, token analyzer, pipeline preview |
| **Vault** | Security & Config | API keys, OAuth sessions, access control |
| **Settings** | App settings | General, cache, compression, notifications |

### 5.2 Command Center (Home)

```
┌──────────────────────────────────────────────────────────────┐
│ 🧠 Adnify Neural Gateway                         v2.0.0     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Requests │ │ Saved    │ │ Cost     │ │ Active   │        │
│ │ 1,247    │ │ $127.30  │ │ $34.20   │ │ 12 prov  │        │
│ │ today:89 │ │ 42% tok  │ │ budget:  │ │ mesh:OK  │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│ ┌─ Neural Router ──────────────────────────────────────────┐│
│ │ Mode: Auto (Neural)    Confidence: 87%    Accuracy: 94% ││
│ │ Training data: 1,247 requests    Last trained: 2m ago    ││
│ │                                                          ││
│ │ Recent decisions:                                        ││
│ │ 14:23:02 → glm/glm-5.1 (cost-optimal) ✅ 2.1s          ││
│ │ 14:23:01 → kr/claude-sonnet (free-tier) ✅ 3.8s         ││
│ │ 14:22:58 → ds/deepseek-v4 (mesh-failover) ✅ 3.2s      ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Semantic Cache ─────────────────────────────────────────┐│
│ │ Hit rate: 18.3%    Entries: 342    Size: 2.1MB           ││
│ │ Tokens saved: 89,400    Cost saved: $0.42                ││
│ │                                                          ││
│ │ Top cached queries:                                      ││
│ │ 1. "async await js" (hit 23x)                           ││
│ │ 2. "react hooks" (hit 18x)                              ││
│ │ 3. "git merge conflict" (hit 15x)                       ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Live Feed ──────────────────────────────────────────────┐│
│ │ 14:23:02 POST /v1/chat/completions → glm/glm-5.1 200    ││
│ │ 14:23:01 POST /v1/chat/completions → kr/claude-sn 200   ││
│ │ 14:22:58 POST /v1/chat/completions → ds/deepseek  200   ││
│ │ 14:22:55 POST /v1/chat/completions → an/claude-op  429  ││
│ │           └─ Fallback → ds/deepseek (auto-recovered)     ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Recommendations ────────────────────────────────────────┐│
│ │ 💡 Enable aggressive compression (save extra 12%)        ││
│ │ 💡 Add GLM account #2 (load balance, reduce 429s)       ││
│ │ ⚠️ Claude Code quota 94% used, reset in 23min            ││
│ │ 💡 Semantic cache similarity: try 0.93 for more hits     ││
│ └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Intelligence Page

**Sub-tabs:**
1. **Predictions** — Cost prediction, usage forecast, budget projection
2. **Benchmarks** — Model quality comparison, A/B testing results
3. **Forensics** — Error analysis, root cause, suggestions
4. **Recommendations** — AI-generated optimization suggestions
5. **Pattern Analysis** — Usage patterns, peak hours, model preferences

### 5.4 Multi-Model Playground

**Fitur unik:** Bandingkan response dari 2-4 model secara side-by-side.

```
┌─────────────────────────────────────────────────────────────┐
│ Playground — Multi-Model Compare                            │
│                                                              │
│ Prompt: "Write a binary search in Go"                       │
│                                                              │
│ ┌─ Claude Sonnet 4.5 ─────┐ ┌─ GPT-5.5 ────────────────┐ │
│ │ ```go                    │ │ ```go                     │ │
│ │ func binarySearch(...) { │ │ func binarySearch(...) {  │ │
│ │   // implementation      │ │   // implementation       │ │
│ │ }                        │ │ }                         │ │
│ │ ```                      │ │ ```                       │ │
│ │                          │ │                           │ │
│ │ Tokens: 245              │ │ Tokens: 198               │ │
│ │ Latency: 3.2s            │ │ Latency: 2.1s             │ │
│ │ Quality: 92/100          │ │ Quality: 88/100           │ │
│ │ Cost: $0.000 (free)      │ │ Cost: $0.012              │ │
│ └──────────────────────────┘ └───────────────────────────┘ │
│                                                              │
│ ┌─ DeepSeek V4 ────────────┐ ┌─ GLM-5.1 ────────────────┐ │
│ │ (streaming...)           │ │ (streaming...)            │ │
│ └──────────────────────────┘ └───────────────────────────┘ │
│                                                              │
│ [Send to All] [Export Comparison] [Save as Benchmark]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Metric | Target |
|--------|--------|
| Proxy overhead | <50ms (p95) |
| Neural Router inference | <5ms |
| Semantic cache lookup | <10ms |
| Embedding generation | <15ms |
| Dashboard LCP | <800ms |
| Memory idle | <200MB |
| Memory under load | <512MB |
| Cold start | <3 seconds |

### 6.2 Scalability
- Handle 100+ concurrent requests
- 10,000+ cached entries
- 100,000+ request logs
- 40+ providers simultaneously

### 6.3 Security
- AES-256 encryption for stored credentials
- WebAuthn support (passwordless)
- Optional API key enforcement
- Rate limiting per IP + per API key
- CORS strict mode option
- No secrets in logs or error messages
- Encrypted cloud sync (E2E)

### 6.4 Compatibility
- Bun 1.1+ (primary) / Node.js 20+ (fallback)
- Windows, macOS, Linux
- Chrome, Firefox, Safari, Edge
- Mobile responsive (PWA-ready)
- MCP protocol v2024-11-05

---

## 7. Project Phases

### Phase 1 — Foundation (Week 1-2)
- Project setup (Next.js 15, Bun, TypeScript, SQLite)
- Provider adapter interface + 5 providers
- Basic routing (priority + latency)
- OpenAI-compatible API
- Basic dashboard

### Phase 2 — Intelligence Engine (Week 3-5)
- Neural Router (ONNX Runtime, local ML)
- Semantic Cache (MiniLM embeddings)
- Adaptive Token Squeezer
- Predictive Cost Engine
- Smart Request Forensics
- **Persistent Memory Engine (Episodic + Semantic + Procedural)**
- **Experience Distiller (auto-summarization & pattern extraction)**

### Phase 3 — Advanced Platform (Week 6-8)
- Universal Model Namespace
- Provider Mesh Network
- Model Quality Benchmark
- Prompt Pre-processor
- Request Pipeline Builder
- Conversation Context Manager
- MCP Gateway
- **Adaptive Intelligence Layer (connects memory to all decisions)**
- **Dynamic Skill Rotation Engine**
- **Skill Forge (create, import from OpenClaw, group)**
- **Skill Groups (categorize & rotate by group)**

### Phase 4 — Dashboard & UX (Week 9-10)
- Full Intelligence Center dashboard
- Multi-Model Playground
- Provider auto-discovery
- Provider Arbitrage engine
- Collaboration features

### Phase 5 — Polish & Release (Week 11-12)
- 40+ providers
- Plugin system
- Testing (unit, integration, E2E)
- Documentation
- npm publish + CLI
- v2.0.0 release

**Total: 12 Minggu**

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Token savings | 40-65% | Before/after RTK+ |
| Request savings via cache | 15-30% | Semantic cache hit rate |
| Neural Router accuracy | >90% | Correct provider selection |
| Fallback speed | <1 second | Time to alternative response |
| Cost reduction vs direct | >60% | Total spend comparison |
| Setup time | <3 minutes | Zero-config auto-discovery |
| Dashboard load | <800ms | LCP measurement |
| Provider uptime | 99.99% | Via mesh failover |
| Memory retention | 100% | Zero data loss on restart |
| Learning improvement | >20% | Latency/cost reduction after 30 days vs day 1 |
| Distillation accuracy | >85% | Auto-generated rules that are correct |
| Knowledge growth | Linear | Knowledge entries increase monotonically |
