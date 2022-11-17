import { ArticlesResponse } from "./zendesk.ts";
import { ChannelType, GENERAL_CHANNEL_ID, WEBHOOK_URL } from "./index.ts";

export async function get_articles(
  channel_type: ChannelType,
  articles_url: string,
): Promise<void> {
  try {
    const articles_response = await fetch(
      articles_url,
      {
        signal: AbortSignal.timeout(500),

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
        const last_updated = await localStorage.getItem(article.id.toString());

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
          localStorage.setItem(
            article.id.toString(),
            article.updated_at.toString(),
          );
          localStorage.setItem(article.id + "-name", article.name);

          if (article.name.includes("Java")) {
            console.log(
              "Skipping article",
              article.id,
              "it's java edition, eww",
            );
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
                title = extracted_name[1];

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
                  "[" + extracted_name + "] - [" + extracted_name.length + "]" +
                    " - " + channel_type,
                );
                break;
              }
            }
          }

          let username;
          let avatar;

          switch (channel_type) {
            case ChannelType.PREVIEW: {
              avatar =
                "https://cdn.discordapp.com/emojis/1019717536805306398.png";
              username = "Preview Release";
              break;
            }
            case ChannelType.STABLE: {
              avatar =
                "https://cdn.discordapp.com/emojis/1019717534976577617.png";
              username = "Stable Release";
              break;
            }
          }

          if (new_thread) {
            // const discord_response = await fetch(
            //   WEBHOOK_URL,
            //   {
            //     method: "POST",
            //     redirect: "manual",
            //     headers: {
            //       "content-type": "application/json",
            //     },
            //     body: JSON.stringify({
            //       "username": username,
            //       "avatar_url": avatar,
            //       "thread_name": title,
            //       "content": article.html_url,
            //     }),
            //   },
            // );
          } else {
            // const discord_response = await fetch(
            //   WEBHOOK_URL + "?thread_id=" + GENERAL_CHANNEL_ID,
            //   {
            //     method: "POST",
            //     redirect: "manual",
            //     headers: {
            //       "content-type": "application/json",
            //     },
            //     body: JSON.stringify({
            //       "username": username,
            //       "avatar_url": avatar,
            //       "content": "**A new hotfix has been released - " + title +
            //         "**\n This will not have a dedicated thread.\n" +
            //         article.html_url,
            //     }),
            //   },
            // );
          }
        }
      }
    } else {
      console.error(await articles_response.text());
      return Promise.reject(new Error("Unable to get articles"));
    }
  } catch (e) {
    if (e instanceof TypeError) {
      console.error("Unable to make fetch request:", e.message);
    }
  }
}
