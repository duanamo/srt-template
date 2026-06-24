# Audit: template

**Score:** 68.0 / 100 — _functional_with_weakness_
**Stage:** early_production (confidence: medium)
**Classification:** software_repo | **Declared maturity:** template (basis: README.md:1)

## Executive summary

Repository scores 68.0/100 — _functional_with_weakness_ band. Strongest: #01 Architectural coherence (4/5, weight 15%). Weakest: #09 Technical debt & risk (3/5, weight 5%). Highest-leverage improvement: Add structured logging and a /healthz route, and run lint+test in CI alongside the build.

## Category scores

| # | Category | Score | Weighted | Cap | Confidence |
|---|----------|------:|---------:|:---:|:----------:|
| 01 | Architectural coherence | 4/5 | 12.0 | — | high |
| 02 | Implementation quality | 4/5 | 12.0 | — | high |
| 03 | Operational readiness | 3/5 | 9.0 | — | high |
| 04 | Type safety & contracts | 4/5 | 8.0 | — | high |
| 05 | Test strategy | 3/5 | 6.0 | — | high |
| 06 | Scalability & extensibility | 3/5 | 6.0 | — | medium |
| 07 | Security & failure handling | 3/5 | 6.0 | — | high |
| 08 | Engineering discipline | 3/5 | 6.0 | — | high |
| 09 | Technical debt & risk | 3/5 | 3.0 | — | high |
| | **Total** | | **68.0** | | |

## Top strengths

1. **Store is the single reactive owner of state; components subscribe via $derived rather than duplicating data flow**  
   _architectural_coherence · `src/routes/(app)/dashboard/+page.svelte:20-34`_
2. **Result types (SaveResult, DeleteResult, DeleteCheck) give callers explicit success/failure handling instead of exceptions or nulls**  
   _implementation_quality · `src/lib/data/store.svelte.ts:21-22`_
3. **CI gates type-check and build on every push/PR, so a broken build cannot merge to dev or main**  
   _operational_readiness · `.github/workflows/ci.yml:22-25`_
4. **Clean Draft -> validate -> typed-domain pipeline treats form input as tainted until validated, exactly the contract discipline the rubric rewards**  
   _type_safety_contracts · `src/lib/data/store.svelte.ts:105-120`_
5. **Tests assert real behavior on the business-logic core (referential integrity, create/update/delete invariants), not trivial getters**  
   _test_strategy · `src/lib/data/store.test.ts:72-109`_

## Top risks

1. **CI Build step injects Supabase/ORIGIN env stubs the app never reads, and the deploy workflows ship a frontend-only localStorage app while wiring it as if it had a Supabase backend — the operational story is template-inherited and decoupled from what runs**  
   _operational_readiness · `.github/workflows/ci.yml:27-34`_
2. **No component, route, or end-to-end tests — the entire UI layer (forms, dialogs, tables, dashboard derivations) is untested; only pure logic and the store are covered**  
   _test_strategy · `structural:unit-only-no-component-or-e2e`_
3. **Every read filters the full in-memory array on each access (e.g. userById is a linear find called per table row); fine at seed scale, but there is no indexing or pagination seam for growth**  
   _scalability_extensibility · `src/routes/(app)/reports/+page.svelte:128-130`_
4. **README and CLAUDE.md claim a (app)/+layout.ts auth guard that redirects unauthenticated users to /login, but neither that load function nor a /login route exists — the protected route group renders unconditionally with no auth**  
   _security_failure_handling · `src/routes/(app)/+layout.svelte:1-19`_
5. **Documentation describes a different application than the one that exists: README's Project Structure and Auth Architecture sections reference hooks.server.ts, login/, auth/callback/, and +layout.server.ts that are absent — a reader following the docs is misled**  
   _engineering_discipline · `README.md:121-153`_

## Highest-leverage improvements

| # | Action | Impact | Effort | Category |
|---|--------|:------:|:------:|----------|
| 1 | Add structured logging and a /healthz route, and run lint+test in CI alongside the build | high | medium | operational_readiness |
| 2 | Run vitest in CI on every PR and add a few @testing-library/svelte component tests for the form dialogs | medium | medium | test_strategy |
| 3 | Introduce the documented service/repository seam so the store can move to a paginated backend without touching consumers, and add the o(1) lookup maps the per-row finds want | medium | medium | scalability_extensibility |
| 4 | Either implement the documented auth guard + /login or correct the docs to describe the actual no-auth client-only model, removing the phantom trust boundary | medium | medium | security_failure_handling |
| 5 | Run lint+test in CI and reconcile README/CLAUDE.md with the actual frontend-only build (or add the documented backend) | medium | medium | engineering_discipline |

## Production readiness

Functional but not production-hardened. Required before broad deployment: Add structured logging and a /healthz route, and run lint+test in CI alongside the build.

## Recommended next steps

1. **Add structured logging and a /healthz route, and run lint+test in CI alongside the build**  
   _Operational readiness scores 3/5 at weight 15% (leverage 6.0). Mover: .github/workflows/ci.yml:10._
2. **Run vitest in CI on every PR and add a few @testing-library/svelte component tests for the form dialogs**  
   _Test strategy scores 3/5 at weight 10% (leverage 4.0). Mover: .github/workflows/ci.yml:22._
3. **Introduce the documented service/repository seam so the store can move to a paginated backend without touching consumers, and add the o(1) lookup maps the per-row finds want**  
   _Scalability & extensibility scores 3/5 at weight 10% (leverage 4.0). Mover: src/lib/data/store.svelte.ts:92-102._
4. **Either implement the documented auth guard + /login or correct the docs to describe the actual no-auth client-only model, removing the phantom trust boundary**  
   _Security & failure handling scores 3/5 at weight 10% (leverage 4.0). Mover: CLAUDE.md:159-160._
5. **Run lint+test in CI and reconcile README/CLAUDE.md with the actual frontend-only build (or add the documented backend)**  
   _Engineering discipline scores 3/5 at weight 10% (leverage 4.0). Mover: .github/workflows/ci.yml:22._

---
_Rubric v1.0.0 · assessment_scope: full_repo · 9/9 categories validated · generated by aggregate.py_
