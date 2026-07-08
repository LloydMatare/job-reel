import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily("send-daily-job-alerts", { hourUTC: 12, minuteUTC: 0 }, internal.job_alerts_cron.sendJobAlertsCron, {
  frequency: "daily",
});

crons.weekly("send-weekly-job-alerts", { dayOfWeek: "monday", hourUTC: 12, minuteUTC: 0 }, internal.job_alerts_cron.sendJobAlertsCron, {
  frequency: "weekly",
});

export default crons;
