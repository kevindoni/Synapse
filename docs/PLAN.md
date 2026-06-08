# Implementation Plan — Adnify v2.0
# Next-Gen AI Gateway & Intelligence Platform

> **Codename:** NEXUS  
> **Versi:** 2.0.0  
> **Tanggal:** 8 Juni 2026  
> **Estimasi Total:** 12 Minggu  

---

## 0. Project Structure

```
adnify/
├── src/
│   ├── app/                              # Next.js 15 App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # → redirect /dashboard
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                       # Auth group
│   │   │   ├── login/page.tsx
│   │   │   └── webauthn/page.tsx
│   │   │
│   │   ├── dashboard/                    # Dashboard pages
│   │   │   ├── layout.tsx                # Sidebar + header + realtime
│   │   │   ├── page.tsx                  # Command Center
│   │   │   ├── providers/
│   │   │   │   ├── page.tsx              # Provider grid
│   │   │   │   ├── [id]/page.tsx         # Provider detail
│   │   │   │   └── discover/page.tsx     # Auto-discovery
│   │   │   ├── models/
│   │   │   │   ├── page.tsx              # Model browser
│   │   │   │   └── benchmark/page.tsx    # Quality benchmark
│   │   │   ├── routes/
│   │   │   │   ├── page.tsx              # Routes & combos
│   │   │   │   ├── new/page.tsx          # Combo builder
│   │   │   │   └── pipeline/page.tsx     # Pipeline builder
│   │   │   ├── skills/
│   │   │   │   ├── page.tsx              # Skill browser & rotation status
│   │   │   │   ├── new/page.tsx          # Skill forge (create new skill)
│   │   │   │   ├── [id]/page.tsx         # Skill detail & edit
│   │   │   │   ├── groups/page.tsx       # Skill group manager
│   │   │   │   └── import/page.tsx       # Import from OpenClaw / URL / file
│   │   │   ├── intelligence/
│   │   │   │   ├── page.tsx              # Predictions
│   │   │   │   ├── forensics/page.tsx    # Request forensics
│   │   │   │   └── patterns/page.tsx     # Pattern analysis
│   │   │   ├── memory/
│   │   │   │   ├── page.tsx              # Memory status & knowledge base
│   │   │   │   ├── knowledge/page.tsx    # Browse semantic memory
│   │   │   │   ├── rules/page.tsx        # View procedural rules
│   │   │   │   └── insights/page.tsx     # Learning insights timeline
│   │   │   ├── playground/
│   │   │   │   └── page.tsx              # Multi-model playground
│   │   │   ├── vault/
│   │   │   │   └── page.tsx              # Security & keys
│   │   │   └── settings/
│   │   │       └── page.tsx              # App settings
│   │   │
│   │   └── api/
│   │       ├── v1/                       # OpenAI-compatible
│   │       │   ├── models/route.ts
│   │       │   ├── chat/completions/route.ts
│   │       │   ├── completions/route.ts
│   │       │   └── messages/route.ts     # Claude-compatible
│   │       │
│   │       ├── mcp/                      # MCP Gateway
│   │       │   ├── route.ts              # MCP endpoint
│   │       │   ├── tools/route.ts
│   │       │   └── resources/route.ts
│   │       │
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── webauthn/
│   │       │       ├── register/route.ts
│   │       │       └── verify/route.ts
│   │       │
│   │       ├── providers/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   ├── [id]/models/route.ts
│   │       │   ├── [id]/health/route.ts
│   │       │   ├── [id]/quota/route.ts
│   │       │   ├── [id]/accounts/route.ts
│   │       │   └── discover/route.ts     # Auto-discovery scan
│   │       │
│   │       ├── models/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── benchmark/route.ts
│   │       │
│   │       ├── routes/
│   │       │   ├── combos/route.ts
│   │       │   ├── combos/[id]/route.ts
│   │       │   ├── namespaces/route.ts
│   │       │   └── pipeline/route.ts
│   │       │
│   │       ├── intelligence/
│   │       │   ├── neural-router/route.ts
│   │       │   ├── predictions/route.ts
│   │       │   ├── forensics/route.ts
│   │       │   ├── recommendations/route.ts
│   │       │   └── patterns/route.ts
│   │       │
│   │       ├── analytics/
│   │       │   ├── usage/route.ts
│   │       │   ├── cost/route.ts
│   │       │   ├── tokens/route.ts
│   │       │   ├── savings/route.ts
│   │       │   └── export/route.ts
│   │       │
│   │       ├── cache/
│   │       │   ├── route.ts              # GET stats, DELETE clear
│   │       │   └── semantic/route.ts     # Semantic cache management
│   │       │
│   │       ├── mesh/
│   │       │   ├── route.ts              # Mesh topology
│   │       │   └── arbitrage/route.ts    # Cost comparison
│   │       │
│   │       ├── memory/                    # Memory & Learning API
│   │       │   ├── route.ts              # GET memory status
│   │       │   ├── knowledge/route.ts    # GET knowledge base
│   │       │   ├── rules/route.ts        # GET/PUT procedural rules
│   │       │   ├── insights/route.ts     # GET learning insights
│   │       │   ├── distill/route.ts      # POST trigger distillation
│   │       │   └── export/route.ts       # GET export all memory
│   │       │
│   │       ├── skills/                    # Skill Management API
│   │       │   ├── route.ts              # GET list, POST create
│   │       │   ├── [id]/route.ts         # GET, PUT, DELETE skill
│   │       │   ├── [id]/test/route.ts    # POST test skill with sample request
│   │       │   ├── groups/route.ts       # GET list, POST create group
│   │       │   ├── groups/[id]/route.ts  # GET, PUT, DELETE group
│   │       │   ├── rotation/route.ts     # GET status, PUT update rotation
│   │       │   ├── import/
│   │       │   │   ├── openclaw/route.ts # POST import from OpenClaw
│   │       │   │   ├── url/route.ts      # POST import from URL
│   │       │   │   └── file/route.ts     # POST import from file
│   │       │   └── export/route.ts       # GET export skill as JSON/MD
│   │       │
│   │       ├── quota/route.ts
│   │       ├── health/route.ts
│   │       ├── metrics/route.ts
│   │       ├── keys/route.ts
│   │       ├── settings/route.ts
│   │       └── events/route.ts           # SSE realtime events
│   │
│   ├── lib/
│   │   ├── config/
│   │   │   ├── index.ts                  # Config loader + watcher
│   │   │   ├── defaults.ts
│   │   │   ├── schema.ts                 # Zod schema
│   │   │   └── secrets.ts                # Encryption for config
│   │   │
│   │   ├── db/
│   │   │   ├── index.ts                  # Database singleton
│   │   │   ├── schema.ts                 # Drizzle schema
│   │   │   ├── migrate.ts
│   │   │   ├── seed.ts
│   │   │   └── vector.ts                 # Vector operations for semantic cache
│   │   │
│   │   ├── neural/                       # Neural Router Engine
│   │   │   ├── index.ts                  # Router orchestrator
│   │   │   ├── model.ts                  # ONNX model wrapper
│   │   │   ├── features.ts              # Feature extraction
│   │   │   ├── trainer.ts               # Model trainer (background)
│   │   │   ├── predictor.ts             # Fast inference
│   │   │   ├── strategies/
│   │   │   │   ├── neural.ts            # ML-based routing
│   │   │   │   ├── hybrid.ts            # Neural + rules
│   │   │   │   ├── priority.ts          # Traditional
│   │   │   │   ├── latency.ts
│   │   │   │   ├── cost.ts
│   │   │   │   └── round-robin.ts
│   │   │   └── feedback.ts              # Feedback loop
│   │   │
│   │   ├── cache/
│   │   │   ├── index.ts                  # Cache orchestrator
│   │   │   ├── semantic.ts              # Semantic cache (embedding-based)
│   │   │   ├── exact.ts                 # Exact match cache
│   │   │   ├── embedding.ts             # MiniLM embedding generator
│   │   │   ├── similarity.ts            # Vector similarity search
│   │   │   └── eviction.ts             # Smart eviction policy
│   │   │
│   │   ├── squeezer/                     # Adaptive Token Squeezer
│   │   │   ├── index.ts                  # Squeezer orchestrator
│   │   │   ├── pipeline.ts              # Multi-pass pipeline
│   │   │   ├── classifier.ts            # Content type classifier
│   │   │   ├── budget.ts                # Token budget allocator
│   │   │   ├── quality.ts               # Quality scoring
│   │   │   ├── filters/
│   │   │   │   ├── git-diff-semantic.ts # Semantic diff compression
│   │   │   │   ├── git-status.ts
│   │   │   │   ├── grep-results.ts
│   │   │   │   ├── file-tree.ts
│   │   │   │   ├── log-analyzer.ts
│   │   │   │   ├── code-ast.ts          # AST-based code compression
│   │   │   │   ├── numbered-content.ts
│   │   │   │   ├── smart-truncate.ts
│   │   │   │   ├── context-dedup.ts     # Deduplicate context
│   │   │   │   └── adaptive-general.ts  # General adaptive filter
│   │   │   └── language/
│   │   │       ├── javascript.ts        # JS/TS-aware compression
│   │   │       ├── python.ts
│   │   │       ├── go.ts
│   │   │       ├── rust.ts
│   │   │       └── generic.ts
│   │   │
│   │   ├── providers/
│   │   │   ├── types.ts
│   │   │   ├── registry.ts
│   │   │   ├── base-adapter.ts
│   │   │   ├── mesh.ts                  # Provider Mesh Network
│   │   │   ├── discovery.ts             # Auto-discovery
│   │   │   ├── oauth/
│   │   │   │   ├── manager.ts
│   │   │   │   ├── claude-code.ts
│   │   │   │   ├── codex.ts
│   │   │   │   ├── github.ts
│   │   │   │   ├── cursor.ts
│   │   │   │   ├── kiro.ts
│   │   │   │   └── antigravity.ts
│   │   │   ├── api-key/
│   │   │   │   ├── openai.ts
│   │   │   │   ├── anthropic.ts
│   │   │   │   ├── gemini.ts
│   │   │   │   ├── deepseek.ts
│   │   │   │   ├── openrouter.ts
│   │   │   │   ├── groq.ts
│   │   │   │   ├── xai.ts
│   │   │   │   ├── mistral.ts
│   │   │   │   ├── together.ts
│   │   │   │   ├── fireworks.ts
│   │   │   │   ├── cerebras.ts
│   │   │   │   ├── cohere.ts
│   │   │   │   ├── glm.ts
│   │   │   │   ├── minimax.ts
│   │   │   │   ├── kimi.ts
│   │   │   │   ├── siliconflow.ts
│   │   │   │   ├── nvidia.ts
│   │   │   │   ├── perplexity.ts
│   │   │   │   ├── nebius.ts
│   │   │   │   ├── chutes.ts
│   │   │   │   ├── hyperbolic.ts
│   │   │   │   └── custom.ts
│   │   │   ├── free/
│   │   │   │   ├── opencode.ts
│   │   │   │   └── vertex.ts
│   │   │   └── local/
│   │   │       ├── ollama.ts
│   │   │       └── lmstudio.ts
│   │   │
│   │   ├── translate/
│   │   │   ├── index.ts                  # Translation pipeline
│   │   │   ├── detector.ts              # Format auto-detection
│   │   │   ├── openai.ts
│   │   │   ├── claude.ts
│   │   │   ├── gemini.ts
│   │   │   ├── cursor.ts
│   │   │   ├── kiro.ts
│   │   │   ├── vertex.ts
│   │   │   ├── ollama.ts
│   │   │   ├── responses.ts
│   │   │   └── mcp.ts                   # MCP format
│   │   │
│   │   ├── pipeline/                     # Request Pipeline Builder
│   │   │   ├── index.ts                  # Pipeline engine
│   │   │   ├── builder.ts               # Pipeline builder
│   │   │   ├── nodes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── preprocessor.ts      # Prompt pre-processor
│   │   │   │   ├── squeezer.ts
│   │   │   │   ├── cache-check.ts
│   │   │   │   ├── cache-store.ts
│   │   │   │   ├── router.ts
│   │   │   │   ├── translator.ts
│   │   │   │   ├── context-manager.ts   # Context window manager
│   │   │   │   └── custom.ts            # User custom JS nodes
│   │   │   └── conditions.ts            # Conditional routing
│   │   │
│   │   ├── preprocessor/                 # Prompt Pre-processor
│   │   │   ├── index.ts
│   │   │   ├── system-prompts.ts        # Optimal system prompt templates
│   │   │   ├── dedup.ts                 # Context deduplication
│   │   │   ├── clarity.ts              # Instruction clarity optimization
│   │   │   └── context-optimize.ts      # Code context optimization
│   │   │
│   │   ├── context/                      # Conversation Context Manager
│   │   │   ├── index.ts
│   │   │   ├── window.ts                # Sliding window
│   │   │   ├── summarizer.ts            # Auto-summarization
│   │   │   ├── ranker.ts                # Relevance ranking
│   │   │   └── budget.ts                # Token budget allocation
│   │   │
│   │   ├── forensics/                    # Smart Request Forensics
│   │   │   ├── index.ts
│   │   │   ├── analyzer.ts              # Error analyzer
│   │   │   ├── root-cause.ts            # Root cause detection
│   │   │   └── suggestions.ts           # Auto-suggestions
│   │   │
│   │   ├── prediction/                   # Predictive Cost Engine
│   │   │   ├── index.ts
│   │   │   ├── forecaster.ts            # Usage forecasting
│   │   │   ├── budgetter.ts             # Budget management
│   │   │   ├── optimizer.ts            # Auto-optimization rules
│   │   │   └── arbitrage.ts            # Provider arbitrage
│   │   │
│   │   ├── benchmark/                    # Model Quality Benchmark
│   │   │   ├── index.ts
│   │   │   ├── shadow.ts               # Shadow mode A/B testing
│   │   │   ├── scorer.ts               # Quality scoring
│   │   │   └── compare.ts              # Model comparison
│   │   │
│   │   ├── namespace/                    # Universal Model Namespace
│   │   │   ├── index.ts
│   │   │   ├── resolver.ts             # Namespace → provider resolution
│   │   │   ├── aliases.ts              # Built-in aliases
│   │   │   └── tasks.ts                # Task type definitions
│   │   │
│   │   ├── mcp/                          # MCP Gateway
│   │   │   ├── index.ts
│   │   │   ├── server.ts               # MCP server implementation
│   │   │   ├── client.ts               # MCP client for external servers
│   │   │   ├── tools.ts                # Exposed tools
│   │   │   └── resources.ts            # Exposed resources
│   │   │
│   │   ├── skills/                      # Dynamic Skill Engine
│   │   │   ├── index.ts                # Skill orchestrator
│   │   │   ├── types.ts                # Skill + SkillGroup interfaces
│   │   │   ├── registry.ts             # Skill registry (CRUD)
│   │   │   ├── groups.ts              # Skill group manager
│   │   │   ├── rotation/
│   │   │   │   ├── index.ts            # Rotation engine
│   │   │   │   ├── task-match.ts       # Task-based rotation
│   │   │   │   ├── round-robin.ts      # Round-robin rotation
│   │   │   │   ├── quality-based.ts    # Quality-score rotation
│   │   │   │   ├── schedule.ts         # Time-based rotation
│   │   │   │   └── weighted-random.ts  # Weighted random rotation
│   │   │   ├── forge.ts               # Skill creation & validation
│   │   │   ├── importer/
│   │   │   │   ├── openclaw.ts        # OpenClaw skill importer
│   │   │   │   ├── url.ts             # URL-based importer
│   │   │   │   ├── file.ts            # File-based importer
│   │   │   │   └── converter.ts       # Format converter
│   │   │   ├── executor.ts            # Apply skill to request
│   │   │   └── quality-tracker.ts     # Track skill quality scores
│   │   │
│   │   │
│   │   ├── health/
│   │   │   ├── index.ts
│   │   │   ├── checker.ts
│   │   │   ├── metrics.ts
│   │   │   └── mesh-health.ts          # Mesh-aware health
│   │   │
│   │   ├── quota/
│   │   │   ├── index.ts
│   │   │   ├── tracker.ts
│   │   │   ├── scheduler.ts
│   │   │   └── calculator.ts
│   │   │
│   │   ├── fallback/
│   │   │   ├── index.ts                 # Fallback orchestrator
│   │   │   ├── decision-tree.ts         # Decision tree fallback
│   │   │   ├── cooldown.ts
│   │   │   └── mesh-failover.ts         # Mesh-aware failover
│   │   │
│   │   ├── analytics/
│   │   │   ├── index.ts
│   │   │   ├── aggregator.ts
│   │   │   ├── exporter.ts
│   │   │   └── real-time.ts            # Real-time metrics
│   │   │
│   │   ├── auth/
│   │   │   ├── jwt.ts
│   │   │   ├── webauthn.ts             # Passwordless auth
│   │   │   ├── api-key.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── rate-limit.ts
│   │   │   ├── cors.ts
│   │   │   ├── request-id.ts
│   │   │   ├── logging.ts
│   │   │   └── error-handler.ts
│   │   │
│   │   ├── plugins/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── loader.ts
│   │   │   └── built-in/
│   │   │       ├── pii-redactor.ts
│   │   │       ├── sentiment.ts
│   │   │       ├── profanity-filter.ts
│   │   │       └── response-validator.ts
│   │   │
│   │   ├── sync/
│   │   │   ├── index.ts
│   │   │   ├── crypto.ts
│   │   │   ├── scheduler.ts
│   │   │   └── collaboration.ts        # Team sharing
│   │   │
│   │   ├── memory/                      # Persistent Memory Engine
│   │   │   ├── index.ts                # Memory orchestrator
│   │   │   ├── episodic.ts             # Episodic memory (recent events)
│   │   │   ├── semantic.ts             # Semantic memory (knowledge base)
│   │   │   ├── procedural.ts           # Procedural memory (compiled rules)
│   │   │   ├── restore.ts              # Memory restore on startup
│   │   │   └── persist.ts              # Memory persistence to disk
│   │   │
│   │   ├── distiller/                   # Experience Distiller
│   │   │   ├── index.ts                # Distiller orchestrator
│   │   │   ├── aggregator.ts           # Aggregate episodic data
│   │   │   ├── pattern-miner.ts        # Extract patterns from episodes
│   │   │   ├── knowledge-merger.ts     # Merge new findings into semantic
│   │   │   ├── rule-generator.ts       # Generate procedural rules
│   │   │   ├── model-retrainer.ts      # Retrain neural router from data
│   │   │   ├── compactor.ts            # Archive old episodic data
│   │   │   ├── scheduler.ts            # Distillation schedule (6h/24h/7d)
│   │   │   └── anomaly.ts             # Anomaly detection
│   │   │
│   │   ├── adaptive/                    # Adaptive Intelligence Layer
│   │   │   ├── index.ts                # Intelligence orchestrator
│   │   │   ├── consultant.ts           # Consult memory before decisions
│   │   │   ├── feedback-loop.ts        # Learn from outcomes
│   │   │   ├── confidence.ts           # Confidence scoring
│   │   │   ├── insight-generator.ts    # Generate human-readable insights
│   │   │   └── progress-tracker.ts     # Track learning progress over time
│   │   │
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── crypto.ts
│   │       ├── token-counter.ts
│   │       ├── stream.ts
│   │       ├── embedding.ts             # Embedding utilities
│   │       └── onnx.ts                  # ONNX Runtime wrapper
│   │
│   └── components/
│       ├── ui/                           # Radix UI + Tailwind
│       ├── layout/
│       │   ├── sidebar.tsx
│       │   ├── header.tsx
│       │   ├── mobile-nav.tsx
│       │   └── realtime-provider.tsx    # SSE realtime context
│       ├── command-center/
│       │   ├── stats-cards.tsx
│       │   ├── neural-status.tsx
│       │   ├── cache-stats.tsx
│       │   ├── live-feed.tsx
│       │   ├── recommendations.tsx
│       │   └── cost-ticker.tsx
│       ├── providers/
│       │   ├── provider-grid.tsx
│       │   ├── provider-card.tsx
│       │   ├── provider-detail.tsx
│       │   ├── connect-modal.tsx
│       │   ├── mesh-topology.tsx        # Visual mesh network
│       │   ├── auto-discover.tsx
│       │   └── health-matrix.tsx
│       ├── models/
│       │   ├── model-browser.tsx
│       │   ├── model-card.tsx
│       │   ├── benchmark-table.tsx
│       │   ├── quality-chart.tsx
│       │   └── namespace-resolver.tsx
│       ├── routes/
│       │   ├── combo-list.tsx
│       │   ├── combo-builder.tsx
│       │   ├── pipeline-editor.tsx      # Visual pipeline builder
│       │   ├── pipeline-node.tsx
│       │   └── routing-config.tsx
│       ├── intelligence/
│       │   ├── prediction-chart.tsx
│       │   ├── forensics-panel.tsx
│       │   ├── pattern-heatmap.tsx
│       │   ├── recommendation-card.tsx
│       │   └── neural-dashboard.tsx
│       ├── memory/                         # Memory & Learning UI
│       │   ├── memory-status.tsx           # Memory status overview
│       │   ├── knowledge-browser.tsx       # Browse semantic memory
│       │   ├── rules-table.tsx             # View/edit procedural rules
│       │   ├── learning-progress.tsx       # Learning progress bar
│       │   ├── insight-feed.tsx            # Stream of AI insights
│       │   ├── distillation-log.tsx        # Distillation history
│       │   └── timeline.tsx               # Memory timeline visualization
│       ├── skills/                         # Skill Management UI
│       │   ├── skill-browser.tsx           # Browse all skills
│       │   ├── skill-card.tsx              # Skill preview card
│       │   ├── skill-forge.tsx             # Skill creation form
│       │   ├── skill-detail.tsx            # Skill detail + edit
│       │   ├── skill-group-manager.tsx     # Group CRUD + rotation config
│       │   ├── skill-rotation-status.tsx   # Live rotation indicator
│       │   ├── skill-performance-table.tsx # Quality/usage stats per skill
│       │   ├── skill-import-modal.tsx      # Import from OpenClaw/URL/file
│       │   ├── skill-test-panel.tsx        # Test skill with sample request
│       │   └── skill-timeline.tsx          # Rotation history visualization
│       ├── playground/
│       │   ├── multi-compare.tsx        # Side-by-side comparison
│       │   ├── chat-panel.tsx
│       │   ├── token-analyzer.tsx
│       │   ├── pipeline-preview.tsx
│       │   └── model-selector.tsx
│       ├── vault/
│       │   ├── key-manager.tsx
│       │   ├── oauth-sessions.tsx
│       │   └── access-log.tsx
│       └── shared/
│           ├── health-badge.tsx
│           ├── quota-bar.tsx
│           ├── cost-badge.tsx
│           ├── quality-score.tsx
│           ├── latency-sparkline.tsx
│           └── loading-skeleton.tsx
│
├── models/                               # ML Models
│   ├── neural-router/                    # ONNX neural router
│   │   ├── model.onnx
│   │   ├── tokenizer.json
│   │   └── labels.json
│   └── embeddings/                       # Embedding models
│       ├── minilm-l6-v2/
│       │   ├── model.onnx
│       │   └── tokenizer.json
│       └── tfidf/                        # Lightweight fallback
│           └── vocab.json
│
├── drizzle/
│   ├── 0001_initial.sql
│   ├── 0002_vector.sql
│   ├── 0003_benchmark.sql
│   └── meta/
│
├── public/
│   ├── providers/                        # Provider logos
│   └── favicon.svg
│
├── tests/
│   ├── unit/
│   │   ├── neural-router.test.ts
│   │   ├── semantic-cache.test.ts
│   │   ├── squeezer.test.ts
│   │   ├── pipeline.test.ts
│   │   ├── forensics.test.ts
│   │   ├── namespace.test.ts
│   │   ├── mesh.test.ts
│   │   ├── translate.test.ts
│   │   └── prediction.test.ts
│   ├── integration/
│   │   ├── providers.test.ts
│   │   ├── api-v1.test.ts
│   │   ├── mcp.test.ts
│   │   └── full-pipeline.test.ts
│   └── e2e/
│       ├── command-center.spec.ts
│       ├── playground.spec.ts
│       └── provider-setup.spec.ts
│
├── scripts/
│   ├── setup.sh
│   ├── setup.ps1
│   ├── download-models.ts               # Download ML models
│   └── train-router.ts                  # Train neural router
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── drizzle.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── Makefile
├── PRD.md
├── PLAN.md
└── README.md
```

