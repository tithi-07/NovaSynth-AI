import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MoleculeAnalysisData, TextAnalysisData, ComparisonData, AnalysisResult, ResearchReportData } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 3 Pro Preview for advanced reasoning and multimodal capabilities
const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Helper to safely parse JSON from model output, handling potential Markdown code blocks.
 */
const parseJSON = (text: string) => {
  try {
    // Remove markdown code fences if present (e.g., ```json ... ```)
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    return {};
  }
};

/**
 * Helper to convert file to base64 for Gemini API.
 * Includes fallback conversion for unsupported MIME types (e.g. AVIF) to JPEG.
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  // Directly supported MIME types by Gemini API
  // Explicitly excluding image/avif to force conversion
  const SUPPORTED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  // Strict check: Must be in supported list AND not be AVIF (double check)
  if (SUPPORTED_MIME_TYPES.includes(file.type) && file.type !== 'image/avif') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        if (!base64Data) {
            reject(new Error("Failed to read file data"));
            return;
        }
        const base64Content = base64Data.split(',')[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } else {
    // Attempt conversion for unsupported types (e.g., image/avif, image/bmp) to JPEG
    return new Promise((resolve, reject) => {
        console.log(`Converting unsupported format ${file.type} to image/jpeg...`);
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(url);
                    reject(new Error("Canvas context unavailable for image conversion"));
                    return;
                }
                // Draw image to canvas
                ctx.drawImage(img, 0, 0);
                
                // Convert to JPEG
                const dataURL = canvas.toDataURL('image/jpeg', 0.9);
                const base64Content = dataURL.split(',')[1];
                
                URL.revokeObjectURL(url);
                resolve({
                    inlineData: {
                        data: base64Content,
                        mimeType: 'image/jpeg',
                    }
                });
            } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
            }
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Unsupported image format: ${file.type}. Please upload PNG, JPG, or WEBP.`));
        };
        
        img.src = url;
    });
  }
};

// Reusable Structure Schema to ensure consistency across endpoints
const MOLECULE_STRUCTURE_SCHEMA = {
    type: Type.OBJECT,
    description: "Chemically accurate structural data",
    properties: {
        smiles: { type: Type.STRING, description: "Canonical SMILES string." },
        inchi: { type: Type.STRING, description: "Standard InChI string." },
        verificationNote: { type: Type.STRING, description: "Validation source." },
        atoms: {
            type: Type.ARRAY,
            description: "3D coordinates (Angstroms). Include ALL atoms (Explicit H).",
            items: {
                type: Type.OBJECT,
                properties: {
                    element: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    z: { type: Type.NUMBER }
                },
                required: ["element", "x", "y", "z"]
            }
        },
        bonds: {
            type: Type.ARRAY,
            description: "3D Bonds.",
            items: {
                type: Type.OBJECT,
                properties: {
                    from: { type: Type.INTEGER },
                    to: { type: Type.INTEGER },
                    order: { type: Type.INTEGER }
                },
                required: ["from", "to", "order"]
            }
        },
        structure2D: {
            type: Type.OBJECT,
            description: "Standard 2D Layout. EXPLICIT ATOMS ONLY.",
            properties: {
                atoms: {
                    type: Type.ARRAY,
                    description: "2D Layout Coordinates. Include EVERY atom (C, H, O, N). No skeletal hiding. Explicitly list all Carbons.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            element: { type: Type.STRING },
                            x: { type: Type.NUMBER, description: "2D X coordinate" },
                            y: { type: Type.NUMBER, description: "2D Y coordinate" }
                        },
                        required: ["id", "element", "x", "y"]
                    }
                },
                bonds: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            from: { type: Type.INTEGER },
                            to: { type: Type.INTEGER },
                            order: { type: Type.INTEGER }
                        },
                        required: ["from", "to", "order"]
                    }
                }
            },
            required: ["atoms", "bonds"]
        }
    },
    required: ["smiles", "inchi", "verificationNote", "atoms", "bonds", "structure2D"]
};

/**
 * 0. Molecule Input Validator
 */
