#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mega_patent_generator.py

Massive patent generator for:
 - PRNU-based authentication/provenance/liveness
 - Hardware + cryptographic attestations (TPM/TEE/SE)
 - Identity authentication & credential issuance (incl. IAL3 bootable-USB paths and IL2 low-friction variants)

Pipeline:
 1) Web-grounded RAG build (arXiv, USPTO PatentsView, generic URLs)
 2) Divergent idea search (very high temperature, prompt variants, evolutionary mutations)
 3) Novelty scoring vs RAG + de-duplication (FAISS cosine distance)
 4) Convergent legal rewrite (low temp, JSON-schema structured outputs)
 5) Validators (antecedent basis map presence, claim-tree sanity, cross-refs)
 6) Assembly to Markdown (docx/pdf via pandoc optional)

Requirements:
  pip install openai faiss-cpu trafilatura readability-lxml python-dotenv requests
Environment:
  export OPENAI_API_KEY=...
"""

from __future__ import annotations

import hashlib
import itertools
import json
import logging
import os
import random
import re
import textwrap
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import faiss
import numpy as np
import requests

try:
    import trafilatura

    HAS_TRA = True
except Exception:
    HAS_TRA = False

try:
    from readability import Document as ReadabilityDocument

    HAS_READABILITY = True
except Exception:
    HAS_READABILITY = False

try:
    from openai import OpenAI
except Exception as exc:  # pragma: no cover - import guard
    raise RuntimeError("Install openai: pip install openai") from exc


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

PROJECT = "prnu_hardware_attest_ial3_universal_coverage"
OUT = Path("build") / PROJECT
OUT.mkdir(parents=True, exist_ok=True)
TICKETS_DIR = OUT / "tickets"
TICKETS_DIR.mkdir(exist_ok=True)
CACHE_DIR = OUT / "cache"
CACHE_DIR.mkdir(exist_ok=True)
RAG_DIR = OUT / "rag"
RAG_DIR.mkdir(exist_ok=True)

LLM_MODEL_DIVERGENT = "gpt-5.1"
LLM_MODEL_CONVERGENT = "gpt-5.1"
EMBED_MODEL = "text-embedding-3-large"

DIVERGENT_TEMPS = [1.1, 1.3, 1.6]
DIVERGENT_TOPP = [0.95, 0.98]
DIVERGENT_N_PER = 3
DIVERGENT_IDEAS_PER_RESP = 8
CONVERGENT_TEMP = 0.1
CONVERGENT_TOPP = 0.9

MAX_NEAR_DUPLICATES = 0.92
KEEP_TOP_IDEAS = 80

USE_ARXIV = True
USE_PATENTSVIEW = True
USE_GENERIC_URLS = True

GENERIC_URL_SEEDS = [
    "https://www.researchgate.net/",
    "https://signal.org/docs/",
    "https://trustedcomputinggroup.org/",
]

BRIEF = """Invent PRNU-based and hardware/crypto-attested methods for:
- identity verification (IL2 low-friction fallback and IAL3-compliant strong paths incl. bootable USB),
- video authenticity/provenance & liveness,
- consent-bound credential issuance and revocation,
- adversary models (circumvention) and mitigations.
For EACH idea: provide title, 1–2 sentence thesis, a concrete mechanism (stepwise and specific),
a validation plan (how to test), and possible circumvention risks."""

PROMPT_VARIANTS = [
    "You are a contrarian inventor. Propose non-obvious PRNU variants fusing temporal/spectral/ISP-pipeline cues; surprise me.",
    "You are a cryptographer. Bind PRNU to TPM/TEE/SE attestations, per-frame nonces, commitments, and verifiable logs (optional blockchain).",
    "You are a red-team forensics adversary. First design 5 precise PRNU circumventions; invert each into a stronger defense with measurable detection signatures.",
    "You are a systems integrator. Deliver deployable flows that meet IAL3 via bootable USB trust roots, with an IL2 fallback path that reduces friction.",
    "You are an RF/vision hybrid. Combine PRNU with motion compensation, rolling-shutter signatures, compression artefacts, and lens-distortion residuals.",
]


def h16(*parts: object) -> str:
    hasher = hashlib.sha256()
    for piece in parts:
        hasher.update(str(piece).encode())
    return hasher.hexdigest()[:16]


def jdump(path: Path, obj: Any) -> None:
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False))


def jload(path: Path) -> Any:
    return json.loads(path.read_text())


class OpenAIClient:
    def __init__(self) -> None:
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def respond_json(
        self,
        model: str,
        prompt: str,
        schema: dict,
        temperature: float,
        top_p: float,
        max_tokens: int = 6000,
    ) -> Dict[str, Any]:
        response = self.client.responses.create(
            model=model,
            input=prompt,
            response_format={"type": "json_schema", "json_schema": {"name": "schema", "schema": schema}},
            temperature=temperature,
            top_p=top_p,
            max_output_tokens=max_tokens,
        )
        try:
            return response.output_parsed if hasattr(response, "output_parsed") else json.loads(response.output_text)
        except Exception:
            return json.loads(response.output_text)

    def embed(self, texts: List[str]) -> List[List[float]]:
        embedding = self.client.embeddings.create(model=EMBED_MODEL, input=texts)
        data = embedding.data if hasattr(embedding, "data") else embedding["data"]
        return [entry.embedding if hasattr(entry, "embedding") else entry["embedding"] for entry in data]


OAI = OpenAIClient()


def fetch_arxiv(query: str, max_results: int = 20) -> List[Dict[str, str]]:
    if not USE_ARXIV:
        return []
    url = "http://export.arxiv.org/api/query"
    params = {"search_query": query, "start": 0, "max_results": max_results}
    response = requests.get(url, params=params, timeout=25)
    output: List[Dict[str, str]] = []
    if response.status_code == 200:
        entries = response.text.split("<entry>")
        for entry in entries[1:]:
            titles = re.findall(r"<title>(.*?)</title>", entry, re.S)
            summaries = re.findall(r"<summary>(.*?)</summary>", entry, re.S)
            title = (titles[0] if titles else "").strip().replace("\n", " ")
            summary = (summaries[0] if summaries else "").strip().replace("\n", " ")
            if title:
                output.append({"id": f"arxiv:{h16(title)}", "text": f"{title}. {summary}"[:4000]})
    return output


def fetch_patentsview(keyword: str, max_results: int = 50) -> List[Dict[str, str]]:
    if not USE_PATENTSVIEW:
        return []
    url = "https://search.patentsview.org/api/v1/patents/query"
    query = {
        "_or": [
            {"patent_title": {"_text_any": {"search": keyword}}},
            {"patent_abstract": {"_text_any": {"search": keyword}}},
        ]
    }
    fields = ["patent_number", "patent_title", "patent_date", "patent_abstract"]
    payload = {"q": query, "f": fields, "o": {"per_page": max_results}}
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        output = []
        for patent in data.get("patents", []):
            title = (patent.get("patent_title") or "").strip()
            abstract = (patent.get("patent_abstract") or "").strip()
            number = patent.get("patent_number")
            output.append({"id": f"uspto:{number}", "text": f"{title}. {abstract}"[:4000]})
        return output
    except Exception:
        return []


def fetch_url(url: str, timeout: int = 25) -> Optional[str]:
    try:
        response = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        html = response.text
        if HAS_TRA:
            text = trafilatura.extract(html) or ""
            if len(text.strip()) >= 200:
                return text
        if HAS_READABILITY:
            document = ReadabilityDocument(html)
            text = document.summary()
            text = re.sub("<[^>]+>", " ", text)
            return text
        return html[:8000]
    except Exception:
        return None


def build_rag_corpus(seed_queries: List[str]) -> List[Dict[str, str]]:
    logging.info("Building RAG corpus...")
    corpus: List[Dict[str, str]] = []
    for query in seed_queries:
        corpus.extend(fetch_arxiv(query, max_results=20))
    for query in seed_queries:
        corpus.extend(fetch_patentsview(query, max_results=40))
    if USE_GENERIC_URLS:
        for url in GENERIC_URL_SEEDS:
            text = fetch_url(url)
            if text:
                corpus.append({"id": f"url:{h16(url)}", "text": text[:4000]})
    user_rag = Path("local_rag_snippets.json")
    if user_rag.exists():
        try:
            extra = jload(user_rag)
            if isinstance(extra, list):
                corpus.extend(extra)
        except Exception:
            pass
    jdump(RAG_DIR / "corpus.json", corpus)
    logging.info("RAG corpus size: %s", len(corpus))
    return corpus


def build_faiss(corpus_texts: List[str]) -> Tuple[faiss.IndexFlatIP, np.ndarray]:
    logging.info("Embedding RAG corpus...")
    embeddings: List[List[float]] = []
    batch = 32
    for start in range(0, len(corpus_texts), batch):
        chunk = corpus_texts[start : start + batch]
        embeddings.extend(OAI.embed(chunk))
        time.sleep(0.05)
    matrix = np.array(embeddings, dtype="float32")
    faiss.normalize_L2(matrix)
    index = faiss.IndexFlatIP(matrix.shape[1])
    index.add(matrix)
    return index, matrix


def rag_search(index: faiss.IndexFlatIP, matrix: np.ndarray, corpus: List[Dict[str, str]], query: str, k: int = 6) -> List[Dict[str, str]]:
    query_vector = np.array(OAI.embed([query])[0], dtype="float32")
    faiss.normalize_L2(query_vector.reshape(1, -1))
    distances, indices = index.search(query_vector.reshape(1, -1), k)
    return [corpus[idx] for idx in indices[0] if 0 <= idx < len(corpus)]


IDEA_SCHEMA = {
    "type": "object",
    "properties": {
        "ideas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "thesis": {"type": "string"},
                    "mechanism": {"type": "string"},
                    "validation_plan": {"type": "string"},
                    "risk_circumvention": {"type": "string"},
                },
                "required": ["title", "thesis", "mechanism", "validation_plan"],
            },
        }
    },
    "required": ["ideas"],
    "additionalProperties": False,
}


def score_novelty(idea: Dict[str, Any]) -> float:
    text = (idea.get("mechanism", "") + " " + idea.get("validation_plan", "")).lower()
    score = 0.0
    score += 1.2 * sum(
        word in text
        for word in [
            "temporal",
            "spectral",
            "co-registration",
            "nonces",
            "commitment",
            "tpm",
            "tee",
            "secure element",
            "isp",
            "rolling-shutter",
            "motion",
            "kalman",
            "wavelet",
            "phase",
            "liveness",
        ]
    )
    score += 0.6 * (len(text) > 400) + 0.6 * (len(text) > 800)
    score -= 0.8 * sum(
        word in text for word in ["synergy", "cutting edge", "revolutionary", "state of the art"]
    )
    return score


def mutate_idea(idea: Dict[str, Any]) -> Dict[str, Any]:
    mutations = [
        lambda i: {
            **i,
            "mechanism": i["mechanism"]
            + " Bind per-frame PRNU to a device-held nonce signed in a TEE; publish commitments to an append-only log.",
        },
        lambda i: {
            **i,
            "mechanism": i["mechanism"]
            + " Use motion-compensated PRNU accumulation with occlusion masks and compression-artefact calibration.",
        },
        lambda i: {
            **i,
            "risk_circumvention": i.get("risk_circumvention", "")
            + " Adversary performs patch-wise PRNU synthesis; detect via phase-noise residual histograms and ISP-inversion tests.",
        },
    ]
    return random.choice(mutations)(idea)


def divergent_search(
    corpus_idx: faiss.IndexFlatIP,
    corpus_mat: np.ndarray,
    corpus_docs: List[Dict[str, str]],
    seed_queries: List[str],
) -> List[Dict[str, Any]]:
    pool: List[Dict[str, Any]] = []
    for variant, temp, top_p in itertools.product(PROMPT_VARIANTS, DIVERGENT_TEMPS, DIVERGENT_TOPP):
        rag_snippets: List[Dict[str, str]] = []
        for query in random.sample(seed_queries, k=min(3, len(seed_queries))):
            rag_snippets.extend(rag_search(corpus_idx, corpus_mat, corpus_docs, query, k=2))
        rag_text = "\n".join([f"- {snippet['text'][:800]}" for snippet in rag_snippets[:6]])

        prompt = textwrap.dedent(
            f"""
            {variant}

            Brief:
            {BRIEF}

            Evidence snippets (non-binding, for plausibility and inspiration):
            {rag_text}

            Return {DIVERGENT_IDEAS_PER_RESP}–12 distinct, mechanism-specific ideas in JSON (schema enforced).
            """
        ).strip()

        for _ in range(DIVERGENT_N_PER):
            output = OAI.respond_json(
                LLM_MODEL_DIVERGENT,
                prompt,
                IDEA_SCHEMA,
                temperature=temp,
                top_p=top_p,
                max_tokens=6000,
            )
            for idea in output.get("ideas", []):
                idea["_T"] = temp
                idea["_P"] = top_p
                idea["_variant"] = variant[:48]
                pool.append(idea)
            time.sleep(0.1)

    logging.info("Divergent raw ideas: %s", len(pool))
    texts = [idea["title"] + " :: " + idea.get("mechanism", "") for idea in pool]
    embeddings = np.array(OAI.embed(texts), dtype="float32")
    faiss.normalize_L2(embeddings)
    kept: List[Dict[str, Any]] = []
    used: List[int] = []
    for idx in np.argsort([-score_novelty(idea) for idea in pool]).tolist():
        if any(float(np.dot(embeddings[idx], embeddings[j])) > MAX_NEAR_DUPLICATES for j in used):
            continue
        kept.append(pool[idx])
        used.append(idx)
        if len(kept) >= KEEP_TOP_IDEAS:
            break

    mutations = [mutate_idea(idea) for idea in random.sample(kept, k=min(30, len(kept)))]
    final = kept + mutations
    jdump(OUT / "divergent_ideas.json", final)
    logging.info("Divergent ideas kept: %s", len(final))
    return final


CLAIMS_SCHEMA = {
    "type": "object",
    "properties": {
        "ticket_id": {"type": "string"},
        "independent_claims": {"type": "array", "items": {"type": "string"}},
        "dependent_claims": {"type": "array", "items": {"type": "string"}},
        "claim_element_map": {"type": "object"},
    },
    "required": ["independent_claims", "dependent_claims", "claim_element_map"],
    "additionalProperties": False,
}


DTD_SCHEMA = {
    "type": "object",
    "properties": {
        "ticket_id": {"type": "string"},
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "heading": {"type": "string"},
                    "paragraphs": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["heading", "paragraphs"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["sections"],
    "additionalProperties": False,
}


def legalize_idea(idea: Dict[str, Any], idx: int) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    system_prompt = textwrap.dedent(
        """You are drafting US patent claims and §112-supported description.