---

## 1. Phase 1 — Foundation (Minggu 1-2)

### 1.1 Project Bootstrap (Hari 1-2)

**Tasks:**
```bash
# Create Next.js project
npx create-next-app@latest adnify \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack

# Core dependencies
npm install better-sqlite3 drizzle-orm zod pino jose bcryptjs
npm install onnxruntime-node                          # ML inference
npm install @tremor/react tremor                      # Dashboard charts

# UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install @radix-ui/react-dropdown-menu @radix-ui/react-tooltip
npm install lucide-react class-variance-authority clsx tailwind-merge

# Dev dependencies
npm install -D drizzle-kit vitest @playwright/test
npm install -D @types/better-sqlite3 @types/bcryptjs
```

**Deliverables:**
- [x] Project initialized with Next.js 15
- [x] All dependencies installed
- [x] Bun support configured
- [x] `npm run dev` works

### 1.2 Database + Vector Support (Hari 3-4)

**Tasks:**
1. Drizzle schema dengan semua tabel + vector columns
2. SQLite dengan WAL mode + vector0 extension
3. Auto-migration on startup
4. Seed data (default settings, namespace aliases)
5. Vector operations (insert, similarity search)

**Key Schema Additions vs v1:**
```sql
-- Semantic Cache with embeddings
CREATE TABLE semantic_cache (
  id TEXT PRIMARY KEY,
  embedding BLOB NOT NULL,           -- 384-dim float32 vector
  prompt_hash TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  similarity_threshold REAL DEFAULT 0.95,
  hits INTEGER DEFAULT 0,
  quality_score REAL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Neural Router training data
CREATE TABLE router_training_data (
  id TEXT PRIMARY KEY,
  features TEXT NOT NULL,            -- JSON feature vector
  selected_provider TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  outcome TEXT NOT NULL,             -- 'success', 'timeout', 'error', 'rate_limited'
  latency_ms INTEGER,
  cost REAL,
  quality_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Model Benchmarks
CREATE TABLE model_benchmarks (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  task_type TEXT NOT NULL,
  latency_ms INTEGER,
  tokens_used INTEGER,
  quality_score REAL,
  cost REAL,
  provider_id TEXT,
  is_shadow BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline configurations
CREATE TABLE pipelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  nodes TEXT NOT NULL,               -- JSON: pipeline node config
  connections TEXT NOT NULL,          -- JSON: node connections
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 Provider Adapter System + Mesh (Hari 5-8)

**Tasks:**
1. Provider adapter interface (enhanced with mesh support)
2. Base adapter with retry, timeout, proxy support
3. Provider registry with mesh awareness
4. Provider mesh — track which providers serve same models
5. Implement 5 initial providers:
   - OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter

**Mesh Network Implementation:**
```typescript
interface ProviderMesh {
  // Given a model, find all providers that serve it
  resolveModel(modelId: string): MeshProvider[]
  
