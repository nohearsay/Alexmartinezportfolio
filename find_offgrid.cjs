// find_offgrid.cjs — find elements on /work/aura with 10px or 14px padding/gap
// Run: node find_offgrid.cjs <baseUrl> <outDir>
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const base = (process.argv[2] || 'http://127.0.0.1:4188').replace(/\/$/, '');
const out = process.argv[3] || 'S8c_shots';
fs.mkdirSync(out, { recursive: true });

const TARGET_VALUES = [10, 14];
const ROUTES = [['aura', '/work/aura']];
const VIEWS = [[1440, 900], [390, 844]];

async function main() {
  const browser = await chromium.launch();
  const allFindings = [];

  for (const [w, h] of VIEWS) {
    for (const [name, route] of ROUTES) {
      const key = `${name}_${w}`;
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.goto(base + route, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      const findings = await page.evaluate((targetVals) => {
        const vis = e => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return r.width > 1 && r.height > 1 &&
                 cs.visibility !== 'hidden' && cs.display !== 'none' &&
                 parseFloat(cs.opacity) > 0.05;
        };

        const getSelector = (el) => {
          let sel = el.tagName.toLowerCase();
          if (el.id) sel += '#' + el.id;
          if (el.className && typeof el.className === 'string' && el.className.trim()) {
            const classes = el.className.trim().split(/\s+/).filter(c => c);
            if (classes.length) sel += '.' + classes.join('.');
          }
          return sel;
        };

        const getMatchedRules = (el) => {
          const sheets = document.styleSheets;
          const matched = [];
          for (const sheet of sheets) {
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (!rules) continue;
              for (const rule of rules) {
                if (rule.type === 1 && rule.selectorText) { // STYLE_RULE
                  try {
                    if (el.matches(rule.selectorText)) {
                      matched.push({
                        selector: rule.selectorText,
                        cssText: rule.cssText
                      });
                    }
                  } catch (e) {}
                }
              }
            } catch (e) {}
          }
          return matched;
        };

        const results = [];
        const elements = document.querySelectorAll('main *');
        elements.forEach(el => {
          if (el.classList.contains('pin-spacer')) return;
          const cs = getComputedStyle(el);

          // Check padding
          ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].forEach(prop => {
            const val = parseFloat(cs[prop]);
            if (targetVals.includes(val)) {
              const rules = getMatchedRules(el);
              const paddingRules = rules.filter(r => r.cssText.includes('padding'));
              results.push({
                tag: el.tagName.toLowerCase(),
                classChain: el.className && typeof el.className === 'string' ? el.className.trim() : '',
                property: prop,
                value: val,
                selector: getSelector(el),
                matchedSelectors: paddingRules.map(r => r.selector),
                matchedCss: paddingRules.map(r => r.cssText)
              });
            }
          });

          // Check gaps
          if (cs.display.includes('flex') || cs.display.includes('grid')) {
            [cs.rowGap, cs.columnGap].forEach(gap => {
              if (gap && gap !== 'normal') {
                const val = parseFloat(gap);
                if (targetVals.includes(val)) {
                  const rules = getMatchedRules(el);
                  const gapRules = rules.filter(r => r.cssText.includes('gap'));
                  results.push({
                    tag: el.tagName.toLowerCase(),
                    classChain: el.className && typeof el.className === 'string' ? el.className.trim() : '',
                    property: gap === cs.rowGap ? 'rowGap' : 'columnGap',
                    value: val,
                    selector: getSelector(el),
                    matchedSelectors: gapRules.map(r => r.selector),
                    matchedCss: gapRules.map(r => r.cssText)
                  });
                }
              }
            });
          }
        });

        return results;
      }, TARGET_VALUES);

      findings.forEach(f => {
        allFindings.push({
          route: name,
          viewport: w,
          ...f
        });
      });

      await page.close();
    }
  }

  await browser.close();

  // Write findings
  const output = allFindings.map(f =>
    `${f.route}_${f.viewport}: ${f.tag}.${f.classChain} [${f.property}] = ${f.value}px\n  selector: ${f.selector}\n  matched: ${f.matchedSelectors.join(', ') || 'none'}\n  css: ${f.matchedCss.join(' | ') || 'none'}`
  ).join('\n\n');

  fs.writeFileSync(path.join(out, 'offgrid.txt'), output);
  console.log(output);
  console.log(`\nTotal findings: ${allFindings.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });