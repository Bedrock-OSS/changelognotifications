# Changelog Notification Bot

This bot crawls the zendesk API endpoints for Stable and Preview releases
for minecraft. When a new release is found, the data is input into
cloudflare KV so that no future posts are made.

The entire script runs on cloudflare workers and will remain in free tier
for the foreseable future. There is potential that API calls for fetching known
articles could be reduced to a single key.

Caveats:

- First run generates lots of posts
- No tag gets applied to the forum thread
- Zendesk has a low rate limit. Provided this runs on the minute when cron scheduled,
  this limit shouldn't be a problem. If the endpoint is triggered manually, this can be
  used to manually trigger an update if rate limits keep being hit (Not ideal but.. meh)