  // Given a model + strategy, pick optimal provider
  selectProvider(modelId: string, strategy: RoutingStrategy): ProviderAccount
  
  // Track provider-model relationships
  updateModelRegistry(): Promise<void>
  
  // Health-aware routing
  getHealthyProviders(modelId: string): MeshProvider[]
  
  // Cost cascade: free → sub → cheap → paid
  getCostOptimalProviders(modelId: string): MeshProvider[]
}
```

### 1.4 Basic Router + Fallback + API (Hari 9-14)

**Tasks:**
1. Request pipeline engine (basic, without ML)
2. Priority-based routing strategy
3. Decision-tree fallback engine
4. Format translation (OpenAI, Claude, Gemini)
5. API endpoints (v1/chat/completions, v1/models, v1/messages)
6. Middleware (auth, CORS, rate-limit, request-id, logging)
7. Basic dashboard shell (layout + sidebar)

**Fallback Decision Tree:**
```
Request arrives
  │
  ├─ Check Semantic Cache → Hit? → Return cached
  │                                  └─ Miss → Continue
  │
  ├─ Check Provider Health → Healthy?
  │   ├─ Yes → Route to primary provider
  │   │         ├─ Success → Return response
  │   │         ├─ 429 → Rotate account → Retry (max 3x)
  │   │         │         └─ Still 429 → Mesh failover
  │   │         ├─ Timeout → Mesh failover
  │   │         └─ Error → Mesh failover
  │   │
  │   └─ No → Mesh failover (skip unhealthy)
  │
  └─ Mesh failover:
      ├─ Find alternative providers for same model
      ├─ Filter by health + quota
      ├─ Sort by cost (free first)
      └─ Try each until success or all exhausted
