
# ANY LLM RESEARCH SYSTEM

Overview
--------
The goal of this is to prototype a reasoning-loop
architecture capable of exploring complex questions end-to-end without
manual orchestration independent of LLM or LLM provider.

## FEATURES

✓ **Loop Reasoning with Action Selection**
✓ **Gap-Question Traversal** (FIFO queue of sub-questions)
✓ **Query Rewriting** before search execution
---

## DATA FLOW

User → Front-End (React + OpenRouter login)
↓
Node Backend
↓
LLM (tool-calling)
↓
[Action JSON]
↓
Tool execution:

* web_search(query)  → snippets
  ↓
  Results appended to memory (<knowledge> / <context>)
  ↓
  Next loop iteration
  ↓
  Final evaluated answer returned to front-end

## EVALUATION PIPELINE

After each proposed answer:

1. Determine evaluation criteria based on question type.
2. For each criterion, run a separate LLM evaluation call.
3. Aggregate results → decide pass/fail.

---

## TECH STACK

* **Frontend:** React + OpenRouter login flow
* **Backend:** Node.js

---

## CONFIGURATION

## Environment Variables

```
OPENROUTER_API_KEY=<your key>
```
