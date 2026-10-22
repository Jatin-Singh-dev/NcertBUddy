<<# NCERT Buddy: RAG-Based Educational Chatbot

NCERT Buddy is a conversational agent designed to answer student queries based strictly on the Indian NCERT curriculum (Classes 6-12). 

To ensure factual accuracy and mitigate model hallucination, this project utilizes a Retrieval-Augmented Generation (RAG) architecture. Rather than relying on a base model's generalized weights, the system retrieves relevant textbook passages and constrains the LLM to synthesize answers exclusively from the vetted educational context.

## Architecture & Tech Stack

* **Runtime Environment:** Node.js
* **LLM Engine:** Gemini API
* **System Pipeline:** Document Ingestion $\rightarrow$ Text Chunking $\rightarrow$ Context Retrieval $\rightarrow$ Prompt Injection

## Core Features

* **Deterministic Grounding:** Restricts LLM responses entirely to the ingested NCERT source material, preventing the generation of out-of-scope or fabricated information.
* **Curriculum Alignment:** Contextually scoped to the exact syllabi of Classes 6 through 12.
* **Local Execution:** Configured for lightweight local deployment and testing.

## Local Setup

**Prerequisites:** Node.js

**1. Install dependencies:**
```bash
npm install
Run the app:
npm run dev