```

**Deliverables Phase 1:**
- [x] 5 providers working
- [x] Mesh failover working
- [x] OpenAI + Claude compatible API
- [x] Basic dashboard shell
- [x] All middleware active

---

## 2. Phase 2 — Intelligence Engine (Minggu 3-5)

### 2.1 Semantic Cache (Hari 15-18)

**Tasks:**
1. Download + bundle MiniLM-L6-v2 ONNX model (22MB)
2. Implement embedding generator (`src/lib/cache/embedding.ts`)
   - Tokenize input → Run ONNX inference → L2 normalize → 384-dim vector
   - Target: <15ms per embedding on CPU
3. Implement vector storage in SQLite (`src/lib/db/vector.ts`)
   - Store as BLOB (float32 array)
   - Brute-force cosine similarity (acceptable for <10K entries)
   - Optional: sqlite-vec extension for larger caches
4. Implement semantic cache (`src/lib/cache/semantic.ts`)
   - Generate embedding for incoming prompt
   - Search for similar entries (threshold configurable)
   - Return cached response if hit
   - Store new response with embedding on miss
5. Cache eviction policy (`src/lib/cache/eviction.ts`)
   - LRU + TTL + quality-based eviction
   - Prefer keeping high-quality cached responses

**Performance Targets:**
- Embedding generation: <15ms
- Similarity search: <10ms (for 10K entries)
- Cache hit rate: 15-30%

### 2.2 Adaptive Token Squeezer (Hari 19-23)

**Tasks:**
1. Content classifier (`src/lib/squeezer/classifier.ts`)
   - Regex patterns for initial detection
   - AST parser for code detection
   - Confidence scoring

2. Multi-pass compression pipeline (`src/lib/squeezer/pipeline.ts`)
   ```
   Pass 1: Classify content type
   Pass 2: Apply type-specific filter
   Pass 3: Verify quality score
   Pass 4: If quality < threshold, reduce aggressiveness and retry
   ```

3. Implement filters:
   - `git-diff-semantic.ts` — Parse hunks, keep meaningful changes
   - `code-ast.ts` — AST-based compression (remove comments, whitespace, collapse)
   - `context-dedup.ts` — Detect and remove duplicate information
   - `adaptive-general.ts` — Learn optimal compression from feedback

4. Language-aware compressors:
   - JavaScript/TypeScript: Remove type annotations, collapse arrow functions
   - Python: Remove docstrings, collapse comprehensions
   - Go: Remove error handling boilerplate
   - Rust: Remove lifetime annotations
   - Generic: Universal code compression

5. Token budget allocator (`src/lib/squeezer/budget.ts`)
   - Calculate context fill percentage
   - Select compression level accordingly
   - Allocate budget per message type

6. Quality scoring (`src/lib/squeezer/quality.ts`)
   - Verify no syntax errors in compressed code
   - Verify no information loss (checksums)
   - Score from 0.0 to 1.0

### 2.3 Neural Router (Hari 24-28)

**Tasks:**
1. Feature extraction (`src/lib/neural/features.ts`)
   ```typescript
   interface RequestFeatures {
     hourOfDay: number          // 0-23
     dayOfWeek: number          // 0-6
     promptLength: number       // token count
     hasCode: boolean           // code detection
     hasTools: boolean          // tool_use detection
     isStreaming: boolean
     temperature: number
     taskType: string           // code, chat, reason, etc.
     modelFamily: string        // claude, gpt, gemini, etc.
     budgetUsed: number         // % of monthly budget
     providerHealthScores: Map<string, number>
   }
   ```

2. ONNX model (`src/lib/neural/model.ts`)
   - Simple neural network: Input(features) → Dense(64) → ReLU → Dense(32) → Softmax → Output(provider)
   - Exported to ONNX for fast inference
   - Initial model: Rule-based (neural takes over after training)

3. Training pipeline (`src/lib/neural/trainer.ts`)
   - Collect training data from request_logs
   - Train on background thread every 1000 requests or 1 hour
   - Validate accuracy before deploying
   - Rollback if accuracy drops

4. Predictor (`src/lib/neural/predictor.ts`)
   - Fast inference: <5ms
   - Returns: provider, confidence, expected_latency, expected_cost

5. Feedback loop (`src/lib/neural/feedback.ts`)
   - Record actual outcome vs prediction
   - Calculate accuracy metrics
   - Feed back to training data

6. Hybrid mode (`src/lib/neural/strategies/hybrid.ts`)
   - If neural confidence >80% → use neural prediction
   - If confidence 50-80% → blend neural + rule-based
   - If confidence <50% → fall back to rule-based

### 2.4 Predictive Cost Engine (Hari 29-32)

**Tasks:**
1. Usage forecaster (`src/lib/prediction/forecaster.ts`)
   - Track daily token usage trend
   - Predict monthly total based on current trajectory
   - Factor in: day of week patterns, project activity, historical data

2. Budget manager (`src/lib/prediction/budgetter.ts`)
   - Set monthly budget
   - Track spending vs budget
   - Auto-escalation: normal → cost-saving → budget-conserving → strict-free

3. Auto-optimizer (`src/lib/prediction/optimizer.ts`)
   - When budget >60% used → prefer cheap/free providers
   - When budget >80% → cheap only
   - When budget >95% → free only
   - Budget reset → back to normal

4. Provider arbitrage (`src/lib/prediction/arbitrage.ts`)
   - For each request, calculate cost across all available providers
   - Auto-select cheapest available
   - Show savings vs most expensive option

5. ROI analyzer
   - Track response quality vs cost per model
   - Suggest "best value" models
   - "This model costs 5x more but only 20% better quality"

**Deliverables Phase 2:**
- [x] Semantic cache working (15-30% hit rate)
- [x] Token squeezer with adaptive compression (40-65% savings)
- [x] Neural router with training pipeline
- [x] Predictive cost engine with auto-optimization
- [x] Provider arbitrage working
- [x] Persistent Memory Engine (episodic + semantic + procedural)
- [x] Experience Distiller with scheduled compaction
- [x] Zero-amnesia — all memory survives restart

### 2.6 Persistent Memory Engine (Hari 29-32)

**Tasks:**

1. **Episodic Memory** (`src/lib/memory/episodic.ts`)
   - Store every request/response event as an episode
   - Each episode: timestamp, model, provider, task_type, tokens, latency, cost, quality, outcome
   - Rolling 90-day window (raw detail)
   - Write to SQLite immediately (no data loss)
   ```typescript
   interface Episode {
     id: string
     timestamp: Date
     eventType: 'request_success' | 'request_error' | 'fallback' | 'cache_hit' | 'cache_miss' | 'compression' | 'quota_alert'
     model: string
     provider: string
     taskType: string
     inputTokens: number
     outputTokens: number
     tokensSaved: number
     latencyMs: number
     cost: number
     qualityScore: number
     outcome: 'success' | 'timeout' | 'error_429' | 'error_5xx' | 'error_network'
     metadata: Record<string, unknown>
   }
   ```

2. **Semantic Memory** (`src/lib/memory/semantic.ts`)
   - Permanent knowledge base that grows forever
   - Confidence-weighted merge when updating
   - Categories: model_knowledge, provider_knowledge, user_patterns, compression_patterns, cost_patterns
   ```typescript
   interface KnowledgeEntry {
     id: string
     category: string
     subject: string       // e.g., "glm/glm-5.1", "kr/ (Kiro)", "default_user"
     key: string           // e.g., "avg_latency", "best_for", "preferred_models"
     value: unknown        // The knowledge value
     confidence: number    // 0-1, based on sample size
     sampleCount: number   // How many data points
     lastUpdated: Date
     source: 'distilled' | 'manual' | 'auto_detected'
   }
   ```

3. **Procedural Memory** (`src/lib/memory/procedural.ts`)
   - Auto-generated rules from patterns
   - Rules have confidence, can be verified or auto-generated
   - Categories: routing_rules, fallback_rules, compression_rules, cost_rules
   ```typescript
   interface ProceduralRule {
     id: string
     category: string
     condition: string     // e.g., "task_type == 'code' AND hour IN [9,10,11]"
     action: string        // e.g., "prefer glm/glm-5.1"
     confidence: number    // 0-1
     sampleCount: number
     status: 'auto_generated' | 'verified' | 'review' | 'disabled'
     createdAt: Date
     verifiedAt?: Date
   }
   ```

4. **Memory Persistence** (`src/lib/memory/persist.ts`)
   - Save all 3 memory types to `~/.adnify/memory/`
   - Episodic: SQLite `episodes.db` (rolling 90-day)
   - Semantic: SQLite `knowledge.db` (permanent)
   - Procedural: SQLite `rules.db` (permanent)
   - Auto-backup before distillation
   - Crash-safe writes (WAL mode)

5. **Memory Restore** (`src/lib/memory/restore.ts`)
   - On startup, load all 3 memory databases
   - Rebuild in-memory indices from disk
   - Validate integrity (checksums)
   - Resume exactly where left off — zero amnesia
   - Show restoration status in dashboard: "Restored 12,340 episodes, 847 knowledge entries"

6. **Memory Orchestrator** (`src/lib/memory/index.ts`)
   - Unified API for all memory operations
   - `recordEpisode(event)` — Store new event
   - `queryKnowledge(subject, key)` — Look up knowledge
   - `getRules(category)` — Get applicable rules
   - `getStatus()` — Memory statistics for dashboard

**Database Schema for Memory:**
```sql
-- Episodic Memory (rolling 90-day)
CREATE TABLE episodes (
  id TEXT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  event_type TEXT NOT NULL,
  model TEXT,
  provider TEXT,
  task_type TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  tokens_saved INTEGER DEFAULT 0,
  latency_ms INTEGER,
  cost REAL DEFAULT 0,
  quality_score REAL,
  outcome TEXT,
  metadata TEXT,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_episodes_timestamp ON episodes(timestamp);
CREATE INDEX idx_episodes_model ON episodes(model);
CREATE INDEX idx_episodes_provider ON episodes(provider);

-- Semantic Memory (permanent knowledge)
CREATE TABLE knowledge (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,    -- JSON
  confidence REAL DEFAULT 0,
  sample_count INTEGER DEFAULT 0,
  source TEXT DEFAULT 'distilled',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, subject, key)
);
CREATE INDEX idx_knowledge_lookup ON knowledge(category, subject, key);

