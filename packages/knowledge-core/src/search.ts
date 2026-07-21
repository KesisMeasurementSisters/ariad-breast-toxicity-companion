import Fuse from "fuse.js";
import type {
  CompiledRelease,
  Drug,
  Regimen,
  SearchRecord,
  SymptomClassifierResult,
} from "@ariad/contracts";

export type SearchMatchType =
  | "exact_name"
  | "exact_alias"
  | "component"
  | "prefix"
  | "token"
  | "fuzzy";

export interface SearchResult {
  record: SearchRecord;
  score: number;
  matchType: SearchMatchType;
}

const SUPPORT_RANK: Record<SearchRecord["support_status"], number> = {
  full_guidance: 4,
  education_only: 3,
  catalogued: 2,
  unsupported: 1,
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-CA")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/\s+/gu, "");
}

function matchesExact(candidate: string, query: string): boolean {
  return candidate === query || compactSearchText(candidate) === compactSearchText(query);
}

function startsWithQuery(candidate: string, query: string): boolean {
  return candidate.startsWith(query) || compactSearchText(candidate).startsWith(compactSearchText(query));
}

function includesQuery(candidate: string, query: string): boolean {
  return candidate.includes(query) || compactSearchText(candidate).includes(compactSearchText(query));
}

function includesNormalizedPhrase(value: string, phrase: string): boolean {
  return ` ${value} `.includes(` ${phrase} `);
}

function rankRecord(record: SearchRecord, query: string): SearchResult | null {
  if (matchesExact(record.normalized_name, query)) {
    return { record, score: 1, matchType: "exact_name" };
  }
  if (record.normalized_aliases.some((alias) => matchesExact(alias, query))) {
    return { record, score: 0.98, matchType: "exact_alias" };
  }
  if (
    startsWithQuery(record.normalized_name, query) ||
    record.normalized_aliases.some((alias) => startsWithQuery(alias, query))
  ) {
    return { record, score: 0.9, matchType: "prefix" };
  }
  if (
    includesQuery(record.normalized_name, query) ||
    record.normalized_aliases.some((alias) => includesQuery(alias, query))
  ) {
    return { record, score: 0.82, matchType: "token" };
  }
  return null;
}

export function searchRecords(records: SearchRecord[], input: string, limit = 8): SearchResult[] {
  const query = normalizeSearchText(input);
  if (!query) return [];

  const direct = records.map((record) => rankRecord(record, query)).filter(Boolean) as SearchResult[];
  const directIds = new Set(direct.map((result) => `${result.record.kind}:${result.record.id}`));
  const fuzzy =
    compactSearchText(query).length < 4
      ? []
      : new Fuse(records, {
          keys: ["normalized_name", "normalized_aliases"],
          threshold: 0.34,
          ignoreLocation: true,
          includeScore: true,
        })
          .search(query)
          .filter((result) => !directIds.has(`${result.item.kind}:${result.item.id}`))
          .map<SearchResult>((result) => ({
            record: result.item,
            score: Math.max(0.4, 0.75 - (result.score ?? 1) * 0.5),
            matchType: "fuzzy",
          }));

  return [...direct, ...fuzzy]
    .sort(
      (left, right) =>
        right.score - left.score ||
        SUPPORT_RANK[right.record.support_status] - SUPPORT_RANK[left.record.support_status] ||
        left.record.display_name.localeCompare(right.record.display_name) ||
        left.record.id.localeCompare(right.record.id),
    )
    .slice(0, limit);
}

function treatmentById(release: CompiledRelease, id: string): Drug | Regimen | undefined {
  return release.objects.find(
    (object): object is Drug | Regimen =>
      object.id === id && (object.kind === "drug" || object.kind === "regimen"),
  );
}

export function regimenComponentDrugs(release: CompiledRelease, regimenId: string): Drug[] {
  const regimen = treatmentById(release, regimenId);
  if (regimen?.kind !== "regimen") return [];

  const drugsById = new Map(
    release.objects
      .filter((object): object is Drug => object.kind === "drug")
      .map((drug) => [drug.id, drug]),
  );
  return regimen.component_drug_ids
    .map((componentId) => drugsById.get(componentId))
    .filter((drug): drug is Drug => Boolean(drug));
}

function sentenceCaseName(value: string): string {
  return value.length > 0 ? `${value[0]?.toLocaleUpperCase("en-CA")}${value.slice(1)}` : value;
}

export function treatmentSearchDisplayName(release: CompiledRelease, treatmentId: string): string {
  const treatment = treatmentById(release, treatmentId);
  if (!treatment) return treatmentId;

  if (treatment.kind === "drug") {
    const genericName = sentenceCaseName(treatment.generic_name);
    const primaryBrand = treatment.brand_names[0];
    return primaryBrand ? `${genericName} (${primaryBrand})` : genericName;
  }

  const componentNames = regimenComponentDrugs(release, treatment.id).map((drug) =>
    sentenceCaseName(drug.generic_name),
  );
  const expandedName = componentNames.join(" + ");
  const primaryName = treatment.abbreviation ?? treatment.display_name;
  return expandedName ? `${primaryName}: ${expandedName}` : treatment.display_name;
}

