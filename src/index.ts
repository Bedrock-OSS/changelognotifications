import { ArticlesResponse } from "./zendesk";

export interface Env {
  KV_NAMESPACE: KVNamespace;

  WEBHOOK_URL: string;

  GENERAL_CHANNEL_ID: number;

  BOT_USERNAME: string;
  BOT_AVATAR: string;
}

const STABLE_ARTICLES =
  "https://minecraftfeedback.zendesk.com/api/v2/help_center/en-us/sections/360001186971/articles";
const BETA_ARTICLES =
  "https://minecraftfeedback.zendesk.com/api/v2/help_center/en-us/sections/360001185332/articles";

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    await get_articles(ChannelType.STABLE, STABLE_ARTICLES, env);
    await get_articles(ChannelType.PREVIEW, BETA_ARTICLES, env);
  },

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    await get_articles(ChannelType.STABLE, STABLE_ARTICLES, env);
    await get_articles(ChannelType.PREVIEW, BETA_ARTICLES, env);
    return new Response(`Hello World from ${request.method}!`);
  },
};

enum ChannelType {
  STABLE = "Release <:grass_block:1019717534976577617:>",
  PREVIEW = "Preview <:path_block:1019717536805306398:>",
}

async function get_articles(
  channel_type: ChannelType,
  articles_url: string,
  env: Env,
): Promise<void> {
  const articles_response = await fetch(
    articles_url,
    {
      method: "GET",
      redirect: "manual",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    },
  );

  const { headers } = articles_response;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const articles = await articles_response.json() as ArticlesResponse;

    for (const article of articles.articles) {
      const last_updated = await env.KV_NAMESPACE.get(article.id);

      if (last_updated) {
        if (last_updated != article.updated_at.toString()) {
          console.log("Article", article.id, "has been updated");
        }
      } else {
        console.log(
          "Found new article",
          article.id,
          "from",
          article.updated_at.toString(),
        );
        env.KV_NAMESPACE.put(article.id, article.updated_at.toString());
        env.KV_NAMESPACE.put(article.id + "-name", article.name);
        env.KV_NAMESPACE.put(article.id + "-contents", article.body);

        if (article.name.includes("Java")) {
          console.log("Skipping article", article.id, "it's java edition, eww");
          continue;
        }

        const regex = new RegExp(
          "Minecraft.* -\\s*([\\.0-9/]*)( \\((.*)\\))?",
          "gm",
        );

        const extracted_name = regex.exec(article.name);

        let title = article.name;

        let new_thread = true;

        if (extracted_name) {
          switch (extracted_name.length) {
            case 2: {
              title = extracted_name[1] + " - " + channel_type;

              break;
            }
            case 4: {
              if (
                extracted_name[3] !== undefined &&
                extracted_name[3] != "Bedrock"
              ) {
                title = extracted_name[1] + " - Platforms (*" +
                  extracted_name[3] + "*)" + " - " + channel_type;
                new_thread = false;
              } else {
                title = extracted_name[1] + " - " + channel_type;
              }
              break;
            }
            default: {
              console.error(
                "Problem with article name",
                article.name,
                "[" + extracted_name + "] - [" + extracted_name.length + "]",
              );
              break;
            }
          }
        }

        const username = env.BOT_USERNAME;
        const avatar = env.BOT_AVATAR;

        if (new_thread) {
          const discord_response = await fetch(
            env.WEBHOOK_URL,
            {
              method: "POST",
              redirect: "manual",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                "username": username,
                "avatar_url": avatar,
                "thread_name": title,
                "content": article.html_url,
              }),
            },
          );

          env.KV_NAMESPACE.put(
            article.id + "-discord-response",
            await discord_response.text(),
          );
        } else {
          const discord_response = await fetch(
            env.WEBHOOK_URL + "?thread_id=" + env.GENERAL_CHANNEL_ID,
            {
              method: "POST",
              redirect: "manual",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                "username": username,
                "avatar_url": avatar,
                "content": "**A new hotfix has been released - " + title +
                  "**\n This will not have a dedicated thread.\n" +
                  article.html_url,
              }),
            },
          );
          env.KV_NAMESPACE.put(
            article.id + "-discord-response",
            await discord_response.text(),
          );
        }
      }
    }
  } else {
    console.error(await articles_response.text());
  }
}
