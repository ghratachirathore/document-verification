import { GoogleGenerativeAI } from "@google/generative-ai";
import { isGeminiEnabled, env } from "../config/env.js";
import { DOCUMENT_TYPES } from "../constants/status.constants.js";
import { logger } from "../utils/logger.js";

const demoExtraction = (type, fileName = "") => {
  const cleanName = fileName.toLowerCase();
  const baseName = cleanName.includes("aman") ? "Aman Sharma" : "Candidate Profile";

  if (type === DOCUMENT_TYPES.MARKSHEET) {
    return {
      name: cleanName.includes("marksheet") ? "Aman K Sharma" : baseName,
      branch: "Computer Science",
      cgpa: 8.4,
      passingYear: 2025
    };
  }

  if (type === DOCUMENT_TYPES.INTERNSHIP_CERTIFICATE) {
    return {
      name: baseName,
      internships: [
        {
          company: "TechNova Labs",
          role: "Full Stack Intern",
          duration: "May 2024 - July 2024"
        }
      ]
    };
  }

  return {
    name: baseName,
    branch: "Computer Science",
    cgpa: 8.4,
    passingYear: 2025,
    skills: ["React", "Node.js", "MongoDB", "Express.js", "Machine Learning"],
    projects: [
      {
        title: "Campus Placement Portal",
        description: "A MERN workflow app for placement applications and HR screening.",
        technologies: ["React", "Node.js", "MongoDB"]
      },
      {
        title: "Credential Risk Analyzer",
        description: "A scoring dashboard for comparing extracted academic records.",
        technologies: ["JavaScript", "Express.js"]
      }
    ],
    internships: [
      {
        company: "TechNova Labs",
        role: "Full Stack Intern",
        duration: "May 2024 - July 2024"
      }
    ]
  };
};

const parseJsonFromText = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return {};
  return JSON.parse(match[0]);
};

const fallbackSummary = (profile, verification) => {
  const skills = profile.skills?.slice(0, 3).join(", ") || "core technical skills";
  return {
    summary: `${profile.extractedName || "This candidate"} has a ${profile.branch || "technical"} profile with ${skills}. Verification is currently marked as ${verification.status}.`,
    strengths: [profile.cgpa ? `CGPA ${profile.cgpa}` : "Academic details available", "Structured skills extracted"],
    risks: verification.issues?.length ? verification.issues : ["No major AI-detected summary risks"],
    generatedBy: "demo"
  };
};

export const geminiService = {
  async extractDocument(file, type) {
    if (!isGeminiEnabled) {
      logger.debug("Using demo Gemini extraction", { type, originalName: file?.originalname });
      return demoExtraction(type, file?.originalname);
    }

    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64 = file.buffer?.toString("base64") || "";

    const prompt = `
Extract structured candidate credential information from this ${type}.
Return strict JSON only with possible keys:
name, branch, cgpa, passingYear, skills, projects[{title,description,technologies}], internships[{company,role,duration}].
Do not make verification decisions.
`;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: file.mimetype
          }
        }
      ]);

      return parseJsonFromText(result.response.text());
    } catch (error) {
      logger.warn("Gemini extraction unavailable, using demo extraction", { type, originalName: file?.originalname, error: error?.message || error });
      return demoExtraction(type, file?.originalname);
    }
  },
  async summarizeCandidate(profile, verification) {
    if (!isGeminiEnabled) {
      logger.debug("Using demo Gemini candidate summary", { status: verification.status });
      return fallbackSummary(profile, verification);
    }

    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
      const result = await model.generateContent(`
Create an HR-facing credential summary. Do not approve or reject the candidate.
Return JSON: { "summary": string, "strengths": string[], "risks": string[] }.
Profile: ${JSON.stringify(profile)}
Verification: ${JSON.stringify(verification)}
`);
      return { ...parseJsonFromText(result.response.text()), generatedBy: "gemini" };
    } catch (error) {
      logger.warn("Gemini summary unavailable, using demo summary", { status: verification.status, error: error?.message || error });
      return fallbackSummary(profile, verification);
    }
  }
};