function searchableTreatmentRecords(release: CompiledRelease): SearchRecord[] {
  return release.indexes.treatments.flatMap((record) => {
    const treatment = treatmentById(release, record.id);
    if (!treatment || treatment.kind !== record.kind) return [];
    if (treatment.kind === "regimen" && treatment.component_drug_ids.length < 2) return [];

    if (treatment.kind === "drug") return [record];

    const expandedName = regimenComponentDrugs(release, treatment.id)
      .map((drug) => drug.generic_name)
      .join(" ");
    const aliases = [
      ...record.aliases,
      expandedName,
      treatment.abbreviation ? `${treatment.abbreviation} ${expandedName}` : "",
    ].filter(Boolean);
    const uniqueAliases = new Map<string, string>();
    for (const alias of aliases) {
      const normalized = normalizeSearchText(alias);
      if (normalized && !uniqueAliases.has(normalized)) uniqueAliases.set(normalized, alias);
    }
    return [
      {
        ...record,
        normalized_name: normalizeSearchText(treatment.abbreviation ?? treatment.display_name),
        aliases: [...uniqueAliases.values()],
        normalized_aliases: [...uniqueAliases.keys()],
      },
    ];
  });
}

const TREATMENT_MATCH_RANK: Record<SearchMatchType, number> = {
  exact_name: 5,
  exact_alias: 5,
  component: 4,
  prefix: 3,
  token: 2,
  fuzzy: 1,
};

function fuzzyDrugPriority(result: SearchResult): number {
  return result.matchType === "fuzzy" && result.record.kind === "drug" ? 1 : 0;
}

export function searchTreatments(release: CompiledRelease, query: string, limit = 3): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (compactSearchText(normalizedQuery).length < 2) return [];

  const records = searchableTreatmentRecords(release);
  const allRanked = searchRecords(records, normalizedQuery, records.length);
  const hasDirectMatch = allRanked.some((result) => result.matchType !== "fuzzy");
  const ranked = hasDirectMatch
    ? allRanked.filter((result) => result.matchType !== "fuzzy")
    : allRanked;
  const exactDrugIds = new Set(
    ranked
      .filter(
        (result) =>
          result.record.kind === "drug" &&
          (result.matchType === "exact_name" || result.matchType === "exact_alias"),
      )
      .map((result) => result.record.id),
  );
  const combined = new Map(ranked.map((result) => [`${result.record.kind}:${result.record.id}`, result]));

  if (exactDrugIds.size > 0) {
    for (const record of records) {
      if (record.kind !== "regimen") continue;
      const regimen = treatmentById(release, record.id);
      if (
        regimen?.kind !== "regimen" ||
        !regimen.component_drug_ids.some((componentId) => exactDrugIds.has(componentId))
      ) {
        continue;
      }
      const key = `${record.kind}:${record.id}`;
      const componentMatch: SearchResult = { record, score: 0.94, matchType: "component" };
      const existing = combined.get(key);
      if (!existing || TREATMENT_MATCH_RANK[existing.matchType] < TREATMENT_MATCH_RANK.component) {
        combined.set(key, componentMatch);
      }
    }
  }

  const boundedLimit = Math.max(0, Math.min(limit, 3));
  return [...combined.values()]
    .sort(
      (left, right) =>
        TREATMENT_MATCH_RANK[right.matchType] - TREATMENT_MATCH_RANK[left.matchType] ||
        fuzzyDrugPriority(right) - fuzzyDrugPriority(left) ||
        right.score - left.score ||
        treatmentSearchDisplayName(release, left.record.id).localeCompare(
          treatmentSearchDisplayName(release, right.record.id),
        ) ||
        left.record.id.localeCompare(right.record.id),
    )
    .slice(0, boundedLimit);
}

export function searchSymptoms(release: CompiledRelease, query: string, limit = 8): SearchResult[] {
  return searchRecords(release.indexes.symptoms, query, limit);
}

const NON_SYMPTOM_REQUEST_PATTERN =
  /\b(?:ignore (?:all |any )?(?:previous |prior )?instructions?|system prompt|developer message|is (?:it|this) normal|are these normal|what should i do|do i have|tell me (?:if|whether)|(?:is|could) this (?:grade|caused)|can i (?:take|use|stop|hold)|how (?:serious|bad|urgent)|will (?:this|it) go away)\b/iu;

export function looksLikeNonSymptomRequest(input: string): boolean {
  return NON_SYMPTOM_REQUEST_PATTERN.test(input);
}

export function classifySymptomDeterministically(
  release: CompiledRelease,
  input: string,
): SymptomClassifierResult {
  if (looksLikeNonSymptomRequest(input)) {
    return {
      candidates: [],
      needsClarification: true,
      clarificationQuestion:
        "Describe only what you are noticing, or choose a symptom from the controlled catalogue.",
      outOfScope: true,
      reasonCode: "non_symptom_request",
    };
  }
  const normalizedInput = normalizeSearchText(input);
  const embedded = release.indexes.symptoms
    .map((record) => {
      const matchingTerms = [record.normalized_name, ...record.normalized_aliases]
        .filter(
          (term) => term.length >= 3 && includesNormalizedPhrase(normalizedInput, term),
        )
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
