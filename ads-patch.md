# cx: ad slot on the game detail screen

Four small edits to your `index.html`, then two new files in the repo root.
Nothing in your game data changes.

The slot ships in **preview mode**: a dashed 300x250 box where the ad will go,
so you can check the layout today with no AdSense account. Going live later is
one config edit (see Step 3).

---

## Step 1: paste into `index.html`

### 1a. CSS (paste just above `</style>`)

```css
/* ============================================================
   AD SLOT: detail screen, right column on desktop,
   below the platform chips on mobile
   ============================================================ */
.detail .body{max-width:none}
.detail-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:32px;align-items:start}
.detail-main{min-width:0;max-width:640px}
.ad-col{width:100%;max-width:340px}
.ad-col[hidden]{display:none}
.ad-label{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-4);margin:0 0 8px}
.ad-box{min-height:250px;border-radius:var(--r-md);overflow:hidden;background:var(--surface);
  border:1px solid var(--line);display:grid;place-items:center}
.ad-box.preview{border-style:dashed;color:var(--ink-3);font-size:13px;line-height:1.5;text-align:center;padding:24px}
.ad-box ins.adsbygoogle{display:block;width:100%}
/* an unfilled or blocked ad takes its whole column with it; no empty box */
.ad-col:has(ins[data-ad-status="unfilled"]){display:none}
@media (min-width:900px){
  .detail-grid{grid-template-columns:minmax(0,1fr) 340px;gap:48px}
  .ad-col{position:sticky;top:24px}
}
```

### 1b. HTML: replace the whole `<div class="body">…</div>` block inside `#detail`

Find this:

```html
  <div class="body">
    <p id="detailDesc"></p>
    <div class="actions">
      ...
    </div>
    <div class="platforms" id="detailPlatforms"></div>
  </div>
```

Replace it with this (same elements and ids, just wrapped, plus the ad column):

```html
  <div class="body">
    <div class="detail-grid">
      <div class="detail-main">
        <p id="detailDesc"></p>
        <div class="actions">
          <button class="btn play" id="detailPlay"><svg class="ico"><use href="#i-play"/></svg>Play</button>
          <button class="btn ghost" id="detailFav"><svg class="ico"><use href="#i-heart"/></svg>Favorite</button>
          <button class="btn ghost" id="detailList"><svg class="ico"><use href="#i-plus"/></svg>Add to playlist</button>
        </div>
        <div class="platforms" id="detailPlatforms"></div>
      </div>
      <aside class="ad-col" id="adCol" hidden>
        <div class="ad-label">Advertisement</div>
        <div class="ad-box" id="adBox"></div>
      </aside>
    </div>
  </div>
```

### 1c. JavaScript (paste directly above the `/* ... boot ... */` block, right before `initTheme();`)

```js
/* ============================================================
   ads: one slot on the game detail screen.
   mode "off"     -> nothing shown
   mode "preview" -> dashed placeholder, no network requests (default)
   mode "live"    -> real AdSense unit, created fresh on every open
                     (an <ins> can only be filled once) and removed on close
   If the ad is unfilled or blocked (ad blockers, school filters), the
   whole column hides itself, so there's never an empty box.
   ============================================================ */
const ADS = {
  mode: "preview",
  client: "ca-pub-XXXXXXXXXXXXXXXX",   // your AdSense publisher ID
  slot: "0000000000",                  // your display ad unit's slot ID
  test: true                           // true = Google test ads (no earnings). Set false at launch.
};

const Ads = (() => {
  const col = $("#adCol"), box = $("#adBox");
  let isOpen = false, pushTimer = null, watchdog = null, scriptBad = false, statusWatch = null;

  function hide(){ col.hidden = true; }
  function clear(){
    clearTimeout(pushTimer); clearTimeout(watchdog);
    if (statusWatch){ statusWatch.disconnect(); statusWatch = null; }
    box.innerHTML = ""; box.classList.remove("preview");
  }
  function ensureScript(){
    // skip if you already pasted the AdSense snippet into <head>
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
    const s = document.createElement("script");
    s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ADS.client);
    s.onerror = () => { scriptBad = true; hide(); };
    document.head.appendChild(s);
  }
  function mount(){
    if (isOpen) return;
    isOpen = true; clear();
    if (ADS.mode === "off"){ hide(); return; }
    col.hidden = false;

    if (ADS.mode === "preview"){
      box.classList.add("preview");
      box.textContent = "Ad preview \u00b7 300\u00d7250. A live ad appears here once AdSense is connected.";
      return;
    }
    if (scriptBad || ADS.client.indexOf("XXXX") !== -1){ hide(); return; }

    ensureScript();
    // wait for the open animation so the slot has settled before it's filled
    pushTimer = setTimeout(() => {
      if (!isOpen) return;
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle"; ins.style.display = "block";
      ins.dataset.adClient = ADS.client;
      ins.dataset.adSlot = ADS.slot;
      ins.dataset.adFormat = "auto";
      ins.dataset.fullWidthResponsive = "true";
      if (ADS.test) ins.dataset.adtest = "on";
      box.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
      catch (e){ hide(); return; }

      statusWatch = new MutationObserver(() => { if (ins.dataset.adStatus === "unfilled") hide(); });
      statusWatch.observe(ins, { attributes:true, attributeFilter:["data-ad-status"] });
      // blocked or never rendered: collapse instead of leaving a hole
      watchdog = setTimeout(() => { if (isOpen && ins.offsetHeight < 20) hide(); }, 4000);
    }, 600);
  }
  function unmount(){ isOpen = false; clear(); }
  return { mount, unmount };
})();

new MutationObserver(() => {
  $("#detail").classList.contains("on") ? Ads.mount() : Ads.unmount();
}).observe($("#detail"), { attributes:true, attributeFilter:["class"] });
```

This hooks the detail screen's own `on` class, so you don't have to edit
`openDetail`, `closeDetail`, or the back-button handler.

### 1d. Footer link (find and replace)

In your footer, add a privacy link:

```html
<span>cx — a bessagoncc website - ©2026 dsco publishings - ©2026 iconicc games. <a href="privacy.html" style="text-decoration:underline">Privacy</a></span>
```

---

## Step 2: add two files to the repo root (next to `index.html`)

- `ads.txt` (attached). Because your repo is `cxshelf.github.io`, it will be
  served at `https://cxshelf.github.io/ads.txt`, which is where AdSense looks.
  Replace the `pub-XXXXXXXXXXXXXXXX` placeholder after you have an account.
- `privacy.html` (attached). Replace `your-email@example.com`.

---

## Step 3: when you have an AdSense account

1. **Add the site** in AdSense, then paste their verification snippet into
   `<head>` of `index.html` exactly as given:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
2. Wait for approval (days to a few weeks).
3. In AdSense: **Ads → By ad unit → Display ads**, create one unit and copy its slot ID.
4. Edit the `ADS` block:
   ```js
   mode: "live",
   client: "ca-pub-YOURS",
   slot: "YOURSLOTID",
   test: true      // look at it with test ads first, then set to false
   ```
5. In AdSense, **turn Auto ads OFF** for the site. Otherwise Google can place ads
   anywhere, including right next to the Play button, which is a policy violation.
6. In AdSense **Privacy & messaging**, enable the EU/UK consent message (free).
7. Update `ads.txt` with your real `pub-` ID (no `ca-` prefix).
