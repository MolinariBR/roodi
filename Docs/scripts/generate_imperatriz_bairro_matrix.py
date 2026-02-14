#!/usr/bin/env python3
"""Gera matriz de distancia/tempo de conducao entre bairros de Imperatriz-MA.

Entrada:
  - bairro.md (lista numerada de bairros)

Saida:
  - Docs/data/imperatriz_bairros_matriz.json

Dependencias:
  - Python 3 (somente stdlib)
  - Internet (Google Geocoding ou Nominatim + OSRM publico)
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Any

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
OSRM_TABLE_URL = "https://router.project-osrm.org/table/v1/driving"
USER_AGENT = "Roodi-BairroMatrix/1.0 (contato: local-script)"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Gera matriz OD de bairros (Imperatriz-MA) em JSON.",
    )
    parser.add_argument(
        "--input",
        default="bairro.md",
        help="Arquivo de entrada com bairros numerados (default: bairro.md).",
    )
    parser.add_argument(
        "--output",
        default="Docs/data/imperatriz_bairros_matriz.json",
        help="Arquivo JSON de saida.",
    )
    parser.add_argument(
        "--cache",
        default="Docs/data/imperatriz_bairros_geocode_cache.json",
        help="Cache JSON de geocoding para acelerar reexecucoes.",
    )
    parser.add_argument(
        "--geocode-delay",
        type=float,
        default=1.0,
        help="Delay em segundos entre chamadas de geocoding (default: 1.0).",
    )
    parser.add_argument(
        "--block-size",
        type=int,
        default=45,
        help="Tamanho do bloco para chamadas da matriz OSRM (default: 45).",
    )
    parser.add_argument(
        "--provider",
        choices=["google", "nominatim"],
        default="google",
        help="Provider de geocoding (default: google).",
    )
    parser.add_argument(
        "--google-api-key",
        default=os.getenv("GOOGLE_MAPS_API_KEY", ""),
        help="API key do Google Geocoding API (ou use env GOOGLE_MAPS_API_KEY).",
    )
    parser.add_argument(
        "--city-query",
        default="Imperatriz, MA, Brasil",
        help="Cidade alvo usada para viés das consultas.",
    )
    parser.add_argument(
        "--ruacep-pages",
        type=int,
        default=7,
        help="Quantidade de paginas de bairros para indexar no RuaCEP (default: 7).",
    )
    return parser.parse_args()


def normalize_text(value: str) -> str:
    text = value.strip()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.replace("ü", "u").replace("Ü", "U")
    return re.sub(r"\s+", " ", text).strip()


def parse_bairros(md_path: Path) -> list[dict[str, Any]]:
    if not md_path.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {md_path}")

    bairros: list[dict[str, Any]] = []
    pattern = re.compile(r"^\s*(\d+)\.\s+(.+?)\s*$")

    for line in md_path.read_text(encoding="utf-8").splitlines():
        match = pattern.match(line)
        if not match:
            continue
        idx = int(match.group(1))
        name = match.group(2).strip()
        bairros.append({"index": idx, "name": name})

    if not bairros:
        raise ValueError("Nenhum bairro numerado encontrado no arquivo de entrada.")

    bairros.sort(key=lambda item: item["index"])
    return bairros


def http_get_json(url: str, params: dict[str, Any], timeout: int = 60) -> Any:
    qs = urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(
        f"{url}?{qs}",
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_get_text(url: str, timeout: int = 60) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def build_queries(name: str) -> list[str]:
    raw = name.strip()
    alt = normalize_text(raw)
    variants = [raw]
    if alt and alt.lower() != raw.lower():
        variants.append(alt)

    queries: list[str] = []
    seen: set[str] = set()
    templates = [
        "{name}, Imperatriz, MA, Brasil",
        "Bairro {name}, Imperatriz, MA, Brasil",
        "{name}, Imperatriz, Maranhao, Brasil",
    ]
    for var in variants:
        for template in templates:
            query = template.format(name=var)
            key = query.lower()
            if key in seen:
                continue
            seen.add(key)
            queries.append(query)
    return queries


def parse_ruacep_index(pages: int) -> dict[str, dict[str, str]]:
    index: dict[str, dict[str, str]] = {}
    pattern = re.compile(
        r'https://www\.ruacep\.com\.br/ma/imperatriz/([^"/]+)/logradouros/"[^>]*><strong>([^<]+)</strong>',
        re.IGNORECASE,
    )

    for page in range(1, pages + 1):
        if page == 1:
            url = "https://www.ruacep.com.br/ma/imperatriz/bairros/"
        else:
            url = f"https://www.ruacep.com.br/ma/imperatriz/bairros/{page}/"

        try:
            html = http_get_text(url, timeout=45)
        except Exception:
            continue

        for slug, bairro_name in pattern.findall(html):
            key = normalize_text(bairro_name).lower()
            if key not in index:
                index[key] = {
                    "slug": slug,
                    "url": f"https://www.ruacep.com.br/ma/imperatriz/{slug}/logradouros/",
                    "bairro_name": bairro_name,
                }
    return index


def parse_ruacep_context(logradouros_url: str) -> dict[str, Any]:
    html = http_get_text(logradouros_url, timeout=45)

    street_pat = re.compile(
        r'card-header[^>]*>\s*<a [^>]*><strong>([^<]+)</strong>',
        re.IGNORECASE,
    )
    cep_pat = re.compile(r"CEP:\s*(\d{5}-\d{3})")

    streets = [normalize_text(s) for s in street_pat.findall(html)]
    ceps = cep_pat.findall(html)

    first_street = streets[0] if streets else None
    first_cep = ceps[0] if ceps else None

    return {
        "first_street": first_street,
        "first_cep": first_cep,
        "street_count": len(streets),
        "cep_count": len(ceps),
    }


def format_street_for_query(raw: str | None) -> str | None:
    if not raw:
        return None
    value = raw.strip()
    if "," in value:
        name, kind = [part.strip() for part in value.split(",", 1)]
        if kind:
            return f"{kind} {name}".strip()
    return value


def build_queries_with_ruacep(
    bairro_name: str,
    city_query: str,
    ruacep_context: dict[str, Any] | None,
) -> list[str]:
    seen: set[str] = set()
    queries: list[str] = []

    def add(query: str | None) -> None:
        if not query:
            return
        q = re.sub(r"\s+", " ", query).strip()
        if not q:
            return
        k = q.lower()
        if k in seen:
            return
        seen.add(k)
        queries.append(q)

    street = format_street_for_query(
        ruacep_context.get("first_street") if ruacep_context else None,
    )
    cep = ruacep_context.get("first_cep") if ruacep_context else None

    add(f"{bairro_name}, {city_query}")
    add(f"Bairro {bairro_name}, {city_query}")

    if street:
        add(f"{street}, {bairro_name}, {city_query}")
        add(f"{street}, {city_query}")
    if cep:
        add(f"{cep}, {bairro_name}, {city_query}")
        add(f"{cep}, {city_query}")

    for base in build_queries(bairro_name):
        add(base)

    return queries


def score_nominatim_result(target_name: str, result: dict[str, Any]) -> int:
    display = normalize_text(result.get("display_name", "")).lower()
    target = normalize_text(target_name).lower()
    address = result.get("address", {}) if isinstance(result.get("address"), dict) else {}

    score = 0
    if "imperatriz" in display:
        score += 50
    if "maranhao" in display or "maranhão" in display:
        score += 20
    if "imperatriz" in str(address.get("city", "")).lower() or "imperatriz" in str(address.get("town", "")).lower():
        score += 20
    if target in display:
        score += 20
    if result.get("type") in {"suburb", "neighbourhood", "quarter", "residential", "hamlet"}:
        score += 10
    if result.get("class") == "place":
        score += 5
    return score


def score_google_result(target_name: str, result: dict[str, Any]) -> int:
    formatted = normalize_text(result.get("formatted_address", "")).lower()
    target = normalize_text(target_name).lower()
    types = result.get("types") if isinstance(result.get("types"), list) else []
    components = result.get("address_components") if isinstance(result.get("address_components"), list) else []

    score = 0
    if "imperatriz" in formatted:
        score += 60
    if "maranhao" in formatted or "maranhão" in formatted:
        score += 15
    if target and target in formatted:
        score += 25
    if any(t in {"neighborhood", "sublocality", "sublocality_level_1"} for t in types):
        score += 10

    for comp in components:
        if not isinstance(comp, dict):
            continue
        comp_name = normalize_text(comp.get("long_name", "")).lower()
        comp_types = comp.get("types") if isinstance(comp.get("types"), list) else []
        if "locality" in comp_types and "imperatriz" in comp_name:
            score += 25
        if "administrative_area_level_1" in comp_types and "maranhao" in comp_name:
            score += 10
        if target and target == comp_name and any(
            t in {"neighborhood", "political", "sublocality", "sublocality_level_1"}
            for t in comp_types
        ):
            score += 30

    geometry = result.get("geometry") if isinstance(result.get("geometry"), dict) else {}
    location_type = geometry.get("location_type")
    if location_type == "ROOFTOP":
        score += 8
    elif location_type == "RANGE_INTERPOLATED":
        score += 5
    elif location_type == "GEOMETRIC_CENTER":
        score += 3

    return score


def google_geocode(query: str, google_api_key: str) -> list[dict[str, Any]]:
    payload = http_get_json(
        GOOGLE_GEOCODE_URL,
        {
            "address": query,
            "key": google_api_key,
            "region": "br",
            "language": "pt-BR",
            "bounds": "-5.66,-47.64|-5.40,-47.30",
            "components": "country:BR|administrative_area:MA|locality:Imperatriz",
        },
        timeout=45,
    )

    status = payload.get("status")
    if status == "OK":
        rows = payload.get("results")
        return rows if isinstance(rows, list) else []
    if status in {"ZERO_RESULTS", "INVALID_REQUEST"}:
        return []

    error_message = payload.get("error_message", status)
    raise RuntimeError(f"Google Geocoding falhou: {error_message}")


def geocode_bairro_google(
    name: str,
    cache: dict[str, Any],
    geocode_delay: float,
    google_api_key: str,
    city_query: str,
    ruacep_index: dict[str, dict[str, str]] | None,
    ruacep_context_cache: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    cache_key = f"google::{name}"
    cached = cache.get(cache_key)
    if isinstance(cached, dict) and cached.get("status") in {"ok", "not_found"}:
        return cached

    ruacep_context: dict[str, Any] | None = None
    normalized_name = normalize_text(name).lower()
    if ruacep_index and normalized_name in ruacep_index:
        ctx_key = ruacep_index[normalized_name]["slug"]
        if ctx_key in ruacep_context_cache:
            ruacep_context = ruacep_context_cache[ctx_key]
        else:
            try:
                ruacep_context = parse_ruacep_context(ruacep_index[normalized_name]["url"])
            except Exception:
                ruacep_context = {}
            ruacep_context_cache[ctx_key] = ruacep_context

    best: dict[str, Any] | None = None
    best_score = -1
    last_error = None
    for query in build_queries_with_ruacep(name, city_query=city_query, ruacep_context=ruacep_context):
        try:
            rows = google_geocode(query, google_api_key)
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            time.sleep(max(geocode_delay, 0))
            continue

        for row in rows:
            if not isinstance(row, dict):
                continue
            geometry = row.get("geometry") if isinstance(row.get("geometry"), dict) else {}
            location = geometry.get("location") if isinstance(geometry.get("location"), dict) else {}
            lat = location.get("lat")
            lon = location.get("lng")
            if lat is None or lon is None:
                continue

            score = score_google_result(name, row)
            if score > best_score:
                best_score = score
                best = {
                    "status": "ok",
                    "lat": float(lat),
                    "lon": float(lon),
                    "query": query,
                    "display_name": row.get("formatted_address", ""),
                    "google_types": row.get("types"),
                    "score": score,
                    "source": "google",
                    "ruacep_context": ruacep_context,
                }
                if score >= 95:
                    break
        time.sleep(max(geocode_delay, 0))
        if best_score >= 95:
            break

    if best is None:
        fail = {
            "status": "not_found",
            "error": last_error or "No result",
            "source": "google",
            "ruacep_context": ruacep_context,
        }
        cache[cache_key] = fail
        return fail

    cache[cache_key] = best
    return best


def geocode_bairro(
    name: str,
    cache: dict[str, Any],
    geocode_delay: float,
    provider: str,
    google_api_key: str,
    city_query: str,
    ruacep_index: dict[str, dict[str, str]] | None,
    ruacep_context_cache: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    if provider == "google":
        return geocode_bairro_google(
            name=name,
            cache=cache,
            geocode_delay=geocode_delay,
            google_api_key=google_api_key,
            city_query=city_query,
            ruacep_index=ruacep_index,
            ruacep_context_cache=ruacep_context_cache,
        )

    cache_key = f"nominatim::{name}"
    cached = cache.get(cache_key)
    if isinstance(cached, dict) and cached.get("status") in {"ok", "not_found"}:
        return cached

    best: dict[str, Any] | None = None
    best_score = -1
    last_error = None

    for query in build_queries(name):
        try:
            rows = http_get_json(
                NOMINATIM_URL,
                {
                    "q": query,
                    "format": "jsonv2",
                    "limit": 5,
                    "addressdetails": 1,
                    "countrycodes": "br",
                },
                timeout=45,
            )
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            time.sleep(max(geocode_delay, 0))
            continue

        if isinstance(rows, list):
            for row in rows:
                if not isinstance(row, dict):
                    continue
                score = score_nominatim_result(name, row)
                if score > best_score:
                    best_score = score
                    best = {
                        "status": "ok",
                        "lat": float(row["lat"]),
                        "lon": float(row["lon"]),
                        "query": query,
                        "display_name": row.get("display_name", ""),
                        "nominatim_type": row.get("type"),
                        "nominatim_class": row.get("class"),
                        "score": score,
                    }
                    # Score bom o suficiente: para cedo para reduzir chamadas.
                    if score >= 80:
                        break

        time.sleep(max(geocode_delay, 0))
        if best_score >= 80:
            break

    if best is None:
        fail = {
            "status": "not_found",
            "error": last_error or "No result",
            "source": "nominatim",
        }
        cache[cache_key] = fail
        return fail

    best["source"] = "nominatim"
    cache[cache_key] = best
    return best


def osrm_table_block(
    src_coords: list[tuple[float, float]],
    dst_coords: list[tuple[float, float]],
) -> tuple[list[list[float | None]], list[list[float | None]]]:
    # coords no formato lon,lat
    all_coords = src_coords + dst_coords
    coord_str = ";".join(f"{lon:.6f},{lat:.6f}" for lat, lon in all_coords)

    src_ix = ";".join(str(i) for i in range(len(src_coords)))
    dst_ix = ";".join(str(i) for i in range(len(src_coords), len(src_coords) + len(dst_coords)))

    payload = http_get_json(
        OSRM_TABLE_URL + f"/{coord_str}",
        {
            "annotations": "distance,duration",
            "sources": src_ix,
            "destinations": dst_ix,
        },
        timeout=90,
    )

    if payload.get("code") != "Ok":
        msg = payload.get("message", "unknown")
        raise RuntimeError(f"OSRM table falhou: {msg}")

    distances = payload.get("distances")
    durations = payload.get("durations")
    if not isinstance(distances, list) or not isinstance(durations, list):
        raise RuntimeError("Resposta OSRM sem distancias/duracoes validas.")

    return distances, durations


def build_matrix(
    bairros: list[dict[str, Any]],
    block_size: int,
) -> tuple[list[list[int | None]], list[list[int | None]], list[int]]:
    n = len(bairros)
    distance_m: list[list[int | None]] = [[None for _ in range(n)] for _ in range(n)]
    duration_s: list[list[int | None]] = [[None for _ in range(n)] for _ in range(n)]

    resolved = [i for i, b in enumerate(bairros) if isinstance(b.get("lat"), float) and isinstance(b.get("lon"), float)]
    for i in resolved:
        distance_m[i][i] = 0
        duration_s[i][i] = 0

    if not resolved:
        return distance_m, duration_s, resolved

    blocks = [resolved[i : i + block_size] for i in range(0, len(resolved), block_size)]
    total_calls = len(blocks) * len(blocks)
    call_no = 0

    for sb in blocks:
        src_coords = [(bairros[i]["lat"], bairros[i]["lon"]) for i in sb]
        for db in blocks:
            call_no += 1
            print(
                f"[OSRM] bloco {call_no}/{total_calls} "
                f"(src={len(sb)} dst={len(db)})",
                flush=True,
            )
            dst_coords = [(bairros[i]["lat"], bairros[i]["lon"]) for i in db]

            retries = 3
            wait_s = 2.0
            while True:
                try:
                    dists, durs = osrm_table_block(src_coords, dst_coords)
                    break
                except Exception as exc:  # noqa: BLE001
                    retries -= 1
                    if retries <= 0:
                        raise RuntimeError(f"Falha definitiva no OSRM: {exc}") from exc
                    print(f"[OSRM] retry em {wait_s:.1f}s: {exc}", flush=True)
                    time.sleep(wait_s)
                    wait_s *= 2

            for r, src_idx in enumerate(sb):
                for c, dst_idx in enumerate(db):
                    d_val = dists[r][c]
                    t_val = durs[r][c]
                    distance_m[src_idx][dst_idx] = None if d_val is None else int(round(float(d_val)))
                    duration_s[src_idx][dst_idx] = None if t_val is None else int(round(float(t_val)))

    return distance_m, duration_s, resolved


def main() -> None:
    args = parse_args()
    in_path = Path(args.input)
    out_path = Path(args.output)
    cache_path = Path(args.cache)

    bairros = parse_bairros(in_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.parent.mkdir(parents=True, exist_ok=True)

    if cache_path.exists():
        cache = json.loads(cache_path.read_text(encoding="utf-8"))
        if not isinstance(cache, dict):
            cache = {}
    else:
        cache = {}

    if args.provider == "google" and not args.google_api_key.strip():
        raise RuntimeError(
            "Provider 'google' exige API key. "
            "Use --google-api-key ou env GOOGLE_MAPS_API_KEY.",
        )

    ruacep_index = parse_ruacep_index(args.ruacep_pages) if args.provider == "google" else None
    ruacep_context_cache: dict[str, dict[str, Any]] = {}

    print(f"[INFO] Bairros lidos: {len(bairros)}", flush=True)
    print(f"[INFO] Provider de geocoding: {args.provider}", flush=True)
    if ruacep_index is not None:
        print(f"[INFO] RuaCEP indexado: {len(ruacep_index)} bairros", flush=True)
    for idx, bairro in enumerate(bairros, start=1):
        name = bairro["name"]
        geo = geocode_bairro(
            name=name,
            cache=cache,
            geocode_delay=args.geocode_delay,
            provider=args.provider,
            google_api_key=args.google_api_key,
            city_query=args.city_query,
            ruacep_index=ruacep_index,
            ruacep_context_cache=ruacep_context_cache,
        )
        bairro["status"] = geo.get("status")
        if geo.get("status") == "ok":
            bairro["lat"] = float(geo["lat"])
            bairro["lon"] = float(geo["lon"])
            bairro["geocode_source"] = geo.get("source", args.provider)
            bairro["geocode_query"] = geo.get("query")
            bairro["geocode_display_name"] = geo.get("display_name")
        else:
            bairro["lat"] = None
            bairro["lon"] = None
            bairro["geocode_source"] = "unresolved"
            bairro["geocode_query"] = None
            bairro["geocode_display_name"] = None
            bairro["geocode_error"] = geo.get("error")

        print(
            f"[GEOCODE] {idx:03d}/{len(bairros)} "
            f"{name}: {bairro['status']}",
            flush=True,
        )

    cache_path.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    distance_m, duration_s, resolved = build_matrix(bairros, block_size=args.block_size)

    unresolved = [b["name"] for b in bairros if b.get("lat") is None or b.get("lon") is None]
    status_counts = Counter(b.get("status", "unknown") for b in bairros)
    non_null_cells = sum(
        1
        for r in range(len(bairros))
        for c in range(len(bairros))
        if distance_m[r][c] is not None and duration_s[r][c] is not None
    )
    total_cells = len(bairros) * len(bairros)

    result = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "city": {"name": "Imperatriz", "state": "MA", "country": "BR"},
        "source": {
            "bairros_file": str(in_path),
            "geocoding": args.provider,
            "routing": "OSRM public table API (driving)",
        },
        "metrics": {
            "total_bairros": len(bairros),
            "geocoded_bairros": int(status_counts.get("ok", 0)),
            "unresolved_bairros": len(unresolved),
            "matrix_cells_total": total_cells,
            "matrix_cells_with_route": non_null_cells,
            "coverage_percent": round((non_null_cells / total_cells) * 100, 2) if total_cells else 0,
            "pairs_directed": len(bairros) * (len(bairros) - 1),
            "pairs_undirected": (len(bairros) * (len(bairros) - 1)) // 2,
            "status_breakdown": dict(status_counts),
        },
        "unresolved_bairros": unresolved,
        "bairros": bairros,
        "matrix": {
            "units": {"distance": "meters", "duration": "seconds"},
            "order": [b["name"] for b in bairros],
            "distance_m": distance_m,
            "duration_s": duration_s,
        },
    }

    out_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"[DONE] JSON salvo em: {out_path}", flush=True)
    print(
        "[DONE] Cobertura: "
        f"{result['metrics']['coverage_percent']}% "
        f"({result['metrics']['matrix_cells_with_route']}/{result['metrics']['matrix_cells_total']})",
        flush=True,
    )


if __name__ == "__main__":
    main()
