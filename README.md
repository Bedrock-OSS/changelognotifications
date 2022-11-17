This bot simply crawls the zendesk api endpoint for new
articles, then posts to discord, either as a new thread, or in the existing
general thread in cases of hotfixes.

This currently runs for the BedrockOSS discord on a vm so that
cron scheduling can be precise to the second (due to API rate limits)
