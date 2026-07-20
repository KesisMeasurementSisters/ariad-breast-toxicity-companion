import type { PatientToxicityFrequencyBand } from "@ariad/contracts";

export const ARIAD_PATIENT_FREQUENCY_METHOD_ID =
  "ariad-all-grade-frequency-v1" as const;

export const PATIENT_FREQUENCY_BAND_ORDER = [
  "many_people",
  "some_people",
  "fewer_people",
] as const satisfies readonly PatientToxicityFrequencyBand[];

export const PATIENT_FREQUENCY_BAND_LABELS: Readonly<
  Record<PatientToxicityFrequencyBand, string>
> = {
  many_people: "Seen in many people",
  some_people: "Seen in some people",
  fewer_people: "Seen in fewer people",
};

/**
 * Ariad patient-frequency method v1.
 *
 * The input must be the all-grade percentage from one study population and
 * denominator. Severe-only values, fatal-outcome values, and laboratory
 * thresholds are not eligible for this transformation.
 */
export function patientFrequencyBandFromPercentage(
  allGradePercentage: number,
): PatientToxicityFrequencyBand {
  if (allGradePercentage >= 30) return "many_people";
  if (allGradePercentage >= 10) return "some_people";
  return "fewer_people";
}
