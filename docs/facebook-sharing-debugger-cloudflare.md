# Facebook Sharing Debugger + Cloudflare Runbook

Use this when Meta/Facebook Sharing Debugger reports:

```txt
Bad response code
URL returned a bad HTTP response code.
This response code could be due to a robots.txt block.
Please allowlist facebookexternalhit on your site's robots.txt config.
```

## Key Lessons

Facebook Debugger can show a stale `403` even after the preview card renders correctly. Do not guess from the Debugger UI alone.

Confirm the real source of truth in this order:

```txt
1. Direct HTTP response with Facebook user-agent
2. Cloudflare Security Events
3. Cloudflare HTTP analytics status
4. robots.txt cache headers
5. Facebook Debugger scrape cache
```

If Cloudflare logs show no `403`, and the card has `og:title`, `og:image`, and `og:description`, the site is probably already crawlable.

## Cloudflare Token Permissions

Create a temporary Cloudflare API token scoped to the target zone.

```txt
Zone / Zone / Read
Zone / Analytics / Read
Zone / Cache Purge / Purge
Zone / Zone WAF / Edit
Zone / Firewall Services / Edit
```

Zone Resources:

```txt
Include -> Specific zone -> vivutrade.io.vn
```

Delete the token after debugging.

## Required Cloudflare Rules

### WAF Custom Rule

Create a custom rule named:

```txt
Allow Facebook
```

Expression:

```txt
(
  lower(http.user_agent) contains "facebookexternalhit"
  or lower(http.user_agent) contains "facebot"
  or lower(http.user_agent) contains "meta-externalagent"
  or lower(http.user_agent) contains "facebookcatalog"
  or ip.src.asnum eq 32934
)
```

Action:

```txt
Skip
```

Skip components:

```txt
All remaining custom rules
All rate limiting rules
All managed rules
All Super Bot Fight Mode Rules
Zone Lockdown
User Agent Blocking
Browser Integrity Check
Hotlink Protection
Security Level
```

Place it first.

### IP Access Rule

Because Cloudflare `Skip` rules cannot skip IP Access Rules, add:

```txt
Target: ASN
Value: AS32934
Mode: whitelist
Notes: Allow Meta/Facebook crawlers for link preview debugging
```

## robots.txt

Keep `robots.txt` simple while debugging:

```txt
User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: *
Allow: /

Sitemap: https://pixelpro.vivutrade.io.vn/sitemap.xml
```

Serve `/robots.txt` with no cache:

```ts
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.type('text/plain');
  res.sendFile(path.join(distPath, 'robots.txt'));
});
```

This route must be registered before `express.static(distPath)`.

## Local Verification

Use these commands from the project root:

```powershell
curl.exe -I -L -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" https://pixelpro.vivutrade.io.vn/
curl.exe -I -L -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" https://pixelpro.vivutrade.io.vn/preview.jpg
curl.exe -i -L -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" https://pixelpro.vivutrade.io.vn/robots.txt
```

Expected:

```txt
/ -> 200 OK
/preview.jpg -> 200 OK
/robots.txt -> 200 OK
/robots.txt -> cf-cache-status: BYPASS
/robots.txt -> Cache-Control: no-store, no-cache, must-revalidate, max-age=0
```

## Cloudflare Security Events Query

Use GraphQL to confirm whether Cloudflare is actually blocking Meta.

```graphql
query($zoneTag: string!, $datetime_geq: Time!, $datetime_leq: Time!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      firewallEventsAdaptive(
        filter: {
          datetime_geq: $datetime_geq
          datetime_leq: $datetime_leq
          clientRequestHTTPHost: "pixelpro.vivutrade.io.vn"
        }
        limit: 50
        orderBy: [datetime_DESC]
      ) {
        datetime
        action
        source
        clientAsn
        clientCountryName
        clientIP
        userAgent
        clientRequestPath
        ruleId
        description
      }
    }
  }
}
```

Interpretation:

```txt
action=allow source=asn ruleId=asn clientAsn=32934
Good. Meta is allowlisted by ASN.

action=skip source=firewallCustom description="Allow Facebook"
Good. The WAF skip rule matched.

No block/challenge events
Cloudflare WAF is not the source of the Debugger 403.
```

## Cloudflare HTTP Analytics Query

Query real response statuses for the host:

```graphql
query($zoneTag: string!, $datetime_geq: Time!, $datetime_leq: Time!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        filter: {
          datetime_geq: $datetime_geq
          datetime_leq: $datetime_leq
          clientRequestHTTPHost: "pixelpro.vivutrade.io.vn"
        }
        limit: 100
        orderBy: [datetime_DESC]
      ) {
        dimensions {
          datetime
          clientRequestPath
          userAgent
          edgeResponseStatus
          originResponseStatus
          cacheStatus
          securityAction
          securitySource
        }
        count
      }
    }
  }
}
```

Important observation from this incident:

```txt
/preview.jpg -> edgeResponseStatus 200, originResponseStatus 200
/          -> edgeResponseStatus 200, originResponseStatus 200
/robots.txt -> edgeResponseStatus 499, originResponseStatus 0
```

`499` means the client closed the connection. It is not a server/WAF `403`.

Also query for real `403`:

```graphql
filter: {
  datetime_geq: $datetime_geq
  datetime_leq: $datetime_leq
  clientRequestHTTPHost: "pixelpro.vivutrade.io.vn"
  edgeResponseStatus: 403
}
```

If this returns an empty list, Cloudflare did not serve a `403` in that period.

## Purge Cache

Purge these URLs after every Cloudflare or robots change:

```txt
https://pixelpro.vivutrade.io.vn/
https://pixelpro.vivutrade.io.vn/robots.txt
https://pixelpro.vivutrade.io.vn/preview.jpg
```

## Facebook Debugger Retest

Use a cache-busting URL:

```txt
https://pixelpro.vivutrade.io.vn/?v=YYYYMMDDHHmm
```

Click `Scrape Again` twice.

If preview metadata appears but the warning still says `403`, compare against Cloudflare logs. Trust Cloudflare analytics over stale Debugger UI.

## Final State From 2026-05-02 Incident

Confirmed:

```txt
Cloudflare Security Events: Meta requests allow/skip, no block/challenge
Cloudflare HTTP analytics: no 403 requests in the checked window
/robots.txt live: 200 OK, no-store, cf-cache-status BYPASS
/preview.jpg live: 200 OK
Facebook Debugger preview card: renders metadata and image
```

Conclusion:

```txt
The remaining 403 warning is most likely stale Meta Debugger state or an internal Meta scrape/cache artifact, not an active Cloudflare or origin block.
```
