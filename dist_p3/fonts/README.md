# Self-hosted Inter variable font (real file, not a placeholder)

`InterVariable.woff2` is copied unmodified from the npm package
`@fontsource-variable/inter` (`files/inter-latin-standard-normal.woff2`), which
repackages the upstream https://github.com/rsms/inter release. SIL Open Font
License 1.1 — full text in `Inter-OFL-LICENSE.txt`. No paid assets involved.

- Axes present: `opsz` (14-32) and `wght` (100-900).
- Subset: latin (`U+0000-00FF` and friends — see the `unicode-range` in
  `src/index.css`). `é` in "Martínez" is covered; `←` (U+2190) is not and falls
  back to the system UI font.
- Inter v4 ships no `wdth` or `slnt` axis, so those two parts of the hero
  `fontVariationSettings` animation are inert; only `wght` animates.

Refresh with:

    npm i -D @fontsource-variable/inter
    cp node_modules/@fontsource-variable/inter/files/inter-latin-standard-normal.woff2 public/fonts/InterVariable.woff2
    cp node_modules/@fontsource-variable/inter/LICENSE public/fonts/Inter-OFL-LICENSE.txt

`index.html` preloads `/fonts/InterVariable.woff2`; the matching `@font-face`
lives at the top of `src/index.css`.