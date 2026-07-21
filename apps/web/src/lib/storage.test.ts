import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMPTY_PREFERENCES,
  clearAriadData,
  readPreferences,
  saveTreatment,
} from "./storage";

const values = new Map<string, string>();
let storageAvailable = true;

beforeEach(() => {
  values.clear();
  storageAvailable = true;
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => {
        if (!storageAvailable) throw new Error("storage unavailable");
        return values.get(key) ?? null;
      },
      setItem: (key: string, value: string) => {
        if (!storageAvailable) throw new Error("storage unavailable");
        values.set(key, value);
      },
      removeItem: (key: string) => {
        if (!storageAvailable) throw new Error("storage unavailable");
        values.delete(key);
      },
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("versioned local treatment preferences", () => {
  it("stores only saved treatment IDs and notice preference", () => {
    const updated = saveTreatment(EMPTY_PREFERENCES, "weekly-paclitaxel");
    expect(updated.savedTreatmentIds).toEqual(["weekly-paclitaxel"]);
    expect(readPreferences()).toEqual(updated);
    expect(JSON.parse([...values.values()][0] ?? "{}")).not.toHaveProperty("symptomAnswers");
  });

  it("fails safely on an unknown schema", () => {
    values.set("ariad:preferences", JSON.stringify({ schemaVersion: 99, symptom: "private" }));
    expect(readPreferences()).toEqual(EMPTY_PREFERENCES);
  });

  it("migrates v0 treatment preferences without introducing symptom data", () => {
    values.set(
      "ariad:preferences",
      JSON.stringify({ schemaVersion: 0, savedTreatmentIds: ["weekly-paclitaxel"] }),
    );

    expect(readPreferences()).toEqual({
      schemaVersion: 1,
      savedTreatmentIds: ["weekly-paclitaxel"],
      noticeAcknowledged: false,
    });
    expect(JSON.parse(values.get("ariad:preferences") ?? "{}")).toEqual({
      schemaVersion: 1,
      savedTreatmentIds: ["weekly-paclitaxel"],
      noticeAcknowledged: false,
    });
  });

  it("clears the device-local data", () => {
    saveTreatment(EMPTY_PREFERENCES, "ac");
    expect(clearAriadData()).toEqual(EMPTY_PREFERENCES);
    expect(readPreferences()).toEqual(EMPTY_PREFERENCES);
  });

  it("keeps the patient flow usable when browser storage is unavailable", () => {
    storageAvailable = false;

    expect(readPreferences()).toEqual(EMPTY_PREFERENCES);
    expect(saveTreatment(EMPTY_PREFERENCES, "ac").savedTreatmentIds).toEqual(["ac"]);
    expect(clearAriadData()).toEqual(EMPTY_PREFERENCES);
  });
});
