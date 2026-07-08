import type { SemanticFragment } from "./types";

export const semanticDictionary: SemanticFragment[] = [
  {
    symbolicKey: "num_life_path_1",
    sourceSystem: "numerology",
    sourceObject: "Life Path 1",
    axis: "pacing_momentum",
    themes: ["identity_output", "action_decision"],
    direction: 0.8,
    defaultWeight: 0.85,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "independent initiation drive",
      adjectivePhrase: "self-directed and momentum-seeking",
      coreImperative: "initiate deliberately without mistaking speed for authority",
      cautionPhrase: "avoid treating independence as proof that collaboration is weakness"
    },
    interpretationLimits: [
      "Numerology is symbolic and should not be treated as predictive fact.",
      "Life Path does not override lived history, material context, or user agency."
    ]
  },
  {
    symbolicKey: "num_life_path_2",
    sourceSystem: "numerology",
    sourceObject: "Life Path 2",
    axis: "boundary_attachment",
    themes: ["emotional_relational", "action_decision"],
    direction: -0.45,
    defaultWeight: 0.78,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "relational attunement pattern",
      adjectivePhrase: "diplomatic and signal-sensitive",
      coreImperative: "coordinate without outsourcing your center of gravity",
      cautionPhrase: "watch for over-adaptation when the room becomes emotionally loud"
    },
    interpretationLimits: ["This describes a symbolic relational emphasis, not a diagnosis or fixed attachment style."]
  },
  {
    symbolicKey: "num_life_path_3",
    sourceSystem: "numerology",
    sourceObject: "Life Path 3",
    axis: "form_adaptation",
    themes: ["identity_output", "emotional_relational"],
    direction: 0.55,
    defaultWeight: 0.75,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "expressive synthesis channel",
      adjectivePhrase: "communicative and improvisational",
      coreImperative: "shape expression into a repeatable vessel",
      cautionPhrase: "do not confuse visibility with integration"
    },
    interpretationLimits: ["Creative emphasis is symbolic and should be validated against lived patterns."]
  },
  {
    symbolicKey: "num_life_path_4",
    sourceSystem: "numerology",
    sourceObject: "Life Path 4",
    axis: "form_adaptation",
    themes: ["identity_output", "action_decision"],
    direction: -0.7,
    defaultWeight: 0.82,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "structural reliability drive",
      adjectivePhrase: "methodical and containment-oriented",
      coreImperative: "build systems that can survive changing pressure",
      cautionPhrase: "avoid using structure to postpone necessary movement"
    },
    interpretationLimits: ["Structure is treated as a symbolic preference, not a mandate."]
  },
  {
    symbolicKey: "num_life_path_5",
    sourceSystem: "numerology",
    sourceObject: "Life Path 5",
    axis: "form_adaptation",
    themes: ["identity_output", "timing_climate"],
    direction: 0.78,
    defaultWeight: 0.78,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "adaptive exploration impulse",
      adjectivePhrase: "change-ready and experience-led",
      coreImperative: "convert range into discernment",
      cautionPhrase: "avoid treating stimulation as proof of alignment"
    },
    interpretationLimits: ["This does not predict instability or prescribe risk."]
  },
  {
    symbolicKey: "num_life_path_6",
    sourceSystem: "numerology",
    sourceObject: "Life Path 6",
    axis: "boundary_attachment",
    themes: ["emotional_relational", "identity_output"],
    direction: -0.62,
    defaultWeight: 0.8,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "responsible care orientation",
      adjectivePhrase: "protective and repair-minded",
      coreImperative: "serve from consent rather than obligation",
      cautionPhrase: "watch for over-responsibility disguised as devotion"
    },
    interpretationLimits: ["Care themes are symbolic and not evidence of family role, trauma, or duty."]
  },
  {
    symbolicKey: "num_life_path_7",
    sourceSystem: "numerology",
    sourceObject: "Life Path 7",
    axis: "processing_epistemology",
    themes: ["identity_output", "action_decision"],
    direction: -0.72,
    defaultWeight: 0.82,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "investigative meaning filter",
      adjectivePhrase: "discerning and internally verified",
      coreImperative: "let inquiry clarify action instead of replacing it",
      cautionPhrase: "avoid using analysis as a shelter from visible commitment"
    },
    interpretationLimits: ["A reflective pattern is symbolic and does not imply isolation or avoidance."]
  },
  {
    symbolicKey: "num_life_path_8",
    sourceSystem: "numerology",
    sourceObject: "Life Path 8",
    axis: "pacing_momentum",
    themes: ["identity_output", "action_decision"],
    direction: 0.68,
    defaultWeight: 0.84,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "material stewardship drive",
      adjectivePhrase: "strategic and consequence-aware",
      coreImperative: "turn influence into accountable structure",
      cautionPhrase: "avoid treating control as the same thing as stewardship"
    },
    interpretationLimits: ["Material themes do not predict wealth, status, or outcomes."]
  },
  {
    symbolicKey: "num_life_path_9",
    sourceSystem: "numerology",
    sourceObject: "Life Path 9",
    axis: "boundary_attachment",
    themes: ["emotional_relational", "timing_climate"],
    direction: 0.5,
    defaultWeight: 0.76,
    confidenceSensitivity: "low",
    fragments: {
      nounPhrase: "completion and compassion pattern",
      adjectivePhrase: "wide-lensed and meaning-oriented",
      coreImperative: "release what is complete without abandoning what is alive",
      cautionPhrase: "watch for universal care that avoids specific commitments"
    },
    interpretationLimits: ["Completion themes are reflective, not predictive."]
  },
  {
    symbolicKey: "western_sun_aries",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Aries",
    axis: "pacing_momentum",
    themes: ["identity_output", "action_decision"],
    direction: 0.72,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "direct activation signature",
      adjectivePhrase: "decisive and ignition-oriented",
      coreImperative: "lead with clean starts and explicit boundaries",
      cautionPhrase: "avoid mistaking immediacy for truth"
    },
    interpretationLimits: ["Solar sign is a broad symbolic baseline and should not be over-specified."]
  },
  {
    symbolicKey: "western_sun_taurus",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Taurus",
    axis: "form_adaptation",
    themes: ["identity_output", "timing_climate"],
    direction: -0.58,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "embodied stability signature",
      adjectivePhrase: "steady and resource-conscious",
      coreImperative: "let consistency become leverage rather than rigidity",
      cautionPhrase: "avoid defending comfort after the signal has changed"
    },
    interpretationLimits: ["Solar sign is a broad symbolic baseline and not a complete chart."]
  },
  {
    symbolicKey: "western_sun_gemini",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Gemini",
    axis: "processing_epistemology",
    themes: ["identity_output", "emotional_relational"],
    direction: 0.58,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "multiperspectival signal pattern",
      adjectivePhrase: "curious and verbally adaptive",
      coreImperative: "translate complexity without scattering your attention",
      cautionPhrase: "avoid collecting options after a decision has become necessary"
    },
    interpretationLimits: ["Solar sign is a symbolic entry point, not a cognitive assessment."]
  },
  {
    symbolicKey: "western_sun_cancer",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Cancer",
    axis: "boundary_attachment",
    themes: ["emotional_relational", "identity_output"],
    direction: -0.66,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "protective emotional intelligence",
      adjectivePhrase: "contextual and memory-sensitive",
      coreImperative: "make belonging conscious instead of reflexive",
      cautionPhrase: "avoid treating history as the whole map"
    },
    interpretationLimits: ["Solar sign should not be used to infer family history or emotional health."]
  },
  {
    symbolicKey: "western_sun_leo",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Leo",
    axis: "pacing_momentum",
    themes: ["identity_output"],
    direction: 0.66,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "visible creative authorship",
      adjectivePhrase: "expressive and presence-led",
      coreImperative: "make your signal generous and specific",
      cautionPhrase: "avoid confusing attention with reciprocity"
    },
    interpretationLimits: ["Visibility is symbolic and not an assessment of personality quality."]
  },
  {
    symbolicKey: "western_sun_virgo",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Virgo",
    axis: "form_adaptation",
    themes: ["identity_output", "action_decision"],
    direction: -0.5,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "refinement and service logic",
      adjectivePhrase: "discerning and improvement-oriented",
      coreImperative: "make precision useful rather than punitive",
      cautionPhrase: "avoid treating imperfection as a reason to withhold contribution"
    },
    interpretationLimits: ["Solar sign is symbolic and not a clinical or work-style assessment."]
  },
  {
    symbolicKey: "western_sun_libra",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Libra",
    axis: "boundary_attachment",
    themes: ["emotional_relational", "action_decision"],
    direction: -0.48,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "relational calibration field",
      adjectivePhrase: "balancing and agreement-aware",
      coreImperative: "let harmony include honest differentiation",
      cautionPhrase: "avoid postponing truth to preserve temporary ease"
    },
    interpretationLimits: ["Relational themes are symbolic and not a claim about conflict style."]
  },
  {
    symbolicKey: "western_sun_scorpio",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Scorpio",
    axis: "processing_epistemology",
    themes: ["identity_output", "emotional_relational"],
    direction: -0.64,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "depth-oriented truth filter",
      adjectivePhrase: "intense and pattern-detecting",
      coreImperative: "use depth to clarify, not to control the field",
      cautionPhrase: "avoid making opacity feel safer than trust"
    },
    interpretationLimits: ["Depth themes are symbolic and should not imply pathology or secrecy."]
  },
  {
    symbolicKey: "western_sun_sagittarius",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Sagittarius",
    axis: "processing_epistemology",
    themes: ["identity_output", "timing_climate"],
    direction: 0.7,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "horizon-seeking meaning drive",
      adjectivePhrase: "expansive and principle-oriented",
      coreImperative: "test belief through practice",
      cautionPhrase: "avoid using future possibility to bypass present facts"
    },
    interpretationLimits: ["Meaning themes are reflective and not predictive."]
  },
  {
    symbolicKey: "western_sun_capricorn",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Capricorn",
    axis: "pacing_momentum",
    themes: ["identity_output", "action_decision"],
    direction: -0.54,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "long-range responsibility signature",
      adjectivePhrase: "disciplined and outcome-aware",
      coreImperative: "sequence ambition through durable commitments",
      cautionPhrase: "avoid letting seriousness become emotional scarcity"
    },
    interpretationLimits: ["Solar sign is not a career prediction or character judgment."]
  },
  {
    symbolicKey: "western_sun_aquarius",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Aquarius",
    axis: "form_adaptation",
    themes: ["identity_output", "timing_climate"],
    direction: 0.64,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "systems-oriented differentiation",
      adjectivePhrase: "future-facing and pattern-revising",
      coreImperative: "innovate in ways the body and community can actually hold",
      cautionPhrase: "avoid making distance feel like objectivity"
    },
    interpretationLimits: ["Innovation themes are symbolic, not a social or emotional diagnosis."]
  },
  {
    symbolicKey: "western_sun_pisces",
    sourceSystem: "western_astrology",
    sourceObject: "Sun in Pisces",
    axis: "boundary_attachment",
    themes: ["emotional_relational", "timing_climate"],
    direction: 0.44,
    defaultWeight: 0.62,
    confidenceSensitivity: "medium",
    fragments: {
      nounPhrase: "porous imaginal sensitivity",
      adjectivePhrase: "intuitive and atmosphere-aware",
      coreImperative: "give compassion a clear container",
      cautionPhrase: "avoid dissolving boundaries in the name of care"
    },
    interpretationLimits: ["Sensitivity themes are symbolic and not mental health claims."]
  }
];

export function findFragment(symbolicKey: string) {
  return semanticDictionary.find((fragment) => fragment.symbolicKey === symbolicKey);
}

export function fragmentsForKeys(symbolicKeys: string[]) {
  return symbolicKeys.map(findFragment).filter((fragment): fragment is SemanticFragment => Boolean(fragment));
}
