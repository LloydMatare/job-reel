import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — email not sent:", payload.subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Job Reel <noreply@job-reel.com>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Failed to send email:", res.status, body);
  }
}

export const sendApplicationNotification = action({
  args: {
    employerEmail: v.string(),
    jobTitle: v.string(),
    applicantName: v.string(),
    jobUrl: v.string(),
  },
  handler: async (_, args) => {
    await sendEmail({
      to: args.employerEmail,
      subject: `New applicant for ${args.jobTitle}`,
      html: `<p><strong>${args.applicantName}</strong> applied for <strong>${args.jobTitle}</strong>.</p>
<p><a href="${args.jobUrl}">View applications</a></p>`,
    });
  },
});

export const sendStatusNotification = action({
  args: {
    seekerEmail: v.string(),
    jobTitle: v.string(),
    status: v.string(),
    companyName: v.optional(v.string()),
  },
  handler: async (_, args) => {
    await sendEmail({
      to: args.seekerEmail,
      subject: `Application ${args.status} — ${args.jobTitle}`,
      html: `<p>Your application for <strong>${args.jobTitle}</strong>${args.companyName ? ` at ${args.companyName}` : ""} has been <strong>${args.status}</strong>.</p>`,
    });
  },
});

export const sendJobAlert = action({
  args: {
    email: v.string(),
    jobs: v.array(
      v.object({
        title: v.string(),
        companyName: v.optional(v.string()),
        url: v.string(),
      }),
    ),
  },
  handler: async (_, args) => {
    if (args.jobs.length === 0) return;
    const jobList = args.jobs
      .map((j) => `<li><a href="${j.url}">${j.title}</a>${j.companyName ? ` — ${j.companyName}` : ""}</li>`)
      .join("");
    await sendEmail({
      to: args.email,
      subject: `Job Alerts — ${args.jobs.length} new jobs found`,
      html: `<p>New jobs matching your saved search:</p><ul>${jobList}</ul>`,
    });
  },
});

export const sendJobPostedNotification = action({
  args: {
    employerEmail: v.string(),
    jobTitle: v.string(),
    jobUrl: v.string(),
  },
  handler: async (_, args) => {
    await sendEmail({
      to: args.employerEmail,
      subject: `Job posted: ${args.jobTitle}`,
      html: `<p>Your job <strong>${args.jobTitle}</strong> is now live.</p>
<p><a href="${args.jobUrl}">View job</a></p>`,
    });
  },
});