- Keep explicit antecedent basis.
- Prefer apparatus, method, and system independent claims where feasible.
- Provide a claim_element_map that references paragraph IDs you create in the Detailed Description.
- Tone: formal; avoid marketing.
- Output strictly matches the schema; no extra keys."""
    )
    brief = textwrap.dedent(
        f"""TITLE: {idea['title']}
THESIS: {idea['thesis']}
MECHANISM: {idea['mechanism']}
VALIDATION: {idea['validation_plan']}
RISKS: {idea.get('risk_circumvention', '')}
Include IAL3 strong-path variants (e.g., bootable USB trust root + TEE attest) and IL2 low-friction fallback where applicable."""
    )
    claims = OAI.respond_json(
        LLM_MODEL_CONVERGENT,
        system_prompt + "\n\nDraft claims as JSON per schema.\n" + brief,
        CLAIMS_SCHEMA,
        temperature=CONVERGENT_TEMP,
        top_p=CONVERGENT_TOPP,
        max_tokens=8000,
    )
    jdump(TICKETS_DIR / f"CLM_{idx:04d}.json", claims)
    dtd = OAI.respond_json(
        LLM_MODEL_CONVERGENT,
        system_prompt
        + "\n\nDraft Detailed Description as JSON per schema with explicit paragraph IDs in [P###] markers.\n"
        + brief,
        DTD_SCHEMA,
        temperature=CONVERGENT_TEMP,
        top_p=CONVERGENT_TOPP,
        max_tokens=12000,
    )
    jdump(TICKETS_DIR / f"DTD_{idx:04d}.json", dtd)
    return claims, dtd


def validate_claims_and_map(clm: Dict[str, Any], dtd: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    independent = clm.get("independent_claims", [])
    dependent = clm.get("dependent_claims", [])
    if len(independent) < 3:
        errors.append("Fewer than 3 independent claims (apparatus/method/system)")
    for claim in dependent:
        if not re.search(r"\bclaim\s+\d+\b", claim.lower()):
            errors.append("Dependent claim may lack explicit dependency: " + claim[:100])
    claim_map = clm.get("claim_element_map", {})
    if not claim_map:
        errors.append("claim_element_map missing")
    else:
        dtd_paragraphs = "\n".join([paragraph for section in dtd.get("sections", []) for paragraph in section.get("paragraphs", [])])
        for element, paragraphs in claim_map.items():
            if not isinstance(paragraphs, list) or not paragraphs:
                errors.append(f"Element '{element}' has empty paragraph list")
                continue
            for pid in paragraphs:
                if not re.search(rf"\[{re.escape(pid)}\]", dtd_paragraphs):
                    errors.append(f"Element '{element}' references missing paragraph id {pid}")
    return errors


def assemble_markdown() -> Path:
    markdown: List[str] = []
    markdown.append("# COMPREHENSIVE SPEC: PRNU + HARDWARE/CRYPTO ATTESTATIONS + IAL3/IL2 FLOWS\n")
    claim_files = sorted(TICKETS_DIR.glob("CLM_*.json"))
    dtd_files = sorted(TICKETS_DIR.glob("DTD_*.json"))
    markdown.append("\n# CLAIMS\n")
    claim_counter = 1
    for claim_file in claim_files:
        claims = jload(claim_file)
        for independent in claims.get("independent_claims", []):
            markdown.append(f"{claim_counter}. {independent}\n")
            claim_counter += 1
        for dependent in claims.get("dependent_claims", []):
            markdown.append(f"{claim_counter}. {dependent}\n")
            claim_counter += 1
    markdown.append("\n# DETAILED DESCRIPTION\n")
    paragraph_no = 1
    for dtd_file in dtd_files:
        dtd = jload(dtd_file)
        for section in dtd.get("sections", []):
            markdown.append(f"## {section['heading']}\n")
            for paragraph in section.get("paragraphs", []):
                if not re.search(r"\[P\d+\]", paragraph):
                    paragraph = f"[P{paragraph_no:04d}] " + paragraph
                markdown.append(paragraph + "\n")
                paragraph_no += 1
    output = OUT / "full_spec.md"
    output.write_text("\n".join(markdown))
    logging.info("Wrote %s", output)
    return output


MANIFEST = {
    "meta": {
        "title": "Universal Coverage of PRNU & Hardware/Crypto Attestations for Identity/Provenance/Liveness (with IAL3 and IL2 variants)",
        "jurisdiction": "US",
        "goal": "Exhaustive exploration → defensible claim families → assembled draft spec",
    },
    "seed_queries": [
        "photo-response non-uniformity PRNU fingerprint extraction video",
        "PRNU spoofing attack denoising fabrication countermeasures",
        "video liveness detection physiology PRNU motion rolling shutter",
        "TPM TEE secure element device attestation video camera authenticity",
        "IAL3 identity proofing NIST IAL3 remote bootable USB trusted path",
        "consent-bound credential issuance revocation cryptographic receipts",
    ],
}
jdump(OUT / "manifest.json", MANIFEST)


def main() -> None:
    corpus = build_rag_corpus(MANIFEST["seed_queries"])
    corpus_texts = [doc["text"] for doc in corpus]
    if len(corpus_texts) == 0:
        logging.warning("RAG corpus is empty; continuing without web grounding.")
        corpus_texts = ["placeholder grounding"]
        corpus = [{"id": "placeholder", "text": "placeholder grounding"}]
    index, matrix = build_faiss(corpus_texts)
    ideas = divergent_search(index, matrix, corpus, MANIFEST["seed_queries"])
    max_legalize = min(40, len(ideas))
    all_claims: List[Dict[str, Any]] = []
    all_dtds: List[Dict[str, Any]] = []
    for idx, idea in enumerate(ideas[:max_legalize], start=1):
        logging.info("Legalizing idea %s/%s: %s", idx, max_legalize, idea.get("title", "")[:80])
        claims, dtd = legalize_idea(idea, idx)
        errors = validate_claims_and_map(claims, dtd)
        if errors:
            logging.warning("Validator warnings:\n%s", "\n".join(errors))
        all_claims.append(claims)
        all_dtds.append(dtd)
        time.sleep(0.1)
    jdump(OUT / "claims_packets.json", all_claims)
    jdump(OUT / "dtd_packets.json", all_dtds)
    assemble_markdown()
    logging.info("Done. Convert to DOCX/PDF with: pandoc full_spec.md -o full_spec.docx")


if __name__ == "__main__":
    main()

