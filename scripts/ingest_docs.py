"""Utility script to ingest documentation into Pinecone."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from orchestrator_py.tools.pinecone_store import PineconeStore, VectorRecord


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest markdown docs into Pinecone")
    parser.add_argument('--api-key', required=True)
    parser.add_argument('--environment', required=True)
    parser.add_argument('--index', default='megamind-ultra')
    parser.add_argument('--input', type=Path, required=True, help='Path to JSONL embeddings file')
    args = parser.parse_args()

    store = PineconeStore(args.api_key, args.environment, args.index)

    with args.input.open() as handle:
      for line in handle:
        payload = json.loads(line)
        record = VectorRecord(id=payload['id'], values=payload['values'], metadata=payload.get('metadata', {}))
        print(f"Upserting {record.id}")
        import asyncio
        asyncio.run(store.upsert(record))


if __name__ == '__main__':
    main()
