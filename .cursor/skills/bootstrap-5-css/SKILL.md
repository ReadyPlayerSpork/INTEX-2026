---
name: bootstrap-5-css
description: Implements layouts and styling with Bootstrap 5.3 using official documentation—grid, containers, spacing and display utilities, typography, forms, tables, helpers, and CSS variables. Aligns Vite setups with Bootstrap’s official Vite guide (Sass import, optional JS plugins). Use when adding or refactoring Bootstrap markup or CSS in Vite projects, choosing utility classes vs custom rules, responsive breakpoints, or when the user mentions Bootstrap 5, BS5, or getbootstrap.com.
---

# Bootstrap 5.3 CSS implementation

## Authority and version

Treat **[Bootstrap 5.3 docs](https://getbootstrap.com/docs/5.3/getting-started/introduction/)** as the source of truth for class names, behavior, and examples. Prefer **5.3** APIs; do not reuse Bootstrap 4 patterns. For this repo, **`bootstrap` is pinned to 5.3.x** in `frontend/Haven for Her/package.json`—keep examples and MDX paths aligned with that release (e.g. tag **v5.3.8** on GitHub).

## Documentation sources (site vs GitHub MDX)

- **Published site** (tables, live examples): [getbootstrap.com/docs/5.3/](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- **AI-friendly source**: The same documentation lives as **MDX** in the Bootstrap repo under **[`site/src/content/docs` (tag v5.3.8)](https://github.com/twbs/bootstrap/tree/v5.3.8/site/src/content/docs)**. Top-level folders mirror the docs (`getting-started`, `layout`, `components`, `forms`, `utilities`, `helpers`, `content`, `customize`, `extend`, `about`). When implementing or verifying markup, **read the corresponding `.mdx` files** from that tree—they are plain text, easier to quote and search than rendered HTML. Raw file URL pattern:

  `https://raw.githubusercontent.com/twbs/bootstrap/v5.3.8/site/src/content/docs/<section>/<page>.mdx`

  If the patch version advances, update the tag to match `package.json`’s `bootstrap` version.

## Coexistence with `frontend-design` (Anthropic skill)

If **`frontend-design`** is also enabled, it may suggest bold typography and non-default aesthetics. **Do not** treat that as permission to bypass Bootstrap’s documented markup, grid, or accessibility. Implement distinctive visuals **through** Bootstrap: Sass variables/CSS variables, utility classes, optional custom fonts, and scoped overrides—rather than abandoning Bootstrap for bespoke layout systems.

## Quick workflow

1. **Confirm setup**: HTML5 doctype, viewport meta, and global `box-sizing` expectations (Reboot). See [Important globals](https://getbootstrap.com/docs/5.3/getting-started/introduction/#important-globals) in the introduction.
2. **Layout first**: [Containers](https://getbootstrap.com/docs/5.3/layout/containers/) → [Grid](https://getbootstrap.com/docs/5.3/layout/grid/) → [Breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/) (`sm`, `md`, `lg`, `xl`, `xxl`).
3. **Prefer utilities** over bespoke CSS: [Spacing](https://getbootstrap.com/docs/5.3/utilities/spacing/), [Flex](https://getbootstrap.com/docs/5.3/utilities/flex/), [Display](https://getbootstrap.com/docs/5.3/utilities/display/), [Text](https://getbootstrap.com/docs/5.3/utilities/text/), [Colors](https://getbootstrap.com/docs/5.3/utilities/colors/), [Borders](https://getbootstrap.com/docs/5.3/utilities/borders/), [Shadows](https://getbootstrap.com/docs/5.3/utilities/shadows/).
4. **Components**: Use documented markup and classes from the [Components](https://getbootstrap.com/docs/5.3/components/accordion/) section; match examples to avoid broken styling.
5. **Customization**: Prefer [CSS variables](https://getbootstrap.com/docs/5.3/customize/css-variables/) and [Sass customization](https://getbootstrap.com/docs/5.3/customize/sass/) when the design system needs tuning instead of fighting defaults with deep overrides.

## Vite (official setup)

Follow **[Bootstrap and Vite](https://getbootstrap.com/docs/5.3/getting-started/vite/)** as the default way to wire Bootstrap in Vite projects.

### Dependencies

- `bootstrap` (runtime).
- `@popperjs/core` alongside Bootstrap **unless** the UI will not use dropdowns, popovers, or tooltips (the guide allows omitting Popper in that case).
- `sass` as a **devDependency** so Vite can compile Bootstrap’s source Sass.

Install (same as [Bootstrap and Vite — Setup](https://getbootstrap.com/docs/5.3/getting-started/vite/#setup); skip `vite` if the project already has it):

```bash
npm i --save bootstrap @popperjs/core
npm i --save-dev sass
```

### CSS via Sass (recommended in the guide)

1. Add a stylesheet (e.g. `src/scss/styles.scss`) that pulls in Bootstrap’s Sass bundle:

```scss
@import "bootstrap/scss/bootstrap";
```

2. In the app entry (e.g. `src/main.tsx` / `src/main.js`), import that file **once**:

```ts
import "./scss/styles.scss";
```

For partial imports and customization, use Bootstrap’s [Sass import](https://getbootstrap.com/docs/5.3/customize/sass/) docs instead of importing everything.

### JavaScript plugins

- **All plugins**: `import * as bootstrap from "bootstrap"` in the same entry (Popper is resolved through Bootstrap as in the guide).
- **Subset** (smaller bundle), per the same page: e.g. `import Alert from "bootstrap/js/dist/alert"` or `import { Tooltip, Toast, Popover } from "bootstrap"`.

Components that need JS are listed under [Introduction — JS components](https://getbootstrap.com/docs/5.3/getting-started/introduction/#js-components); see also [JavaScript](https://getbootstrap.com/docs/5.3/getting-started/javascript/).

### `vite.config` notes

The guide’s sample sets `root`, `build.outDir`, and `server.port` to match a `src/`-centric layout; adapt paths to the repo’s actual Vite layout. Optional: `css.preprocessorOptions.scss.silenceDeprecations` for Dart Sass deprecation noise when compiling Bootstrap—safe to use per the guide; it does not block compilation.

### Alternative (not the guide’s primary path)

Prebuilt CSS only: `import "bootstrap/dist/css/bootstrap.min.css"` in the entry still works, but prefer the **Sass + `@import "bootstrap/scss/bootstrap"`** flow from [Bootstrap and Vite](https://getbootstrap.com/docs/5.3/getting-started/vite/) when setting up or extending theming.

### CDN / static HTML

When not using the Vite/npm pipeline, use [Introduction — CDN links](https://getbootstrap.com/docs/5.3/getting-started/introduction/#cdn-links) and keep `integrity` / `crossorigin` aligned with the documented file version.

## Implementation rules

- Use **semantic structure** from the docs (e.g. `navbar` + `container-fluid`, `card` + `card-body`); missing wrapper classes often cause “broken” Bootstrap.
- Use **responsive modifiers** consistently (`col-md-6`, `d-none d-md-block`, `text-lg-start`).
- For **forms**, follow [Forms overview](https://getbootstrap.com/docs/5.3/forms/overview/) and validation patterns from [Validation](https://getbootstrap.com/docs/5.3/forms/validation/) when applicable.
- If a third-party widget misbehaves after adding Bootstrap, check **box-sizing** overrides ([Introduction — Box-sizing](https://getbootstrap.com/docs/5.3/getting-started/introduction/#box-sizing)).

## Additional resources

- Curated links to major doc sections: [reference.md](reference.md)
