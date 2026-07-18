import Fuse from "fuse.js";
import type {
  CompiledRelease,
  SearchRecord,
  SymptomClassifierResult,
} from "@ariad/contracts";

export interface SearchResult {
  record: SearchRecord;
  score: number;
  matchType: "exact_name" | "exact_alias" | "prefix" | "token" | "fuzzy";
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-CA")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function rankRecord(record: SearchRecord, query: string): SearchResult | null {
  if (record.normalized_name === query) return { record, score: 1, matchType: "exact_name" };
  if (record.normalized_aliases.includes(query)) return { record, score: 0.98, matchType: "exact_alias" };
  if (
    record.normalized_name.startsWith(query) ||
    record.normalized_aliases.some((alias) => alias.startsWith(query))
  ) {
    return { record, score: 0.9, matchType: "prefix" };
  }
  if (
    record.normalized_name.includes(query) ||
    record.normalized_aliases.some((alias) => alias.includes(query))
  ) {
    return { record, score: 0.82, matchType: "token" };
  }
  return null;
}

export function searchRecords(records: SearchRecord[], input: string, limit = 8): SearchResult[] {
  const query = normalizeSearchText(input);
  if (!query) return [];

  const direct = records.map((record) => rankRecord(record, query)).filter(Boolean) as SearchResult[];
  const directIds = new Set(direct.map((result) => result.record.id));
  const fuzzy =
    query.length < 4
      ? []
      : new Fuse(records, {
          keys: ["normalized_name", "normalized_aliases"],
          threshold: 0.34,
          ignoreLocation: true,
          includeScore: true,
        })
          .search(query)
          .filter((result) => !directIds.has(result.item.id))
          .map<SearchResult>((result) => ({
            record: result.item,
            score: Math.max(0.4, 0.75 - (result.score ?? 1) * 0.5),
            matchType: "fuzzy",
          }));

  return [...direct, ...fuzzy]
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.record.display_name.localeCompare(right.record.display_name) ||
        left.record.id.localeCompare(right.record.id),
    )
    .slice(0, limit);
}

export function searchTreatments(release: CompiledRelease, query: string, limit = 8): SearchResult[] {
  return searchRecords(release.indexes.treatments, query, limit);
}

export function searchSymptoms(release: CompiledRelease, query: string, limit = 8): SearchResult[] {
  return searchRecords(release.indexes.symptoms, query, limit);
}

export function classifySymptomDeterministically(
  release: CompiledRelease,
  input: string,
): SymptomClassifierResult {
  const normalizedInput = normalizeSearchText(input);
  const embedded = release.indexes.symptoms
    .map((record) => {
      const matchingTerms = [record.normalized_name, ...record.normalized_aliases]
        .filter((term) => term.length >= 3 && normalizedInput.includes(term))
        .sort((left, right) => right.length - left.length);
      if (matchingTerms.length === 0) return null;
      return { record, term: matchingTerms[0] ?? "", score: 0.96 };
    })
    .filter(Boolean) as Array<{ record: SearchRecord; term: string; score: number }>;
  const results = embedded.length > 0 ? embedded : searchSymptoms(release, input, 3).map((result) => ({
    record: result.record,
    term: result.matchType === "exact_name" ? result.record.display_name : input.trim().slice(0, 100),
    score: result.score,
  }));
  const candidates = results.slice(0, 3).map((result) => ({
    symptomId: result.record.id,
    confidence: Math.min(1, result.score),
    supportingPhrases: [result.term],
  }));

  if (candidates.length === 0) {
    return {
      candidates: [],
      needsClarification: true,
      clarificationQuestion: "Choose a symptom from the catalogue, or add a few observable details.",
      outOfScope: false,
      reasonCode: "insufficient_information",
    };
  }

  return {
    candidates,
    needsClarification: candidates.length > 1 || (candidates[0]?.confidence ?? 0) < 0.88,
    clarificationQuestion:
      candidates.length > 1 ? "Which of these is closest to what you are noticing?" : undefined,
    outOfScope: false,
    reasonCode: candidates.length > 1 ? "ambiguous" : "matched",
  };
}

