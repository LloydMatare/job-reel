import { v } from "convex/values";
import { action } from "./_generated/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("OpenAI API error:", res.status, body);
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export const generateResumeContent = action({
  args: {
    summary: v.optional(v.string()),
    experience: v.array(
      v.object({
        company: v.string(),
        role: v.string(),
        startDate: v.string(),
        endDate: v.optional(v.string()),
        description: v.string(),
      }),
    ),
    education: v.array(
      v.object({
        institution: v.string(),
        degree: v.string(),
        field: v.string(),
        year: v.string(),
      }),
    ),
    skills: v.array(v.string()),
    jobDescription: v.optional(v.string()),
  },
  handler: async (_, args) => {
    const systemPrompt = `You are a professional resume writer and career coach. Your task is to polish the user's raw resume content into a compelling, ATS-friendly format. Improve bullet points, strengthen action verbs, and highlight achievements. Return a JSON object with the EXACT same structure as the input, only with polished content. Do NOT include markdown code fences — return raw JSON only.`;

    const userInput = JSON.stringify(args, null, 2);
    const content = await callOpenAI(systemPrompt, userInput);
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  },
});

export const generateCoverLetter = action({
  args: {
    jobTitle: v.string(),
    companyName: v.string(),
    jobDescription: v.string(),
    userSummary: v.optional(v.string()),
    userExperience: v.optional(v.string()),
    userSkills: v.optional(v.string()),
  },
  handler: async (_, args) => {
    const systemPrompt = `You are a professional cover letter writer. Write a tailored, compelling cover letter for the job described. Keep it concise (250-400 words), professional, and specific to both the candidate and the company. Use the candidate's actual experience and skills. Do not invent qualifications.`;

    const userMessage = `Job: ${args.jobTitle} at ${args.companyName}\n\nDescription: ${args.jobDescription}\n\nAbout me: ${args.userSummary ?? "N/A"}\nExperience: ${args.userExperience ?? "N/A"}\nSkills: ${args.userSkills ?? "N/A"}\n\nWrite a tailored cover letter.`;

    return await callOpenAI(systemPrompt, userMessage);
  },
});

export const askCareerQuestion = action({
  args: {
    question: v.string(),
    userSummary: v.optional(v.string()),
    userSkills: v.optional(v.string()),
    chatHistory: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        }),
      ),
    ),
  },
  handler: async (_, args) => {
    const systemPrompt = `You are an expert career guidance counselor. Provide thoughtful, actionable advice tailored to the user's background. Be encouraging but realistic. Cover topics like career transitions, skill development, salary negotiation, interview preparation, and industry trends. Keep responses conversational and helpful.`;

    const context = `User background:\nSummary: ${args.userSummary ?? "N/A"}\nSkills: ${args.userSkills ?? "N/A"}`;

    const history = args.chatHistory
      ? args.chatHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
      : "";

    const userMessage = `${context}\n\n${history ? `Previous conversation:\n${history}\n\n` : ""}Question: ${args.question}`;

    return await callOpenAI(systemPrompt, userMessage);
  },
});
