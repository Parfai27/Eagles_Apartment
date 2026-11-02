// ---- Site settings: fill these in when the details are ready ----
const CONFIG = {
  email: "info@eaglesapartment.com",
  phone: "+250 780 527 263",  // shows the phone line in Contact and footer
  whatsapp: "250780527263"    // digits only with country code; enables WhatsApp buttons
};

const PAGES = [
  { id: "home", href: "index.html", key: "nav.home" },
  { id: "apartments", href: "apartments.html", key: "nav.apartments" },
  { id: "amenities", href: "amenities.html", key: "nav.amenities" },
  { id: "gallery", href: "gallery.html", key: "nav.gallery" },
  { id: "location", href: "location.html", key: "nav.location" },
  { id: "contact", href: "contact.html", key: "nav.contact" }
];

const GALLERY = [
  { src: "rooftop-lounge", cat: "rooftop", alt: "Rooftop lounge with billiards table" },
  { src: "lake-view", cat: "rooftop", alt: "Lake Kivu from the building" },
  { src: "rooftop-terrace", cat: "rooftop", alt: "Rattan chairs on the rooftop" },
  { src: "rooftop-billiards", cat: "rooftop", alt: "Billiards lounge" },
  { src: "rooftop-corner", cat: "rooftop", alt: "Rooftop seating with lake view" },
  { src: "lake-view-2", cat: "rooftop", alt: "View over Goma and the lake" },
  { src: "living-a", cat: "living", alt: "Classic Grey living room" },
  { src: "living-b", cat: "living", alt: "Velvet living room" },
  { src: "living-c", cat: "living", alt: "Emerald living room" },
  { src: "dining-a-2", cat: "living", alt: "Classic Grey dining area" },
  { src: "dining-b", cat: "living", alt: "Velvet dining area" },
  { src: "dining-c", cat: "living", alt: "Emerald dining area" },
  { src: "living-c-2", cat: "living", alt: "Emerald lounge" },
  { src: "balcony", cat: "living", alt: "Balcony seating" },
  { src: "bedroom-a", cat: "bedroom", alt: "Bedroom with wooden bed" },
  { src: "bedroom-b", cat: "bedroom", alt: "Bedroom with wardrobe" },
  { src: "bedroom-c", cat: "bedroom", alt: "Bright bedroom" },
  { src: "bedroom-d", cat: "bedroom", alt: "Bedroom with brass wall lamps" },
  { src: "bedroom-detail", cat: "bedroom", alt: "Bedside details" },
  { src: "kitchen", cat: "kitchen", alt: "Fully equipped kitchen" },
  { src: "fridge", cat: "kitchen", alt: "Fridge with water dispenser" },
  { src: "shower", cat: "kitchen", alt: "Rain shower" },
  { src: "bathroom", cat: "kitchen", alt: "Bathroom with vessel sink" },
  { src: "building", cat: "building", alt: "Building exterior" },
  { src: "building-street", cat: "building", alt: "Building from the street" },
  { src: "courtyard", cat: "building", alt: "Gated entrance" },
  { src: "parking", cat: "building", alt: "Covered parking" },
  { src: "gym", cat: "building", alt: "Fitness room" },
  { src: "gym-2", cat: "building", alt: "Fitness equipment" },
  { src: "lift", cat: "building", alt: "Lift and marble staircase" },
  { src: "stairwell", cat: "building", alt: "Stairwell chandelier" }
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const page = document.body.dataset.page || "home";
const waLink = (text = "") => `https://wa.me/${CONFIG.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

const ICONS = {
  view: '<circle cx="12" cy="9" r="3.5"/><path d="M2 16c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>',
  billiards: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M11 12h2"/>',
  gym: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
  lift: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 10l3-3 3 3M9 14l3 3 3-3"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 010 6H9"/>',
  kitchen: '<path d="M4 11h16v3a6 6 0 01-6 6h-4a6 6 0 01-6-6v-3zM2 11h20M9 4c0 2 2 2 2 4M14 4c0 2 2 2 2 4"/>',
  shower: '<path d="M4 21V7a3 3 0 013-3h2a3 3 0 013 3M9 10h8M10 14v1M13 14v1M16 14v1M11 18v1M14 18v1"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  dining: '<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
  balcony: '<path d="M3 12h18M5 12v8M9 12v8M15 12v8M19 12v8M3 20h18M7 12V5a2 2 0 012-2h6a2 2 0 012 2v7"/>',
  safe: '<rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8v1M6 19v2M18 19v2"/>',
  wardrobe: '<rect x="5" y="2" width="14" height="20" rx="1.5"/><path d="M12 2v20M10 11v2M14 11v2"/>',
  bed: '<path d="M3 18V8M21 18v-5a3 3 0 00-3-3H10v8M3 14h18M6.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>',
  sofa: '<path d="M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3M2 13a2 2 0 014 0v2h12v-2a2 2 0 014 0v5H2v-5zM5 18v2M19 18v2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2z"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1.1L4 20z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2L9 9.5z"/>',
  plane: '<path d="M10.5 13.5L3 11l1.5-1.5 8 1 4-4a2 2 0 013 3l-4 4 1 8L15 23l-2.5-7.5L9 19v3l-1.5 1L6 19l-4-1.5L3 16h3z"/>',
  border: '<path d="M4 21V4M4 4h12l-2 4 2 4H4M20 21H2"/>',
  car: '<path d="M5 17h14v-5l-2-5H7l-2 5v5zM5 17v2M19 17v2M5 12h14"/><circle cx="8" cy="14.5" r="1"/><circle cx="16" cy="14.5" r="1"/>'
};

// ---- Shared header, footer and overlays ----
function renderLayout() {
  document.body.insertAdjacentHTML("afterbegin",
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${
      Object.entries(ICONS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${d}</symbol>`).join("")
    }</defs></svg>`);

  const navLinks = PAGES.map(p =>
    `<a href="${p.href}" data-i18n="${p.key}"${p.id === page ? ' aria-current="page"' : ""}>Home</a>`).join("");

  $("#site-header").outerHTML = `
  <a class="skip" href="#main" data-i18n="skip">Skip to content</a>
  <header class="header">
    <div class="container header__inner">
      <a href="index.html" class="brand" aria-label="Eagles Apartment">
        <img src="images/logo.svg" alt="" width="40" height="40">
        <span class="brand__text"><strong>EAGLES</strong><small>APARTMENT</small></span>
      </a>
      <nav class="nav" id="nav" aria-label="Main">${navLinks}</nav>
      <div class="header__actions">
        <div class="lang" role="group" aria-label="Language">
          <button type="button" data-lang="en">EN</button><button type="button" data-lang="fr">FR</button><button type="button" data-lang="sw">SW</button>
        </div>
        <a href="contact.html" class="btn btn--gold btn--sm header__cta" data-i18n="cta.book">Book your stay</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>`;

  const ctaBand = page === "contact" ? "" : `
  <section class="cta-band">
    <div class="container cta-band__inner">
      <div>
        <h2 data-i18n="ctaBand.title">Ready to stay in Goma?</h2>
        <p data-i18n="ctaBand.body">Send us your dates and we will reply with availability and prices.</p>
      </div>
      <div class="cta-band__actions">
        <a href="contact.html" class="btn btn--gold" data-i18n="cta.book">Book your stay</a>
        <a href="mailto:${CONFIG.email}" class="btn btn--ghost" data-i18n="ctaBand.email">Email us</a>
      </div>
    </div>
  </section>`;

  $("#site-footer").outerHTML = `${ctaBand}
  <footer class="footer">
    <div class="container footer__inner">
      <a href="index.html" class="brand brand--light">
        <img src="images/logo.svg" alt="" width="32" height="32">
        <span class="brand__text"><strong>EAGLES</strong><small>APARTMENT</small></span>
      </a>
      <nav class="footer__links" aria-label="Footer">${PAGES.map(p => `<a href="${p.href}" data-i18n="${p.key}"></a>`).join("")}</nav>
      <div class="footer__contact">
        <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
        ${CONFIG.phone ? `<a href="tel:${CONFIG.phone.replace(/\s/g, "")}">${CONFIG.phone}</a>` : ""}
      </div>
    </div>
    <div class="container footer__bottom">
      <p>© ${new Date().getFullYear()} Eagles Apartment · Grande Barrière, Goma. <span data-i18n="footer.rights">All rights reserved.</span></p>
    </div>
  </footer>
  <div class="mobile-bar"><a href="contact.html" class="btn btn--gold" data-i18n="cta.book">Book your stay</a></div>
  ${CONFIG.whatsapp ? `<a class="wa-float" href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg><use href="#i-whatsapp"/></svg></a>` : ""}
  <div class="lightbox" id="lightbox" hidden>
    <button class="lightbox__close" type="button" aria-label="Close">×</button>
    <button class="lightbox__nav lightbox__prev" type="button" aria-label="Previous">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lightbox__nav lightbox__next" type="button" aria-label="Next">›</button>
  </div>`;
}
renderLayout();

// ---- Language ----
let lang = "en";
const t = key => (I18N[lang] && I18N[lang][key]) || I18N.en[key] || "";

function setLang(next) {
  lang = I18N[next] ? next : "en";
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-lang]").forEach(b => b.classList.toggle("is-active", b.dataset.lang === lang));
  try { localStorage.setItem("lang", lang); } catch (e) {}
}

function initialLang() {
  try { const saved = localStorage.getItem("lang"); if (saved) return saved; } catch (e) {}
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return I18N[nav] ? nav : "en";
}

$$("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
setLang(initialLang());

// ---- Header behaviour ----
const header = $(".header"), mobileBar = $(".mobile-bar");
const heroEl = $(".hero, .page-hero");
const onScroll = () => {
  header.classList.toggle("is-solid", window.scrollY > 40 || !heroEl);
  mobileBar.classList.toggle("is-shown", window.scrollY > (heroEl ? heroEl.offsetHeight - 200 : 0));
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const toggle = $(".menu-toggle"), nav = $("#nav");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", open);
  nav.classList.toggle("is-open", open);
  if (open) header.classList.add("is-solid"); else onScroll();
});

// ---- Dates: no past dates, checkout after checkin ----
const today = new Date().toISOString().slice(0, 10);
function linkDates(form) {
  const ci = form.elements.checkin, co = form.elements.checkout;
  ci.min = today; co.min = today;
  ci.addEventListener("change", () => {
    co.min = ci.value || today;
    if (co.value && co.value <= ci.value) co.value = "";
  });
}

// Home hero search sends its values to the contact page
const quick = $("#quick-search");
if (quick) {
  linkDates(quick);
  quick.addEventListener("submit", e => {
    e.preventDefault();
    const q = new URLSearchParams({ checkin: quick.elements.checkin.value, checkout: quick.elements.checkout.value, guests: quick.elements.guests.value });
    location.href = "contact.html?" + q + "#enquiry";
  });
}

// ---- Enquiry form (contact page) ----
const enquiry = $("#enquiry");
if (enquiry) {
  linkDates(enquiry);
  const params = new URLSearchParams(location.search);
  ["checkin", "checkout", "guests", "apartment"].forEach(n => { if (params.get(n)) enquiry.elements[n].value = params.get(n); });
  if (params.toString()) enquiry.elements.name.focus({ preventScroll: true });

  if (CONFIG.phone) {
    const a = $("[data-phone-link]");
    a.textContent = CONFIG.phone;
    a.href = "tel:" + CONFIG.phone.replace(/\s/g, "");
    $("[data-phone]").hidden = false;
  }
  if (CONFIG.whatsapp) $("[data-whatsapp]").hidden = false;

  enquiry.addEventListener("submit", e => {
    e.preventDefault();
    const f = enquiry.elements, err = $("#form-error");
    if (!f.name.value.trim() || !f.checkin.value || !f.checkout.value) { err.hidden = false; return; }
    err.hidden = true;

    const lines = [
      t("mail.hello"), "",
      `${t("form.name")}: ${f.name.value.trim()}`,
      f.phone.value && `${t("form.phone")}: ${f.phone.value}`,
      f.email.value && `${t("form.email")}: ${f.email.value}`,
      `${t("form.checkin")}: ${f.checkin.value}`,
      `${t("form.checkout")}: ${f.checkout.value}`,
      `${t("form.guests")}: ${f.guests.value}`,
      `${t("form.apartment")}: ${f.apartment.value || t("form.any")}`,
      f.message.value.trim() && `\n${f.message.value.trim()}`
    ].filter(Boolean).join("\n");

    if (e.submitter && e.submitter.value === "whatsapp" && CONFIG.whatsapp) {
      window.open(waLink(lines), "_blank", "noopener");
    } else {
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(t("mail.subject"))}&body=${encodeURIComponent(lines)}`;
    }
  });
}

