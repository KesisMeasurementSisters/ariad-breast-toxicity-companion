import { z } from "zod";

const STORAGE_KEY = "ariad:preferences";
const CURRENT_SCHEMA_VERSION = 1 as const;

const LegacyPreferencesV0Schema = z
  .object({
    schemaVersion: z.literal(0),
    savedTreatmentIds: z.array(z.string()).max(12),
  })
  .strict();

const PreferencesSchema = z
  .object({
    schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
    savedTreatmentIds: z.array(z.string()).max(12),
    noticeAcknowledged: z.boolean(),
  })
  .strict();

export type Preferences = z.infer<typeof PreferencesSchema>;

export const EMPTY_PREFERENCES: Preferences = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  savedTreatmentIds: [],
  noticeAcknowledged: false,
};

export function migratePreferences(value: unknown): Preferences | null {
  const current = PreferencesSchema.safeParse(value);
  if (current.success) return current.data;

  const legacy = LegacyPreferencesV0Schema.safeParse(value);
  if (legacy.success) {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedTreatmentIds: legacy.data.savedTreatmentIds,
      noticeAcknowledged: false,
    };
  }

  return null;
}

export function readPreferences(): Preferences {
  if (typeof window === "undefined") return EMPTY_PREFERENCES;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const migrated = migratePreferences(parsed);
    if (!migrated) return EMPTY_PREFERENCES;
    if ((parsed as { schemaVersion?: unknown }).schemaVersion !== CURRENT_SCHEMA_VERSION) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return EMPTY_PREFERENCES;
  }
}

export function writePreferences(preferences: Preferences): Preferences {
  const valid = PreferencesSchema.parse(preferences);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  return valid;
}

export function saveTreatment(preferences: Preferences, treatmentId: string): Preferences {
  return writePreferences({
    ...preferences,
    savedTreatmentIds: [
      treatmentId,
      ...preferences.savedTreatmentIds.filter((id) => id !== treatmentId),
    ].slice(0, 12),
  });
}

export function clearAriadData(): Preferences {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  return EMPTY_PREFERENCES;
}