-- Procedural Memory (compiled rules)
CREATE TABLE procedural_rules (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  action TEXT NOT NULL,
  confidence REAL DEFAULT 0,
  sample_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'auto_generated',
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  last_applied_at DATETIME,
  apply_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0
);
CREATE INDEX idx_rules_category ON procedural_rules(category, status);

-- Distillation Log
CREATE TABLE distillation_log (
  id TEXT PRIMARY KEY,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  episodes_processed INTEGER,
  patterns_found INTEGER,
  rules_generated INTEGER,
  rules_updated INTEGER,
  model_retrained BOOLEAN DEFAULT FALSE,
  model_accuracy_before REAL,
  model_accuracy_after REAL,
  knowledge_entries_added INTEGER,
  knowledge_entries_updated INTEGER,
  status TEXT DEFAULT 'running',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 Experience Distiller (Hari 33-35)

**Tasks:**

1. **Distiller Orchestrator** (`src/lib/distiller/index.ts`)
   - Background job scheduler
   - Runs every 6 hours or every 1000 new episodes
   - Sequential pipeline: Aggregate → Mine Patterns → Merge Knowledge → Generate Rules → Retrain → Compact
   - Logs every distillation run

2. **Aggregator** (`src/lib/distiller/aggregator.ts`)
   - Query all new episodes since last distillation
   - Group by: provider, model, task_type, hour_of_day, outcome
   - Calculate: avg, p50, p95, success_rate, error_rate, avg_cost, avg_tokens
   - Output: structured aggregation tables

3. **Pattern Miner** (`src/lib/distiller/pattern-miner.ts`)
   - Statistical pattern mining:
     - Correlation: "When provider X fails, provider Y succeeds 94% of the time"
     - Time patterns: "User does 45% more code reviews on Fridays"
     - Quality patterns: "Model X gives 92% quality for code, but only 78% for reasoning"
     - Cost patterns: "GLM is 15x cheaper with only 7% quality loss"
     - Anomaly detection: "Provider X latency increased 3x today"
   - Output: list of (pattern, confidence, sample_count)

4. **Knowledge Merger** (`src/lib/distiller/knowledge-merger.ts`)
   - Take patterns from miner
   - Confidence-weighted merge with existing knowledge:
   ```
   old_value: 0.85, old_samples: 2840, old_confidence: 0.94
   new_value: 0.83, new_samples: 580, new_confidence: 0.88
   weight = 580 / (580 + 2840) = 0.17
   merged_value = 0.85 * 0.83 + 0.83 * 0.17 = 0.847
   merged_samples = 3420
   merged_confidence = 0.93
   ```
   - Never decrease confidence without reason
   - Flag contradictions for review

5. **Rule Generator** (`src/lib/distiller/rule-generator.ts`)
   - Convert high-confidence patterns (>85%) into procedural rules
   - Rule format: IF condition THEN action (confidence: X%, from N samples)
   - Categories: routing, fallback, compression, cost
   - New rules start as 'auto_generated'
   - After 7 days of successful application → promote to 'verified'
   - If rule contradicts existing → keep both, flag for user review

6. **Model Retrainer** (`src/lib/distiller/model-retrainer.ts`)
   - Retrain Neural Router ONNX model with accumulated data
   - Scheduled weekly (or manually triggered)
   - Steps: extract features from episodes → train → validate → deploy if better
   - Keep old model as fallback if new model underperforms

7. **Compactor** (`src/lib/distiller/compactor.ts`)
   - Archive episodic data older than 90 days
   - Before archiving: ensure all patterns have been extracted
   - Keep summarized version in semantic memory
   - VACUUM SQLite to reclaim space
   - Save distillation checkpoint

8. **Anomaly Detector** (`src/lib/distiller/anomaly.ts`)
   - Compare current metrics against historical baselines
   - Alert on: latency spikes, error rate increases, cost anomalies
   - Feed anomalies to dashboard as actionable insights
   - "Provider X latency is 3x higher than usual — consider switching"

9. **Insight Generator** (`src/lib/adaptive/insight-generator.ts`)
   - Convert raw patterns into human-readable insights
   - Examples:
     - "I've learned that DeepSeek V4 gives you the best results for debugging tasks"
     - "Your TypeScript compression is now optimized — 52% average savings"
     - "After 4,500 requests, avg latency improved from 3.8s to 2.1s (45%)"
     - "Budget alert: at current rate, you'll exceed $50 on June 25"
   - Insights displayed in dashboard Memory page and Command Center

---

## 3. Phase 3 — Advanced Platform (Minggu 6-8)

### 3.1 Universal Model Namespace (Hari 33-35)

**Tasks:**
1. Namespace resolver (`src/lib/namespace/resolver.ts`)
   - Parse namespace pattern (best/, fast/, cheap/, free/, auto/, balanced/)
   - Resolve to concrete model + provider
   - Cache resolution results

2. Built-in aliases (`src/lib/namespace/aliases.ts`)
   - best/code → claude-opus or gpt-5.5 (based on benchmark)
   - fast/flash → haiku or flash or minimax
   - free/any → best available free model

3. Task type detection (`src/lib/namespace/tasks.ts`)
   - Auto-detect task type from prompt content
   - Code, chat, reason, review, debug, doc, translate

### 3.2 Model Quality Benchmark (Hari 36-38)

**Tasks:**
1. Shadow mode testing (`src/lib/benchmark/shadow.ts`)
   - Send request to primary model (returned to user)
   - Simultaneously send to shadow model (evaluated silently)
   - Compare responses

2. Quality scorer (`src/lib/benchmark/scorer.ts`)
   - Latency score
   - Token efficiency score
   - Code correctness score (syntax check)
   - User satisfaction proxy (was response retried?)

3. Benchmark dashboard
   - Side-by-side model comparison
   - Quality vs cost chart
   - "Best value" recommendation

### 3.3 Prompt Pre-processor (Hari 39-40)

**Tasks:**
1. System prompt templates (`src/lib/preprocessor/system-prompts.ts`)
   - Optimal prompts per task type
   - A/B test different system prompts

2. Context deduplication (`src/lib/preprocessor/dedup.ts`)
   - Remove repeated information across messages
   - Detect and collapse duplicate tool outputs

3. Instruction clarity (`src/lib/preprocessor/clarity.ts`)
   - Restructure verbose prompts into concise instructions
   - Preserve intent, reduce tokens

### 3.4 Request Pipeline Builder (Hari 41-43)

**Tasks:**
1. Pipeline engine (`src/lib/pipeline/index.ts`)
   - Sequential node execution
   - Conditional branching
   - Error handling per node

2. Built-in pipeline nodes
3. Custom JS node support (sandboxed)
4. Visual pipeline editor component

### 3.5 Conversation Context Manager (Hari 44-45)

**Tasks:**
1. Sliding window with summarization
2. Relevance ranking using embeddings
3. Token budget allocation
4. Auto-trim when approaching context limit

### 3.6 MCP Gateway (Hari 46-48)

**Tasks:**
1. MCP Server implementation
   - Expose tools (provider health, quota, cost, recommendations)
   - Expose resources (model list, benchmarks)
   - Handle MCP protocol messages

2. MCP Client implementation
   - Connect to external MCP servers
   - Proxy tools/resources through Adnify

### 3.7 Smart Request Forensics (Hari 49-50)

**Tasks:**
1. Error analyzer
2. Root cause detector
3. Auto-suggestion generator
4. Pattern-based recommendation engine

### 3.8 Dynamic Skill Rotation Engine (Hari 51-54)

**Tasks:**

1. **Skill Type System** (`src/lib/skills/types.ts`)
   - Define Skill interface (id, name, systemPrompt, behavior, rotation config)
   - Define SkillGroup interface (id, name, skillIds, rotation strategy, state)
   - Define SkillRotationState (activeSkillId, rotationIndex, lastRotatedAt)

2. **Skill Registry** (`src/lib/skills/registry.ts`)
   - CRUD operations for skills (SQLite-backed)
   - CRUD operations for skill groups
   - Skill validation (systemPrompt required, rotation config valid)
   - Search/filter skills by tag, group, task type
   ```typescript
   interface SkillRegistry {
     create(skill: Omit<Skill, 'id'>): Promise<Skill>
     update(id: string, data: Partial<Skill>): Promise<Skill>
     delete(id: string): Promise<void>
     get(id: string): Promise<Skill | null>
     list(filters?: SkillFilters): Promise<Skill[]>
     
     createGroup(group: Omit<SkillGroup, 'id'>): Promise<SkillGroup>
     updateGroup(id: string, data: Partial<SkillGroup>): Promise<SkillGroup>
     deleteGroup(id: string): Promise<void>
     getGroup(id: string): Promise<SkillGroup | null>
     listGroups(): Promise<SkillGroup[]>
     
     addToGroup(skillId: string, groupId: string): Promise<void>
     removeFromGroup(skillId: string, groupId: string): Promise<void>
   }
   ```

3. **Rotation Engine** (`src/lib/skills/rotation/index.ts`)
   - Central rotation orchestrator
   - Given a request → determine which group matches → select skill from group
   - NEVER mix skills — exactly ONE skill per request
   - Cooldown enforcement (don't re-activate same skill too quickly)
   
   ```typescript
   interface RotationEngine {
     // Main entry point: given request context, return active skill (or null)
     resolveSkill(context: RequestContext): Promise<Skill | null>
     
     // Force rotate to next skill in group
     forceRotate(groupId: string): Promise<Skill>
     
     // Get current rotation state for all groups
     getRotationStatus(): Promise<Map<string, RotationState>>
   }
   ```

4. **Rotation Strategies** (5 implementations):
   - `task-match.ts` — Match request task_type to skill's taskTypes
   - `round-robin.ts` — Cycle through skills in order
   - `quality-based.ts` — Always pick highest quality, occasional rotate for freshness
   - `schedule.ts` — Time-based rotation (cron-like)
   - `weighted-random.ts` — Random with quality weights

5. **Skill Executor** (`src/lib/skills/executor.ts`)
   - Apply resolved skill to request BEFORE it reaches provider
   - Inject skill's systemPrompt (replaces default)
   - Apply behavior overrides (temperature, maxTokens, compression, responseFormat)
   - Apply model preferences (influence provider selection)
   - Log which skill was used for quality tracking

6. **Quality Tracker** (`src/lib/skills/quality-tracker.ts`)
   - Track quality score per skill (integration with Distiller)
   - Track: avg_quality, avg_latency, user_acceptance_rate, usage_count
   - Feed into Distiller for periodic quality updates
   - Auto-adjust rotation priorities based on quality

7. **Skill Forge** (`src/lib/skills/forge.ts`)
   - Skill creation wizard logic
   - Validate systemPrompt (not empty, reasonable length)
   - Validate rotation config
   - Auto-detect task types from systemPrompt content
   - Auto-suggest group based on skill content

8. **OpenClaw Importer** (`src/lib/skills/importer/openclaw.ts`)
   - Fetch skill from OpenClaw registry API
   - Convert OpenClaw format → Adnify Skill format
   - Preserve original metadata (author, version, tags)
   - Map OpenClaw categories → Adnify task types
   - Import to specified group
   - Handle import errors gracefully

9. **Built-in Skills** (seed on first install):
   - code-architect, debug-detective, code-reviewer
   - doc-writer, api-designer, test-engineer
   - perf-optimizer, security-scanner, refactor-pro, sql-architect

**Database Schema for Skills:**
```sql
-- Skills
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  author TEXT DEFAULT 'user',
  system_prompt TEXT NOT NULL,
  behavior TEXT DEFAULT '{}',         -- JSON: temperature, maxTokens, etc.
  rotation_config TEXT NOT NULL,      -- JSON: rotation settings
  group_id TEXT,
  tags TEXT DEFAULT '[]',             -- JSON array
  quality_score REAL DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  enabled BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'user',         -- 'system', 'user', 'openclaw', 'community', 'auto_generated'
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_skills_group ON skills(group_id);
CREATE INDEX idx_skills_enabled ON skills(enabled);

-- Skill Groups
CREATE TABLE skill_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  rotation_strategy TEXT DEFAULT 'round_robin',
  task_types TEXT DEFAULT '[]',       -- JSON: which task types trigger this group
  active_skill_id TEXT,
  rotation_index INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  last_rotated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skill Quality Tracking (per task type)
CREATE TABLE skill_quality (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  task_type TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  avg_quality_score REAL DEFAULT 0,
  avg_latency_ms REAL DEFAULT 0,
  user_acceptance_rate REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(skill_id, task_type)
);

-- Skill Rotation Log
CREATE TABLE skill_rotation_log (
  id TEXT PRIMARY KEY,
  from_skill_id TEXT,
  to_skill_id TEXT NOT NULL,
  group_id TEXT,
  trigger_type TEXT NOT NULL,         -- 'task_match', 'round_robin', 'quality', 'schedule', 'manual'
  request_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.9 Skill Forge UI + OpenClaw Import (Hari 55-56)

**Tasks:**
1. Skill browser page — grid of all skills with filters
2. Skill creation form — system prompt editor, behavior config, rotation config
3. Skill detail page — view/edit skill, quality stats, rotation history
4. Skill group manager — create groups, assign skills, set rotation strategy
5. Import modal — OpenClaw URL, local file, community
6. Skill test panel — send test request with skill active, see results

**Deliverables Phase 3:**
- [x] Universal namespace working
- [x] Quality benchmarks operational
- [x] Prompt pre-processor active
- [x] Pipeline builder functional
- [x] Context manager working
- [x] MCP gateway active
- [x] Forensics engine working
- [x] Adaptive Intelligence Layer connects memory to all decisions
- [x] Skill Rotation Engine with 5 rotation strategies
- [x] Skill Forge (create, edit, group skills)
- [x] OpenClaw skill import working
- [x] Skill quality tracking + auto-priority adjustment

---

## 4. Phase 4 — Dashboard & UX (Minggu 9-10)

### 4.1 Command Center (Hari 51-53)

**Components:**
- Real-time stats cards (requests, savings, cost, providers)
- Neural Router status panel (mode, confidence, accuracy, recent decisions)
- Semantic Cache stats (hit rate, entries, tokens saved)
- Live request feed (SSE-based, scrollable)
- AI recommendations (actionable suggestions)
- Cost ticker (running cost counter)
- Memory status widget (learning progress, knowledge count, recent insights)

### 4.1a Memory Dashboard (Hari 53-54)

**Components:**
- Memory status overview (episodic count, semantic entries, procedural rules)
- Learning progress bar (Day 1 → Expert → Mastery)
- Knowledge browser (search/filter semantic memory by category)
- Procedural rules table (status, confidence, apply count, success rate)
- Insight feed (chronological stream of AI-generated insights)
- Distillation log (history of distillation runs with results)
- Memory timeline (visualization of knowledge growth over time)

### 4.1b Skills Dashboard (Hari 54-55)

**Components:**
- Skill browser grid (filter by group, tag, source, quality)
- Active rotation indicator (which skill is active per group, live)
- Skill performance table (usage count, quality score, acceptance rate)
- Rotation history timeline (when skills rotated, which trigger)
- Skill group overview cards (skills count, rotation strategy, active skill)
- Skill comparison (side-by-side quality metrics)

### 4.2 Provider Management (Hari 54-55)

**Components:**
- Provider grid with health indicators
- Mesh topology visualization (which providers cover which models)
- Auto-discovery panel (scan system for existing configs)
- Connect/Disconnect with OAuth flow
- Multi-account management per provider

### 4.3 Model Browser + Benchmark (Hari 56-57)

**Components:**
- Model table with filters (provider, tier, task, capabilities)
- Quality benchmark table with sorting
- Namespace resolver (show which providers serve a model)
- Multi-model compare launcher

### 4.4 Multi-Model Playground (Hari 58-60)

**Components:**
- Chat interface with model selector
- Side-by-side comparison (2-4 models simultaneously)
- Token analyzer (before/after squeezer, before/after pre-processor)
- Pipeline preview (show which nodes processed the request)
- Raw request/response viewer
- Conversation history

### 4.5 Intelligence Dashboard (Hari 61-62)

**Components:**
- Cost prediction chart (projection to end of month)
- Usage heatmap (activity by hour/day)
- Pattern analysis (which models used for which tasks)
- Forensics panel (recent errors with analysis)
- Recommendations feed

### 4.6 Settings + Vault (Hari 63-64)

**Components:**
- General settings (port, hostname, log level)
- Neural Router settings (mode, confidence threshold)
- Cache settings (similarity threshold, TTL)
- Squeezer settings (aggressiveness, language-aware toggle)
- Budget settings (monthly budget, auto-optimization rules)
- Pipeline management
- API key vault
- OAuth session management
- Data export/import

**Deliverables Phase 4:**
- [x] Full dashboard operational
- [x] All pages functional
- [x] Real-time updates via SSE
- [x] Mobile responsive
- [x] Dark/light theme

---

## 5. Phase 5 — Polish & Release (Minggu 11-12)

### 5.1 Additional Providers (Hari 65-68)

**Implement 35+ more providers:**
OAuth: Claude Code, Codex, GitHub, Cursor, Kiro, Antigravity
API Key: Groq, xAI, Mistral, Together, Fireworks, Cerebras, Cohere, GLM, MiniMax, Kimi, SiliconFlow, NVIDIA, Perplexity, Nebius, Chutes, Hyperbolic, Custom
Free: OpenCode Free, Vertex AI
Local: Ollama, LM Studio

### 5.2 Plugin System (Hari 69-70)

**Tasks:**
1. Plugin interface with hooks
2. Plugin loader (from ~/.adnify/plugins/)
3. Sandboxed execution
4. Built-in plugins (PII redactor, sentiment, profanity, response validator)

### 5.3 Testing (Hari 71-74)

**Unit Tests:**
- Neural Router: feature extraction, prediction, training
- Semantic Cache: embedding, similarity, hit/miss
- Token Squeezer: all filters, pipeline, quality scoring
- Pipeline: node execution, conditions, custom nodes
- Format Translation: all 8+ formats, round-trip
- Namespace: resolution, aliases, task detection
- Mesh: topology, failover, cost cascade
- Forensics: error analysis, suggestions
- Prediction: forecasting, budget management

**Integration Tests:**
- Full request pipeline (input → cache → router → provider → response)
- Provider adapters (mock HTTP)
- API endpoints
- MCP gateway

**E2E Tests:**
- Dashboard login + navigation
- Add provider + send request
- Create combo + test
- Playground multi-model compare
- Settings changes persist

### 5.4 Performance Optimization (Hari 75-76)

- Embedding generation: batch processing
- SQLite query optimization
- React component memoization
- Bundle size optimization (code splitting)
- ONNX model optimization (quantization)

### 5.5 Documentation (Hari 77-78)

- README.md — Quick start, features, architecture
- API.md — Full API reference
- PROVIDERS.md — Provider setup guides
- PIPELINE.md — Pipeline builder guide
- MCP.md — MCP gateway documentation
- PLUGIN.md — Plugin development guide
- CONTRIBUTING.md — Contribution guidelines

### 5.6 npm Package + CLI (Hari 79-80)

```bash
# Install globally
npm install -g adnify

# CLI commands
adnify                    # Start server
adnify start              # Start in background
adnify stop               # Stop server
adnify status             # Show status overview
adnify providers          # List connected providers
adnify models             # List available models
adnify discover           # Run auto-discovery
adnify benchmark          # Run model benchmarks
adnify test <provider>    # Test provider connection
adnify config             # Open config file
adnify logs               # Tail server logs
adnify cost               # Show cost report
adnify cache clear        # Clear semantic cache
adnify router train       # Force train neural router
adnify skills             # List all skills
adnify skills create      # Create new skill interactively
adnify skills import <url># Import skill from OpenClaw/URL
adnify skills rotate      # Show rotation status
adnify skills test <id>   # Test a skill with sample request
adnify skills groups      # List skill groups
adnify export             # Export all data
adnify version            # Show version
```

### 5.7 Release (Hari 81-84)

1. Final testing on Windows, macOS, Linux
2. npm publish (adnify package)
3. GitHub release with binaries
4. Landing page / documentation site
5. v2.0.0 release

---

## 6. Quality Gates

| Gate | Criteria |
|------|----------|
| Phase 1 | 5 providers, API working, basic dashboard |
| Phase 2 | Semantic cache >10% hit, Squeezer >40% savings, Neural router >80% accuracy, Memory engine operational |
| Phase 3 | All breakthrough features functional, Skill rotation working, OpenClaw import working |
| Phase 4 | Full dashboard, all pages including Skills, mobile responsive |
| Phase 5 | 40+ providers, tests >80% coverage, npm published |

---

## 7. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| ONNX Runtime compatibility issues | High | Test on all platforms early, provide TF-IDF fallback |
| MiniLM model size too large | Medium | Offer download-on-demand, TF-IDF as lightweight option |
| SQLite vector performance | Medium | Use brute-force for <10K, sqlite-vec for larger |
| Neural Router accuracy too low | Medium | Always fall back to rule-based if confidence <50% |
| Memory usage too high | Medium | Aggressive eviction, lazy loading, streaming processing |
| Bun compatibility issues | Medium | Full Node.js fallback path |

---

## 8. Timeline Summary

| Phase | Durasi | Fokus |
|-------|--------|-------|
| **Phase 1** | Minggu 1-2 | Foundation (DB, Mesh, API, Basic Router) |
| **Phase 2** | Minggu 3-5 | Intelligence (Neural Router, Semantic Cache, Squeezer, Cost Engine) |
| **Phase 3** | Minggu 6-8 | Platform (Namespace, Benchmark, Pipeline, MCP, Forensics) |
| **Phase 4** | Minggu 9-10 | Dashboard (Command Center, Playground, Intelligence UI) |
| **Phase 5** | Minggu 11-12 | Polish (40+ Providers, Plugins, Tests, Docs, Release) |
| **Total** | **12 Minggu** | **Full v2.0 Release** |

---

## 9. Quick Start (Target Experience)

```bash
# 1. Install
npm install -g adnify

# 2. Start (zero config)
adnify

# → Scanning system for existing AI configs...
# → ✅ Found: Claude Code (OAuth)
# → ✅ Found: OpenAI API Key (env var)
# → ✅ Found: Ollama (localhost:11434)
# → 3 providers auto-detected! 
# → Checking for existing memory...
# → ✅ Restored: 12,340 episodes, 847 knowledge entries, 134 rules
# → 🧠 Intelligence level: Expert (82%) — resuming from where you left off
# → Dashboard: http://localhost:3333

# 3. Open dashboard → Review auto-detected providers → Confirm

# 4. Use with any AI tool:
#    Claude Code: anthropic_api_base = http://localhost:3333/v1
#    Cursor: Base URL = http://localhost:3333/v1
#    Codex: OPENAI_BASE_URL = http://localhost:3333

# 5. Neural Router learns your patterns automatically
# 6. Semantic Cache starts saving requests
# 7. Token Squeezer compresses tool outputs
# 8. Memory Engine records every experience — NEVER forgets
# 9. Distiller runs every 6h — extracts patterns, generates rules
# 10. System gets smarter every day — no amnesia on restart
# 11. All automatic, zero configuration needed!
```

### Learning Journey (What User Sees Over Time)

```
Day 1:  "Learning basic patterns..."
        → Storing episodes, building initial knowledge
        → Routing: rule-based (safe defaults)
        
Day 7:  "Understanding your preferences..."
        → "I see you prefer Claude for code review"
        → "GLM-5.1 works great for your TypeScript code"
        → Routing: neural (80% confidence) + rule-based fallback
        
Day 30: "Predicting outcomes accurately..."
        → "Routing optimized: avg latency dropped from 3.8s to 2.1s"
        → "Compression tuned for your codebase: 52% savings"
        → "Budget optimization: $127 saved this month"
        → "Skill 'typescript-expert' quality: 94/100 (best in coding group)"
        → Routing: neural (92% confidence, auto-mode)
        
Day 90: "Expert-level optimization active"
        → "Preemptive routing: I switch providers before failures happen"
        → "I've learned 156 unique patterns in your workflow"
        → "Auto-generated 134 rules, 128 verified correct"
        → Routing: neural (95% confidence) + predictive failover
        
Day 365: "Mastery achieved"
        → "I know your workflow better than any static config"
        → "Predicting your next task with 78% accuracy"
        → "Optimizing for quality, cost, and speed simultaneously"
        → "1,247 knowledge entries, 456 verified rules, zero amnesia"
```
