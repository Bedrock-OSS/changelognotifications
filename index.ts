import { config } from "https://deno.land/std@0.165.0/dotenv/mod.ts";

import { get_articles } from "./get_articles.ts";

const configData = await config({ safe: true });

const WEBHOOK_URL = configData["WEBHOOK_URL"];
const GENERAL_CHANNEL_ID = configData["GENERAL_CHANNEL_ID"];
const BOT_USERNAME = configData["BOT_USERNAME"];
const BOT_AVATAR = configData["BOT_AVATAR"];

console.log("Webhook URL: " + WEBHOOK_URL);
console.log("General channel: " + GENERAL_CHANNEL_ID);

export { BOT_AVATAR, BOT_USERNAME, GENERAL_CHANNEL_ID, WEBHOOK_URL };

export enum ChannelType {
  STABLE = "Release",
  PREVIEW = "Preview",
}

const STABLE_ARTICLES =
  "https://minecraftfeedback.zendesk.com/api/v2/help_center/en-us/sections/360001186971/articles";
const BETA_ARTICLES =
  "https://minecraftfeedback.zendesk.com/api/v2/help_center/en-us/sections/360001185332/articles";

await Promise.all([
  get_articles(ChannelType.STABLE, STABLE_ARTICLES),
  get_articles(ChannelType.PREVIEW, BETA_ARTICLES),
]);

localStorage.setItem("myDemo", "Deno App");