export const validateComparisonInputs = async (mol1: string, mol2: string): Promise<{ mol1Valid: boolean; mol2Valid: boolean }> => {
  const ai = getClient();
  const prompt = `
    You are a strict molecular input validator.
    Given a user string, decide whether it is a valid chemical input.
    
    Task: Validate the following two inputs.
    
    Input 1: "${mol1}"
    Input 2: "${mol2}"

    Rules:
    Accept only:
    • Canonical molecule names (e.g., "aspirin", "ethanol", "paracetamol")
    • Valid SMILES strings
    • Valid InChI strings
    
    DO NOT guess or infer a molecule from random letters.
    DO NOT invent or autocorrect molecule names.
    If there is any uncertainty, treat it as invalid.
    
    If the input is NOT a valid molecule name or valid SMILES/InChI, return NOT VALID.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      mol1Valid: { type: Type.BOOLEAN },
      mol2Valid: { type: Type.BOOLEAN }
    },
    required: ["mol1Valid", "mol2Valid"]
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: [{ text: prompt }]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  return parseJSON(response.text || '{}') as { mol1Valid: boolean; mol2Valid: boolean };
};

/**
 * 1. Image Analysis
 */
export const analyzeMoleculeImage = async (imageFile: File): Promise<MoleculeAnalysisData> => {
  const ai = getClient();
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
    You are an advanced Computational Chemistry Engine.

    STRICT SAFETY & IDENTIFICATION PROTOCOL:
    1. You must NOT infer or guess a molecule based on theme, mood, color, objects, or symbolism in the image.
    2. You may only identify a chemical structure when the image explicitly contains:
       - A molecular diagram
       - A chemical formula
       - SMILES / InChI
       - A labeled structure
       - Scientific imagery (spectra, lab notes, diagrams)
    3. If the image does not explicitly show chemical information, return "Not Detected" for name/formula and "Invalid" for domain.
    4. Do not output a molecule name, formula, or analysis if none is visible.
    5. No emotional, thematic, aesthetic, or symbolic molecule generation.
    
    PIPELINE:
    1. **IDENTIFY**: Identify the molecule from the image only if explicitly present.
    2. **FETCH SMILES**: Get the canonical SMILES if identified.
    3. **GENERATE 2D EXPLICIT STRUCTURE**:
       - Generate a standard 2D layout.
       - **Coordinates**: Calculate X/Y coordinates to ensure a clean, non-overlapping diagram.
       - **Angles**: Use standard 120 degree angles for hexagons/sp2, 109/180 for others.
       - **EXPLICIT RULES (IMPORTANT)**:
         - **DO NOT** use skeletal suppression.
         - **INCLUDE ALL** Carbon atoms as explicit nodes with 'C'.
         - **INCLUDE ALL** Hydrogen atoms as explicit nodes with 'H'.
         - Every atom in the molecule must be listed in the 2D structure atoms list.
    4. **GENERATE 3D GEOMETRY**:
       - Full explicit atoms (including ALL H) in 3D Angstroms.
    
    Output JSON. If no molecule is detected, return valid JSON with "Not Detected" values.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      chemicalName: { type: Type.STRING, description: "The name of the molecule or 'Not Detected'." },
      formula: { type: Type.STRING, description: "Chemical formula or 'N/A'." },
      domain: { type: Type.STRING, description: "Scientific domain or 'Invalid'." },
      features: { type: Type.ARRAY, items: { type: Type.STRING } },
      properties: {
        type: Type.OBJECT,
        properties: {
          solubility: { type: Type.STRING },
          stability: { type: Type.STRING },
          toxicity_risk: { type: Type.STRING }
        },
        required: ["solubility", "stability", "toxicity_risk"]
      },
      similarFamilies: { type: Type.ARRAY, items: { type: Type.STRING } },
      hypotheticalVariations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            structure: { type: Type.STRING },
            purpose: { type: Type.STRING }
          },
          required: ["structure", "purpose"]
        }
      },
      therapeuticPredictions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            class: { type: Type.STRING },
            explanation: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
          },
          required: ["class", "explanation", "confidence"]
        }
      },
      structure: MOLECULE_STRUCTURE_SCHEMA,
      rawAnalysis: { type: Type.STRING, description: "If invalid, state 'No chemical structure identified in image.'" }
    },
    required: ["chemicalName", "formula", "domain", "features", "properties", "similarFamilies", "hypotheticalVariations", "therapeuticPredictions", "structure", "rawAnalysis"]
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: [imagePart, { text: prompt }]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  return parseJSON(response.text || '{}') as MoleculeAnalysisData;
};

/**
 * 2. Text Analysis
 */
export const analyzeScientificText = async (text: string): Promise<TextAnalysisData> => {
  const ai = getClient();
  
  const prompt = `
    Analyze this scientific text.
    Extract summary, domain, mechanism, and visuals.
    Text: "${text}"
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      studentSummary: { type: Type.STRING },
      domain: { type: Type.STRING },
      experimentType: { type: Type.STRING },
      keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
      experimentGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
      variables: { type: Type.ARRAY, items: { type: Type.STRING } },
      results: { type: Type.ARRAY, items: { type: Type.STRING } },
      educationalExplanation: { type: Type.STRING },
      mechanisticInterpretation: { type: Type.STRING },
      simpleMechanism: { type: Type.STRING },
      molecularBehavior: { type: Type.STRING },
      potentialAnalogModifications: { type: Type.ARRAY, items: { type: Type.STRING } },
      computationalReasoning: { type: Type.STRING },
      limitationsAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
      visuals: {
        type: Type.OBJECT,
        properties: {
            asciiArt: { type: Type.STRING },
            relationships: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        source: { type: Type.STRING },
                        target: { type: Type.STRING },
                        interaction: { type: Type.STRING }
                    }
                }
            },
            functionalGroups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['Acidic', 'Basic', 'Polar', 'Nonpolar', 'Reactive', 'Stable', 'Other'] }
                    }
                }
            },
            keyProperties: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        trend: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] }
                    }
                }
            }
        },
        required: ["asciiArt", "relationships", "functionalGroups", "keyProperties"]
      }
    },
    required: [
        "summary", "studentSummary", "domain", "experimentType", "keyConcepts", "experimentGoals", "variables", "results", "educationalExplanation",
        "mechanisticInterpretation", "simpleMechanism", "molecularBehavior", "potentialAnalogModifications", "computationalReasoning", "limitationsAssumptions", "visuals"
    ]
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: [{ text: prompt }]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  return parseJSON(response.text || '{}') as TextAnalysisData;
};

