import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/career-chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = authHeader.slice(7);
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return new Response("Unauthorized", { status: 401 });
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await request.json();
    const content = body.content;
    if (!content || typeof content !== "string") {
      return new Response("Bad request", { status: 400 });
    }
    const response = await ctx.runAction(api.career_chat_send.sendMessage, { content });
    return new Response(JSON.stringify({ response }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/generate-cover-letter",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = authHeader.slice(7);
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return new Response("Unauthorized", { status: 401 });
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await request.json();
    const { resume, resumeTitle } = body;
    if (!resume) return new Response("Bad request", { status: 400 });
    const response = await ctx.runAction(api.ai.generateCoverLetter, {
      jobTitle: "Software Engineer",
      companyName: "Company",
      jobDescription: "Based on resume: " + resumeTitle,
      userSummary: resume.summary ?? undefined,
      userExperience: resume.experience?.map((e: any) => `${e.role} at ${e.company}: ${e.description}`).join("\n") ?? undefined,
      userSkills: resume.skills?.join(", ") ?? undefined,
    });
    return new Response(JSON.stringify({ content: response }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
