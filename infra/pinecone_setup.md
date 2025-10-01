# Pinecone Setup

1. Create a Pinecone account and provision an index named `megamind-ultra`.
2. Choose a pod type (e.g. `p1.x1`) and dimension `1536` to align with GPT-5 Codex embeddings.
3. Record the environment (e.g. `gcp-starter`) and API key.
4. Populate the following environment variables:
   - `PINECONE_API_KEY`
   - `PINECONE_ENVIRONMENT`
   - `PINECONE_INDEX`
5. (Optional) Preload documentation embeddings using the ingestion script in `scripts/ingest_docs.py`.