/**
 * 3. Comparison Engine
 */
export const compareMoleculesText = async (mol1: string, mol2: string): Promise<ComparisonData> => {
  const ai = getClient();

  const prompt = `
    Compare: "${mol1}" vs "${mol2}".
    
    For EACH molecule:
    1. Identify & Fetch SMILES.
    2. **GENERATE 2D EXPLICIT STRUCTURE**:
       - Calculate standard 2D layout (x,y) for a clean chemical diagram.
       - Ensure correct bond angles and non-overlapping atoms.
       - **EXPLICIT RULES**: Include ALL atoms (C, H, O, N) explicitly. No skeletal hiding.
    3. Generate 3D Structure (Explicit H).
    
    Comparison:
    - Domain, Similarity, Matrix, Therapeutics.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      molecule1: { type: Type.STRING },
      molecule2: { type: Type.STRING },
      domain: { type: Type.STRING },
      molecule1Visual: { type: Type.STRING },
      molecule2Visual: { type: Type.STRING },
      similarityScore: { type: Type.NUMBER },
      similarityExplanation: { type: Type.STRING },
      reasoningSnapshot: { type: Type.ARRAY, items: { type: Type.STRING } },
      confidenceScore: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
      comparisonTable: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            feature: { type: Type.STRING },
            val1: { type: Type.STRING },
            val2: { type: Type.STRING },
            trend: { type: Type.STRING, enum: ["Positive", "Neutral", "Uncertain"] }
          },
          required: ["feature", "val1", "val2", "trend"]
        }
      },
      structuralModifications: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                molecule: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                impact: { type: Type.STRING }
            }
        }
      },
      molecule1TherapeuticClasses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            class: { type: Type.STRING },
            explanation: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
          },
          required: ["class", "explanation", "confidence"]
        }
      },
      molecule2TherapeuticClasses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            class: { type: Type.STRING },
            explanation: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
          },
          required: ["class", "explanation", "confidence"]
        }
      },
      structure1: MOLECULE_STRUCTURE_SCHEMA,
      structure2: MOLECULE_STRUCTURE_SCHEMA,
    },
    required: ["molecule1", "molecule2", "domain", "molecule1Visual", "molecule2Visual", "similarityScore", "similarityExplanation", "reasoningSnapshot", "confidenceScore", "comparisonTable", "structuralModifications", "molecule1TherapeuticClasses", "molecule2TherapeuticClasses", "structure1", "structure2"]
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: [{ text: prompt }]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  return parseJSON(response.text || '{}') as ComparisonData;
};

/**
 * 4. Research Report Generation
 */
export const generateResearchReport = async (history: AnalysisResult[]): Promise<ResearchReportData> => {
    const ai = getClient();
  
    // 1. Format history for context
    const contextString = history.map((h, i) => {
        const domain = h.data.domain || "General Science";
        return `[Item ${i+1}] Domain: ${domain} | Type: ${h.type} | Title: ${h.title}\nData: ${JSON.stringify(h.data)}`;
    }).join('\n\n----------------\n\n');
  
    const prompt = `
      You are NovaSynth AI.
      Generate a Research Insight Report.
      Group by Scientific Domain.
      
      Session Data:
      ${contextString}
    `;
  
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        reports: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    domainName: { type: Type.STRING },
                    title: { type: Type.STRING },
                    introduction: { type: Type.STRING },
                    methodInputs: { type: Type.STRING },
                    keyInsights: { type: Type.STRING },
                    suggestedVariations: { type: Type.STRING },
                    limitations: { type: Type.STRING },
                    domainSummary: { type: Type.STRING }
                },
                required: ["domainName", "title", "introduction", "methodInputs", "keyInsights", "suggestedVariations", "limitations", "domainSummary"]
            }
        },
        globalSafetyNotice: { type: Type.STRING }
      },
      required: ["reports", "globalSafetyNotice"]
    };
  
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
  
    return parseJSON(response.text || '{}') as ResearchReportData;
};