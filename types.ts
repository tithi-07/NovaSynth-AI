export enum AnalysisType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  COMPARISON = 'COMPARISON',
  REPORT = 'REPORT',
}

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  timestamp: number;
  title: string;
  domainTag?: string; // New field for UI tags
  data: any; 
}

export interface TherapeuticPrediction {
  class: string;
  explanation: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface Atom3D {
  element: string;
  x: number;
  y: number;
  z: number;
  id?: number;
}

export interface Bond3D {
  from: number;
  to: number;
  order: number; // 1, 2, or 3
}

export interface Atom2D {
  id: number;
  element: string;
  x: number;
  y: number;
}

export interface Bond2D {
  from: number;
  to: number;
  order: number;
}

export interface Structure2D {
  atoms: Atom2D[];
  bonds: Bond2D[];
}

export interface MoleculeStructure {
  smiles: string;
  inchi?: string; // Standard InChI string
  verificationNote?: string; // Validation details (e.g., "Validated against PubChem")
  atoms: Atom3D[];      // 3D coordinates (Angstroms)
  bonds: Bond3D[];      // 3D bonds
  structure2D?: Structure2D; // Standardized 2D diagram data
}

export interface MoleculeAnalysisData {
  chemicalName?: string;
  formula?: string;
  domain: string; // New: e.g. "Organic Chemistry"
  features: string[];
  properties: {
    solubility: string;
    stability: string;
    toxicity_risk: string;
  };
  similarFamilies: string[];
  hypotheticalVariations: {
    structure: string;
    purpose: string;
  }[];
  therapeuticPredictions: TherapeuticPrediction[];
  structure?: MoleculeStructure; // New structural data
  rawAnalysis: string;
}

export interface TextAnalysisData {
  summary: string;
  studentSummary: string;
  domain: string; // New
  experimentType: string;
  keyConcepts: string[];
  experimentGoals: string[];
  variables: string[];
  results: string[];
  educationalExplanation: string;
  
  // Advanced Insights
  mechanisticInterpretation: string;
  simpleMechanism: string;
  molecularBehavior: string;
  potentialAnalogModifications: string[];
  computationalReasoning: string;
  limitationsAssumptions: string[];

  // Visuals
  visuals: {
    asciiArt: string;
    relationships: {
      source: string;
      target: string;
      interaction: string;
    }[];
    functionalGroups: {
      name: string;
      type: 'Acidic' | 'Basic' | 'Polar' | 'Nonpolar' | 'Reactive' | 'Stable' | 'Other';
    }[];
    keyProperties: {
      label: string;
      value: string;
      trend: 'Positive' | 'Negative' | 'Neutral';
    }[];
  };
}

export interface ComparisonData {
  molecule1: string;
  molecule2: string;
  domain: string; // New
  molecule1Visual: string;
  molecule2Visual: string;
  similarityScore: number;
  similarityExplanation: string;
  reasoningSnapshot: string[];
  confidenceScore: 'High' | 'Medium' | 'Low';
  comparisonTable: {
    feature: string;
    val1: string;
    val2: string;
    trend: 'Positive' | 'Neutral' | 'Uncertain';
  }[];
  structuralModifications: {
    molecule: string;
    suggestion: string;
    impact: string;
  }[];
  molecule1TherapeuticClasses: TherapeuticPrediction[];
  molecule2TherapeuticClasses: TherapeuticPrediction[];
  // New structural data for comparison visualization
  structure1?: MoleculeStructure;
  structure2?: MoleculeStructure;
}

export interface DomainReport {
  domainName: string;
  title: string;
  introduction: string;
  methodInputs: string;
  keyInsights: string;
  suggestedVariations: string;
  limitations: string;
  domainSummary: string;
}

export interface ResearchReportData {
  reports: DomainReport[];
  globalSafetyNotice: string;
}

export interface AppState {
  history: AnalysisResult[];
}