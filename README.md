<<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NCERT Buddy: RAG-Based Educational Chatbot

NCERT Buddy is a conversational agent designed to answer student queries based strictly on the Indian NCERT curriculum (Classes 6-12). 

To ensure factual accuracy and mitigate model hallucination, this project utilizes a Retrieval-Augmented Generation (RAG) architecture. Rather than relying on a base model's generalized weights, the system retrieves relevant textbook passages and constrains the LLM to synthesize answers exclusively from the vetted educational context.

## Architecture & Tech Stack

* **Runtime Environment:** Node.js[span_0](start_span)[span_0](end_span)
* **LLM Engine:** Gemini API[span_1](start_span)[span_1](end_span)
* **System Pipeline:** Document Ingestion $\rightarrow$ Text Chunking $\rightarrow$ Context Retrieval $\rightarrow$ Prompt Injection

## Core Features

* **Deterministic Grounding:** Restricts LLM responses entirely to the ingested NCERT source material, preventing the generation of out-of-scope or fabricated information.
* **Curriculum Alignment:** Contextually scoped to the exact syllabi of Classes 6 through 12.
* **Local Execution:** Configured for lightweight local deployment and testing.

## Local Setup

**Prerequisites:** Node.js[span_2](start_span)[span_2](end_span)

**1. Install dependencies:**
```bash
npm install