// ---- Apartment card sliders ----
$$("[data-slider]").forEach(box => {
  const imgs = $$("img", box);
  let i = 0;
  const dots = document.createElement("div");
  dots.className = "card__dots";
  imgs.forEach((_, n) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Photo ${n + 1}`);
    b.addEventListener("click", e => { e.preventDefault(); show(n); });
    dots.append(b);
  });
  box.append(dots);
  function show(n) {
    i = n;
    imgs.forEach((im, k) => im.classList.toggle("is-on", k === i));
    $$("button", dots).forEach((d, k) => d.classList.toggle("is-on", k === i));
  }
  show(0);
  let timer;
  box.addEventListener("mouseenter", () => { timer = setInterval(() => show((i + 1) % imgs.length), 1400); });
  box.addEventListener("mouseleave", () => clearInterval(timer));
});

// ---- Home hero slideshow ----
const slidesBox = $("[data-hero-slides]");
if (slidesBox) {
  const slides = $$("img", slidesBox), dotsBox = $("[data-hero-dots]");
  const SLIDE_MS = 6000;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0, timer;
  dotsBox.style.setProperty("--slide-ms", SLIDE_MS + "ms");
  // Load the other photos only after the page has finished loading
  window.addEventListener("load", () => slides.forEach(img => {
    if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute("data-srcset"); }
  }));
  slides.forEach((_, n) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Photo ${n + 1}`);
    b.addEventListener("click", () => { go(n); restart(); });
    dotsBox.append(b);
  });
  const dots = $$("button", dotsBox);
  function go(n) {
    const img = slides[n];
    if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute("data-srcset"); }
    slides[cur].classList.remove("is-active");
    cur = n;
    // restart the zoom on the incoming slide
    img.classList.remove("is-active"); void img.offsetWidth; img.classList.add("is-active");
    dots.forEach((d, k) => {
      d.classList.remove("is-on");
      if (k === cur) { void d.offsetWidth; d.classList.add("is-on"); }
    });
  }
  function restart() {
    clearInterval(timer);
    if (!still) timer = setInterval(() => go((cur + 1) % slides.length), SLIDE_MS);
  }
  if (still) dotsBox.classList.add("is-paused");
  go(0); restart();
}

