export type Question = {
  id: string;
  question: string;
  hint?: string;
};

export type Answers = Record<string, string>;

export type StackChoice = {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  hosting: string;
  rationale: string;
};

export type GeneratedDocs = {
  projectName: string;
  prd: string;
  srs: string;
  architecture: string;
  designSystem: string;
  apiSpec: string;
  folderStructure: string; // JSON string
  readme: string;
};

export type Step = "idea" | "questions" | "stack" | "generating" | "output";
