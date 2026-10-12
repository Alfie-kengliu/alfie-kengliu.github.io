# Portfolio Prototype v0.2

The static site in `dist/` is the source for both the local working preview and the public GitHub Pages site at [alfie-kengliu.github.io](https://alfie-kengliu.github.io/). The older private hosted preview remains a separate snapshot.

## Content maintenance

Edit website copy directly in the relevant HTML file under `dist/`, then check it in the local preview. Project evidence and design rules are kept in the separate local workspace, outside this website repository. There is no Markdown build pipeline.

- Financial Adventure contains a full English rewrite of the original portfolio text. Reported metrics retain attribution; verification notes are kept in the local workspace's content inventory.
- Cube N and Exploration of Motor share the Interactive Exhibits page.
- About combines the original exhibition background with confirmed banking and AI product experience.
- Financial Adventure uses supplied images and six videos. The feedback questionnaire remains a placeholder; one reflection image and one unclassified video remain unmapped. Interactive Exhibits uses two side-by-side hero loops, one Cube N story animation, and a 2×2 motor interaction grid with two images and two animations. These videos play silently without controls only while sufficiently visible; reduced-motion visitors receive static posters. Other project media and the About portrait retain their placeholder status.
- The Resume links open the supplied PDF in a new tab.

## Local preview

From this repository's root, run `python3 -m http.server 4180 --bind 127.0.0.1 --directory dist`, then open `http://127.0.0.1:4180/`.

Validate locally before publishing. Only update a hosted site at an agreed milestone or when Alfie explicitly requests it.

Aspekta uses the SIL OFL 1.1; its license is in `dist/assets/fonts/LICENSE.txt`.

## GitHub publishing

This repository contains the website only. Its entry point is `dist/index.html`; all page HTML, shared CSS/JavaScript, fonts, images, and videos used by the site must be included when preparing the first GitHub commit. The surrounding workspace's `docs/`, `archive/`, `tools/`, and other working materials are not part of this repository.

Before publishing a milestone, review the rights and confidentiality of project images/videos, draft or placeholder labels, and claims that still need verification. The tracked `.openai/hosting.json` belongs to the existing private preview and is not a GitHub Pages configuration.

GitHub Pages deploys only `dist/` through `.github/workflows/deploy-pages.yml`. The workflow uses `workflow_dispatch`, so routine pushes do not update the public site. Run **Deploy portfolio to GitHub Pages** manually from the repository's Actions tab only after the milestone has been approved.


## Content migration validation — 2026-09-24

- At the time of migration, checked 38 text blocks against the then-current Markdown drafts, including metadata, and verified unique IDs, one H1 per page, all 10 Financial Adventure reading-menu targets, media IDs, and local links. The drafts are now archived.
- Inspected the migrated pages at 1440 × 1000 and 390 × 844; no horizontal overflow was detected. Checked the updated homepage card at mobile size.
- Tested the expanded reading menu and its jump to Visitor response, the About → Work navigation, and the homepage → Interactive Exhibits link.
- Remaining content gaps: metrics need source definitions and sample details; the handheld device model and text embedded only in old images require confirmation. All image assets remain placeholders.