// ---- Gallery page ----
const grid = $("#gallery-grid");
if (grid) {
  grid.innerHTML = GALLERY.map(g =>
    `<button type="button" data-cat="${g.cat}" data-zoom="images/${g.src}.webp"><img src="images/${g.src}-sm.webp" alt="${g.alt}" loading="lazy"></button>`
  ).join("");
  $$(".filters button").forEach(btn => btn.addEventListener("click", () => {
    $$(".filters button").forEach(b => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    $$("button", grid).forEach(it => { it.hidden = f !== "all" && it.dataset.cat !== f; });
  }));
}

// ---- Lightbox: any [data-zoom] element, grouped by its [data-zoom-group] container ----
const lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb);
let set = [], pos = 0;
function showLb() {
  const el = set[pos], img = el.tagName === "IMG" ? el : $("img", el);
  lbImg.src = el.dataset.zoom; lbImg.alt = img.alt; lbCap.textContent = img.alt;
}
function openLb(el) {
  const group = el.closest("[data-zoom-group]") || document;
  set = $$("[data-zoom]", group).filter(x => !x.hidden);
  pos = set.indexOf(el);
  showLb();
  lb.hidden = false; document.body.style.overflow = "hidden";
}
function step(d) { pos = (pos + d + set.length) % set.length; showLb(); }
function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
document.addEventListener("click", e => {
  const z = e.target.closest("[data-zoom]");
  if (z) { e.preventDefault(); openLb(z); }
});
$(".lightbox__close").addEventListener("click", closeLb);
$(".lightbox__prev").addEventListener("click", () => step(-1));
$(".lightbox__next").addEventListener("click", () => step(1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

// ---- Reveal on scroll ----
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
}), { threshold: .12 });
$$(".section__head, .card, .tile, .amenities li, .steps li, .split > *, .apt-detail > *, .mosaic, .get-card, .feature__body").forEach(el => {
  el.classList.add("reveal"); io.observe(el);
});
