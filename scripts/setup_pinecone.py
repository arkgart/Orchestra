"""Create Pinecone index for MEGAMIND ULTRA."""

from __future__ import annotations

import os

from pinecone import Pinecone, ServerlessSpec


def main() -> None:
    api_key = os.environ.get("PINECONE_API_KEY")
    if not api_key:
        raise SystemExit("PINECONE_API_KEY not configured")
    environment = os.environ.get("PINECONE_ENVIRONMENT", "us-east-1")
    index_name = os.environ.get("PINECONE_INDEX", "megamind-ultra")

    client = Pinecone(api_key=api_key)
    if index_name in [index.name for index in client.list_indexes()]:
        print(f"Index {index_name} already exists")
        return
    client.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=environment),
    )
    print(f"Created index {index_name}")


if __name__ == "__main__":
    main()
