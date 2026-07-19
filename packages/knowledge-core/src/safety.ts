import type { ClinicConfig, EducationalModule } from "@ariad/contracts";

export interface SafetyFinding {
  ruleId: string;
  severity: "error" | "warning";
  objectId: string;
  field: string;
  excerpt: string;
}

const PROHIBITED_PATTERNS: ReadonlyArray<{ id: string; pattern: RegExp }> = [
  { id: "diagnostic-grade", pattern: /\byou have grade\b/iu },
  { id: "diagnostic-conclusion", pattern: /\bthis means you have\b/iu },
  { id: "treatment-stop", pattern: /\bstop taking\b/iu },
  { id: "treatment-hold", pattern: /\bhold your treatment\b/iu },
  { id: "dose-reduction", pattern: /\breduce your dose\b/iu },
  { id: "treatment-delay", pattern: /\bdelay (?:your )?treatment\b/iu },
  { id: "personalized-urgent", pattern: /\byou should go now\b/iu },
  { id: "personalized-need-urgent", pattern: /\byou need urgent care\b/iu },
  { id: "recommendation-framing", pattern: /\bwe recommend\b/iu },
  { id: "causal-certainty", pattern: /\bdefinitely caused by\b/iu },
];

export function normalizeSafetyText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-CA")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function scanPatientTextSafety(
  objectId: string,
  field: string,
  value: string,
): SafetyFinding[] {
  const normalized = normalizeSafetyText(value);
  return PROHIBITED_PATTERNS.flatMap((rule) =>
    rule.pattern.test(normalized)
      ? [
          {
            ruleId: rule.id,
            severity: "error" as const,
            objectId,
            field,
            excerpt: value.slice(0, 180),
          },
        ]
      : [],
  );
}

export function scanModuleSafety(module: EducationalModule): SafetyFinding[] {
  const fields: Array<[string, string]> = [
    ["title", module.title],
    ...module.paragraphs.map((value, index) => [`paragraphs.${index}`, value] as [string, string]),
    ...module.bullets.map((value, index) => [`bullets.${index}`, value] as [string, string]),
  ];
  const findings: SafetyFinding[] = [];

  for (const [field, value] of fields) {
    findings.push(...scanPatientTextSafety(module.id, field, value));

    if (/\b38(?:[.,]\d)?\s*(?:°\s*)?c\b/iu.test(value) && module.status !== "approved") {
      findings.push({
        ruleId: "unapproved-fever-threshold",
        severity: "error",
        objectId: module.id,
        field,
        excerpt: value.slice(0, 180),
      });
    }
  }

  return findings;
}

export function scanClinicConfigSafety(config: ClinicConfig): SafetyFinding[] {
  const fields: Array<[string, string]> = "mode" in config
    ? [
        ["identity.display_name", config.identity.display_name],
        ...config.contact_routes.flatMap((contact) => {
          const contactFields: Array<[string, string]> = [
            [`contact_routes.${contact.id}.label`, contact.label],
            [`contact_routes.${contact.id}.display_value`, contact.display_value],
          ];
          if (contact.availability.state === "display_only") {
            contactFields.push([
              `contact_routes.${contact.id}.availability.label`,
              contact.availability.label,
            ]);
          }
          return contactFields;
        }),
      ]
    : [
        ["clinic_name", config.clinic_name],
        ["daytime_contact", config.daytime_contact],
        ["after_hours_contact", config.after_hours_contact],
        ["emergency_statement", config.emergency_statement],
        ["fever_instruction", config.fever_instruction],
        ["supportive_care_note", config.supportive_care_note],
      ];

  return fields.flatMap(([field, value]) => scanPatientTextSafety(config.id, field, value));
}

export function prohibitedRecommendationLanguage(value: string): boolean {
  const normalized = normalizeSafetyText(value);
  return PROHIBITED_PATTERNS.some((rule) => rule.pattern.test(normalized));
}
