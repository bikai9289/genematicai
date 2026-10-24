# Public page and payment follow-up — 2026-10-24

This supersedes the FAQ eligibility discussion in the earlier audit. It documents source changes; publication and real external-service tests are separate acceptance steps.

| Review claim                                 | Verified finding / action                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FAQ rich results ended May 7, 2026           | Correct. Google's May 8 changelog states the effective date; June 15 removes the documentation. Previous advice citing only the 2023 restrictions was stale. Removed FAQPage markup from all three routes, retaining visible useful FAQs.                                                                           |
| Keywords removal was incomplete              | Correct: pricing, posts and portrait routes still had tags. Removed remaining tags.                                                                                                                                                                                                                                 |
| Empty sameAs / duplicated preload            | Confirmed. Empty sameAs removed; manual preload removed because the high-priority image already causes React to emit it. Logo cache-version query itself is not an SEO defect.                                                                                                                                      |
| Buy Now proves payments work                 | It proves the payment configuration switch is enabled, not successful authorization, webhook verification, fulfillment or bank settlement. No real card was charged by the agent.                                                                                                                                   |
| Resolution multipliers are newly implemented | They already existed in the charging function before the previous patch; that patch exposed the per-resolution comparison. The implementation remains 140 / 300 / 750 credits for Seedance 2.5, five seconds.                                                                                                       |
| The margin table proves no loss risk         | The table uses Starter's credit unit price and historical unverified supplier costs. Creator/Studio have different unit prices. Processing fees, refunds, retries, free credits, storage and tax are absent; it is not a confirmed net-margin or no-loss result.                                                    |
| Starter conversion wording                   | Removed duplicated zero-count/cannot-cover language and kept the 750-credit cost with an actionable Creator recommendation. Credits are pooled, not a tier gate; two Starter packs can also cover the example. Singular grammar fixed.                                                                              |
| Restore face swap capability                 | Actual source-video face replacement does not exist in the providers/routes. Per user decision, retained the URL, made it an operational portrait image-to-video page and corrected the brand; no unsupported capability was claimed.                                                                               |
| AggregateOffer                               | Added to pricing from the server catalog: low 9.99, high 49.99 USD, three offers. This is descriptive markup, not a promise of a Google rich result.                                                                                                                                                                |
| D1 transactions and tests                    | Confirmed unsafe interactive transaction usage and obsolete tests. Replaced payment/renewal/refund writes with guarded batches, restored the tested settlement entry point, and added rollback, provider binding, underpayment and concurrent recovery tests. Task terminal transitions and refunds are atomic too. |
| Upload screening / private access            | KIE's model rejection is not an independent upload-screening API. Per user decision, implemented Google SafeSearch and a new private R2 binding with owner reads and expiring provider grants. Explicit content/violence screening is narrower than CSAM, age or authorization checking.                            |

## Sources

- [Google documentation updates](https://developers.google.com/search/updates): May 8 and June 15, 2026 entries.
- [Cloud Vision requests](https://docs.cloud.google.com/vision/docs/request) and [SafeSearch](https://docs.cloud.google.com/vision/docs/detecting-safe-search).
- [Schema.org AggregateOffer](https://schema.org/AggregateOffer).
- [PayPal currency codes](https://developer.paypal.com/api/codes/currency/): HUF/JPY/TWD amounts have no fractions on the PayPal wire, distinct from the ledger unit contract.
- [Cloudflare private R2 access](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/).

## Acceptance boundaries

Verification completed locally:

- Cloudflare production build and full `tsc --noEmit` pass.
- 47 focused Vitest checks pass (screening failures, ownership, signature expiry/tampering, upload rejection, generation consent, currency handling and payment helpers).
- 24 SQLite settlement/credit/task checks, 13 real local D1 checks and 14 additional R2/refund/credit/pricing/provider-contract checks pass. Local R2 exercises the actual binding, including 200 full reads, 206 ranges and HEAD. Local preview uses a June 10 compatibility override because the installed workerd predates the pinned production compatibility date; production configuration is unchanged.
- Worker preview returns 200 for home, pricing, portrait tool and sitemap; malformed private-media keys return 404. Home has no FAQPage/sameAs; pricing has the catalog AggregateOffer and no zero-video warning. Eighteen browser viewport/theme combinations of home/pricing/portrait pages show one H1 and no horizontal overflow.
- Source security checks cover 51 changed/new source and documentation files with no findings. Local artifacts are outside this source scan and are not intended for commit.

No API key is stored in source control. Live SafeSearch acceptance needs the Google project API/billing and Worker Secret configured. Mocked tests establish fail-closed behavior and access boundaries, not real classifier accuracy. Real-card checkout remains a user-run acceptance step after deployment. The new private bucket was created without enabling public access; legacy public material was not deleted. Display assets were not invented or represented as newly verified model output.
