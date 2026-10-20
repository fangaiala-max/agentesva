# Search appearance implementation — 19 October 2026

Implementation branch: `fix/schema-priority`, based on main `a53cbc01d1ad30fbfe56385cb9dabc4ce671abf7`. This document records local implementation and validation. Production deployment, Google validation of the updated HTML, indexing and actual search-result appearance are separate steps.

## Implemented in priority order

| Priority | Change | Coverage |
| --- | --- | --- |
| P1 | Individual resources declare a visible, crawlable branded cover as Product.image, use Brand, retain their actual offers and reject unreadable paid prices instead of silently declaring them free. | Three individual resources |
| P1 | The mixed free/paid library is a CollectionPage without a blanket free Product offer. | `/recurso/biblioteca-ia/` |
| P2 | Distinct descriptions reflect the tasks in each English prompt category; visible breadcrumbs and BreadcrumbList share one trail. | Seven prompt-library routes |
| P2 | English Course nodes and visible profiles identify the provider already present in the course source. | 16 course profiles |
| P3 | A single stable WebPage connects to the main entity and shared Organization/WebSite; duplicate commercial WebPage declarations are removed. | 12 commercial/process routes, plus shared catalog output |
| P3 | Publisher and global Organization share the current logo; the English builder declares its free WebApplication function. | Shared publisher graph and English builder |
| P3 | Complete bilingual buying guides include the existing visible editorial cover in Article.image alongside the social rendition; indexable articles opt into large image previews. | Six complete guides and shared article metadata |

The resource cover reuses the existing branded 1200 × 630 artwork. Guide artwork is reused at its existing size; this change does not create new image ratios.

## Validation

- Installed dependencies from the exact package lock in the isolated worktree.
- Unit suite: **553 tests passed across 63 files**.
- Production build and existing postbuild checks passed, including social images, bilingual output, SEO, buying guides, homepage behavior and Pagefind indexing.
- New compiled-output verifier: **82 checks passed**. It checks rendered Product images/offers, mixed-library semantics, unique descriptions, course providers, graph connections, builders and editorial imagery. It is part of `postbuild`.
- Regression proof: the initial verifier produced 65 failures against the unmodified baseline; the additional representative-guide-image assertions also failed before their fix. The final verifier strengthens offer checks against source data and requires the expected Service node count.
- Independent code review found no confirmed implementation blocker. Two weaknesses in the verifier were corrected and rerun.
- Browser review covered eight representative routes at 320, 390 and 1440 pixels. Resource images decoded, course-provider labels were visible, and the English builder produced the expected result with its Copy control enabled.
- One existing 320-pixel library overflow remains: both production and local output measure 388 pixels. The library's counter/grid sizing causes it; it was not introduced by this patch.

## Release checks still pending

Google Rich Results Test code-mode validation of the updated four resource pages and one course page requires permission to submit the unpublished built HTML to Google. Automatic approval review blocked that export, and explicit approval has been requested. The original audit's Google results describe the pre-fix production pages and are not evidence that these changes passed Google validation.

After merge/deployment, verify the deployed HTML/images, rerun representative Google URL tests and inspect Search Console. Local validation establishes implemented output, not indexing, Merchant policy eligibility, rich-result display or CTR improvement.

## Evidence-dependent work retained for later

- Software offers and review stars need verifiable plan/pricing and eligible review evidence; no guessed prices or ratings were added.
- Shipping and return information needs a real applicable policy; no physical-product policy was invented for digital resources.
- Existing useful FAQs and semantic lists remain. Unsupported rich-result formats were not promised.
- English editorial summaries remain clearly identified adaptations; they were not relabeled as complete articles with invented authors or dates.
