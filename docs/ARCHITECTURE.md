# GPU Cloud Service Platform — Architecture Document

## 1. System Design and Component Interaction

### 1.1 Overview

The platform is a simplified AI PaaS with three main parts: a **Node.js backend** (API + simulated workers), a **React frontend** dashboard, and a **distributed task queue** that routes inference jobs across simulated GPU workers. All state is in-memory for simplicity; production would use Redis and a database.

### 1.2 Components

- **API server (Express)**  
  - Serves REST and OpenAI-compatible endpoints.  
  - Handles API key validation, rate limiting, and request routing.  
  - Management: `/api/keys`, `/api/usage`, `/api/models`, `/api/deployments`.  
  - Inference: `POST /v1/chat/completions` (streaming and non-streaming).

- **Task queue**  
  - In-memory FIFO queue of inference jobs.  
  - Each job carries model, messages, max_tokens, temperature, and a promise resolve/reject.  
  - Producers (HTTP handlers) enqueue jobs; the same process consumes them via `processNextJob()`.

- **Worker pool**  
  - N simulated workers (configurable via `WORKER_COUNT`).  
  - Workers are virtual: “worker-0”, “worker-1”, …  
  - Round-robin assignment for deployment and for dispatching jobs.  
  - Inference is simulated (echo-style response and token counts).  
  - In production, each worker would be a separate process or machine pulling from a shared queue (e.g. Redis/BullMQ) and calling real GPU runtimes (vLLM, TGI).

- **Services**  
  - **API key service**: Create/list/delete keys; validate Bearer token; optional `ADMIN_KEY` for dashboard bootstrap.  
  - **Usage service**: Append-only log of usage (keyId, model, tokens); summary and history queries.  
  - **Model deployment service**: Register “deployments” with a name and worker ID; status moves from “deploying” to “ready” (simulated).

- **Frontend**  
  - SPA (React + Vite).  
  - Login: user pastes API key (or admin key); key is stored in localStorage and validated via `GET /api/keys`.  
  - Dashboard: overview metrics (requests, tokens, workers, queue depth).  
  - API Keys: list, create (with one-time display of secret), delete.  
  - Usage: summary and recent history.  
  - Deployments: list and create (simulated) model deployments.

### 1.3 Request Flow

1. **Inference**  
   Client sends `POST /v1/chat/completions` with `Authorization: Bearer <key>`. Middleware validates the key and applies per-key rate limiting. The handler enqueues a job and (in the same process) runs `processNextJob()`, which dequeues one job, assigns a worker ID, runs simulated inference, and resolves the job promise. The handler then returns a JSON completion or an SSE stream.

2. **Management**  
   All `/api/*` routes require a valid API key (or admin key). Keys and usage are stored in memory; deployments are stored in memory and assigned to the next worker in round-robin order.

---

## 2. Distributed Architecture Approach

### 2.1 Current Design (Single Process)

- One Node process runs the HTTP server and the “workers.”  
- The queue is an in-memory array; “distribution” is simulated by having multiple logical workers (worker-0, worker-1, …) and round-robin assignment.  
- This demonstrates the *architecture* of a distributed system (queue, worker pool, job payload, token usage) without multi-machine deployment.

### 2.2 Intended Production Scaling

- **Queue**: Replace the in-memory queue with Redis (or similar). Use a single queue or one queue per worker pool. Jobs are serialized (model, messages, options) and pushed to the queue.
- **Workers**: Run one worker process per GPU (or per pod). Each worker:  
  - Pulls jobs from the queue (e.g. BLPOP or BullMQ).  
  - Loads/routes to the appropriate model (e.g. vLLM).  
  - Sends back the result (e.g. via a result queue or callback URL).  
- **API server**: Stays stateless; it only enqueues jobs and returns responses (or streams). It can be scaled horizontally behind a load balancer.
- **State**: API keys and usage should move to a database (e.g. PostgreSQL) and a time-series or analytics store. Rate limiting should use Redis for cross-instance limits.

### 2.3 Failure and Resilience

- **Current**: If the process crashes, in-memory state (keys, usage, queue) is lost. No retries.  
- **Production**: Durable queue (Redis) so jobs are not lost on API restart. Workers can ack only after a successful run; failed jobs can be retried or moved to a DLQ. Health checks (`/health`) and metrics (`/metrics`) support orchestration and monitoring.

---

## 3. Trade-offs and Assumptions

### 3.1 Trade-offs

- **In-memory state**: Fast and simple for a demo; not durable or multi-instance.  
- **Simulated inference**: Allows the full path (auth → queue → worker → response/stream) to be exercised without GPU dependencies.  
- **Single-process worker execution**: Easiest to run locally and in Docker; real distribution would use multiple processes/machines and a shared queue.  
- **Admin key**: Optional `ADMIN_KEY` in env simplifies bootstrapping the first API key from the dashboard; in production this would be replaced by proper auth (e.g. OAuth, SSO).

### 3.2 Assumptions

- API keys are only validated for correctness and rate limits; no per-key quotas or billing in this version.  
- “Model deployment” is a label + worker assignment; no actual container or image lifecycle.  
- Usage and metrics are best-effort and not persisted across restarts.  
- The frontend is intended for operators; end users of the API use the OpenAI-compatible endpoint only.

---

## 4. Scalability Considerations

- **API layer**: Stateless; can run multiple replicas behind a load balancer. Only requirement is shared storage for keys and rate-limit state (e.g. Redis).  
- **Queue**: Redis (or equivalent) allows many producers and many workers; partition or shard by model if needed.  
- **Workers**: Scale with GPU count; each worker can serve one or a few models.  
- **Usage/telemetry**: Should be written asynchronously (e.g. to a queue or log pipeline) so that inference latency is not impacted.  
- **Streaming**: Keeps connections open; ensure timeouts and connection limits are configured appropriately in production.

---

## 5. Areas for Future Improvement

- **Persistence**: Database for API keys and metadata; Redis or DB for rate limits; time-series or analytics store for usage.  
- **Real inference**: Integrate vLLM, TGI, or similar; worker processes that pull from the queue and call these runtimes.  
- **Multi-node workers**: Deploy worker processes on multiple machines; document network and security (TLS, auth) and queue connectivity.  
- **Retries and DLQ**: Retry failed jobs with backoff; dead-letter queue for repeated failures.  
- **Quotas and billing**: Per-key limits, usage-based billing, and dashboards.  
- **Auth**: Replace admin key with proper login (e.g. OAuth, JWT) and role-based access for the dashboard.  
- **Testing**: Integration tests against a real queue and more failure-path tests (timeouts, invalid keys, rate limits).  
- **Observability**: Structured logging, tracing (e.g. OpenTelemetry), and alerts on queue depth and error rate.

---

*This document describes the architecture of the GPU Cloud Service Platform as implemented for the assessment. Export to PDF if a 2–3 page PDF submission is required.*
