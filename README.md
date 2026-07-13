# Christian Hillman — Personal Website

Personal website for Christian Hillman: digital marketing and web professional working with
[Oxsome](https://oxsome.com) (web design & AI marketing) and
[Launch Media](https://wearelaunchmedia.com) (programmatic advertising).

## Structure

```
index.html      — single-page site (hero, about, services, experience, process, contact)
css/style.css   — all styling (dark theme, responsive, scroll animations)
js/main.js      — mobile nav + scroll-reveal + footer year
```

No build step and no dependencies — it's plain HTML/CSS/JS. Open `index.html` in a browser
or host it anywhere static files are served.

## Publish with GitHub Pages

1. Go to the repository's **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**.
3. Pick the `main` branch, `/ (root)` folder, and save.
4. The site will be live at `https://<username>.github.io/<repo>/` in a minute or two.

## Editing content

Everything lives in `index.html` — update the text in the About, What I Do, and Experience
sections directly. Colors and fonts are defined as CSS variables at the top of `css/style.css`.
