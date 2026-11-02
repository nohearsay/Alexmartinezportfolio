PASS
S4_P8C: AURA spacing CSS only
- P8 block appended to src/index.css scoped to .page[data-brand="aura"]
- Section padding-top: 96px (was 100.8px at 1440px)
- H1 font-size: 36px (was 46.8px at 1440px and 390px)
- NOVA values unchanged (section 100.8px, h1 46.8px at 390px)
- FLESH values unchanged (section 96px, h1 56px at 1440px; h1 36px at 390px)
- npx tsc --noEmit: exit 0
- npm run lint: exit 0
- git diff --no-index _archive/src_bak_p8_1927/index.css src/index.css shows ONLY the appended /* P8 */ block
- Verified with dev server on :5199 and playwright

Verification steps completed successfully.