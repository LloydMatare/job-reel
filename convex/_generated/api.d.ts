/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as applications from "../applications.js";
import type * as billing from "../billing.js";
import type * as career_chat from "../career_chat.js";
import type * as career_chat_helpers from "../career_chat_helpers.js";
import type * as career_chat_send from "../career_chat_send.js";
import type * as categories from "../categories.js";
import type * as companies from "../companies.js";
import type * as company_members from "../company_members.js";
import type * as cover_letters from "../cover_letters.js";
import type * as crons from "../crons.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as insights from "../insights.js";
import type * as job_alerts from "../job_alerts.js";
import type * as job_alerts_cron from "../job_alerts_cron.js";
import type * as jobs from "../jobs.js";
import type * as lib_admin from "../lib/admin.js";
import type * as myFunctions from "../myFunctions.js";
import type * as notifications from "../notifications.js";
import type * as permissions from "../permissions.js";
import type * as resumes from "../resumes.js";
import type * as saved_jobs from "../saved_jobs.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  applications: typeof applications;
  billing: typeof billing;
  career_chat: typeof career_chat;
  career_chat_helpers: typeof career_chat_helpers;
  career_chat_send: typeof career_chat_send;
  categories: typeof categories;
  companies: typeof companies;
  company_members: typeof company_members;
  cover_letters: typeof cover_letters;
  crons: typeof crons;
  health: typeof health;
  http: typeof http;
  insights: typeof insights;
  job_alerts: typeof job_alerts;
  job_alerts_cron: typeof job_alerts_cron;
  jobs: typeof jobs;
  "lib/admin": typeof lib_admin;
  myFunctions: typeof myFunctions;
  notifications: typeof notifications;
  permissions: typeof permissions;
  resumes: typeof resumes;
  saved_jobs: typeof saved_jobs;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
