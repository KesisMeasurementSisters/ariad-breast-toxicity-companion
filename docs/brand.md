# Brand and voice

## Brand hierarchy

- Company: **Kesis & Sisters**
- Company line: **Turning complexity into clarity.**
- Product: **Ariad: Breast**
- Descriptor: **A breast cancer treatment side-effect companion**
- Product line: **A trusted thread through treatment**

In the patient experience, lead with Ariad: Breast and the product descriptor.
Keep Kesis & Sisters visible as the parent brand in the header and footer, with
the product name carrying the primary hierarchy. Do not repeatedly use the
company line inside symptom guidance.

The web implementation inherits the portable Kesis brand snapshot dated
2026-07-20. Use `apps/web/src/app/kesis-tokens.css` and the packaged logo asset
in `apps/web/public/kesis-mark.svg` rather than reconstructing or sampling the
brand system.

## Product metaphor

Nyx is the future governed knowledge-production system. Chloe supports
knowledge creation, Kesis measurement/context/assembly, and Atro governance and
publication. Ariad is not an agent or another Sister; it is the downstream
guide carrying a trusted thread to patients.

Keep that mythology subtle. A restrained line/thread motif can communicate
continuity and provenance. The patient interface must not feel mythological,
dark, fatalistic, or esoteric.

## Experience principles

1. **Calm, not falsely reassuring.** Make warning information easy to find
   without using alarm as the default visual tone.
2. **Clear boundaries build trust.** Coverage, draft status, source state, and
   what Ariad cannot do remain visible.
3. **Questions use observable language.** Ask what the person noticed, never
   for a clinical interpretation.
4. **Evidence stays close.** Source and review status should be expandable from
   the relevant page, not hidden in legal copy.
5. **One useful next step per screen.** Avoid dashboard density and chatbot
   chrome.
6. **Accessibility is part of calm.** Legible type, strong contrast, visible
   focus, large touch targets, semantic controls, reduced motion, and
   print-friendly summaries.

## Visual direction

Use navy ink on a warm cream ground, Outfit headings, Inter body copy, generous
spacing, hairline borders, and a clear non-colour warning hierarchy. Rose may
add restrained warmth and distinguish urgent information. Sage may support
positive or low-intensity information. The thread motif should appear as a fine
continuous line or connector, not as a substitute logo or decorative
complexity.

Avoid:

- pink-ribbon clichés;
- generic “AI” gradients or model-centric branding;
- hospital-dashboard density;
- excessive card grids;
- tiny source links or walls of patient text;
- warning meaning conveyed only by red/colour;
- chat bubbles as the primary interaction model.

## Voice

Voice is direct, humane, specific, and cautious. It explains what information
is being shown and why, without claiming authority the product does not have.

Preferred:

- “can occur with”;
- “may be associated with”;
- “other conditions can cause similar symptoms”;
- “Ariad cannot determine the cause”;
- “follow the instructions provided by your cancer team”;
- “which category is closest?”;
- “only the facts you entered are used.”

Avoid:

- “this is caused by your treatment”;
- “you have grade…”;
- “this is normal”;
- “you should go now”;
- “stop/hold/reduce your treatment”;
- “we recommend”;
- personalized reassurance or risk estimates.

## Content hierarchy

Patient guidance uses these stable headings:

1. About this symptom.
2. Why it matters with this treatment.
3. What you can generally do at home.
4. Contact your cancer team if…
5. Seek urgent medical attention if…
6. What information to have ready.
7. Your symptom summary.
8. Sources and review status.

The fixed emergency statement is visually persistent and programmatically
independent of answers or model output.

## Prototype labeling

Use the exact compiled-release notice:

> Unreviewed prototype content — not for clinical use

Add “Synthetic demo data only” where the demo context benefits from it. Never
use design polish to imply clinical approval; source panels must say that no
clinician reviewer or approval date is recorded.
