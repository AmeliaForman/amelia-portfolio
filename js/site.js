/* Renders the whole site from content/projects.json. No build step. */

const IMG_BASE = "images/";
const PLACEHOLDER = "images/placeholder.svg";

async function loadContent() {
  const res = await fetch("content/projects.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Could not load content/projects.json");
  return res.json();
}

function coverSrc(p) {
  return IMG_BASE + p.slug + "/cover.jpg";
}

function withFallback(img) {
  img.addEventListener("error", () => { img.src = PLACEHOLDER; }, { once: true });
}

/* Text formatting for JSON content: **bold**, *italic*, \n = line break. */
function fmt(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/* ---------- Homepage: stacked cover feed ---------- */
function renderIndex(data) {
  const intro = document.querySelector(".intro");
  if (intro) {
    intro.querySelector("h1").innerHTML = fmt(data.site.intro || data.site.tagline);
  }

  const list = document.getElementById("project-index");

  data.projects.forEach((p, i) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "project.html?p=" + encodeURIComponent(p.slug);
    a.className = "feed-item";
    a.innerHTML =
      '<span class="feed-frame">' +
      '<img class="feed-cover" alt="" loading="' + (i === 0 ? "eager" : "lazy") + '">' +
      "</span>" +
      '<span class="feed-caption">' +
      '<span class="feed-title"></span>' +
      '<span class="feed-meta"></span>' +
      '<span class="feed-view">View Project</span>' +
      "</span>";
    const cover = a.querySelector(".feed-cover");
    cover.src = coverSrc(p);
    cover.alt = p.title;
    withFallback(cover);
    a.querySelector(".feed-title").textContent = p.title;
    a.querySelector(".feed-meta").textContent =
      [p.type, p.location, p.year].filter(Boolean).join(" · ");
    li.appendChild(a);
    list.appendChild(li);
  });
}

/* ---------- Project page ---------- */
function renderProject(data) {
  const slug = new URLSearchParams(location.search).get("p");
  const i = data.projects.findIndex((p) => p.slug === slug);
  const p = i >= 0 ? data.projects[i] : data.projects[0];

  document.title = p.title + " — " + data.site.name;
  document.getElementById("project-title").textContent = p.title;

  const facts = document.getElementById("project-facts");
  [["Location", p.location], ["Year", p.year], ["Type", p.type], ["Scope", p.scope]]
    .filter(([, v]) => v)
    .forEach(([k, v]) => {
      const d = document.createElement("div");
      const s = document.createElement("strong");
      s.textContent = k;
      d.appendChild(s);
      d.appendChild(document.createTextNode(v));
      facts.appendChild(d);
    });

  if (p.description && !/^PLACEHOLDER/.test(p.description)) {
    document.getElementById("project-desc").innerHTML = fmt(p.description);
  }

  const wrap = document.getElementById("project-images");
  (p.images || []).forEach((im) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = IMG_BASE + p.slug + "/" + im.file;
    img.alt = im.caption || p.title;
    img.loading = "lazy";
    withFallback(img);
    fig.appendChild(img);
    if (im.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = im.caption;
      fig.appendChild(cap);
    }
    wrap.appendChild(fig);
  });

  const prev = data.projects[(i - 1 + data.projects.length) % data.projects.length];
  const next = data.projects[(i + 1) % data.projects.length];
  document.getElementById("pager").innerHTML =
    '<a href="project.html?p=' + encodeURIComponent(prev.slug) + '"><span class="hint">Previous</span>' + esc(prev.title) + "</a>" +
    '<a class="next" href="project.html?p=' + encodeURIComponent(next.slug) + '"><span class="hint">Next</span>' + esc(next.title) + "</a>";
}

/* ---------- About page ---------- */
function renderAbout(data) {
  const body = document.getElementById("about-paragraphs");
  data.site.about.forEach((t) => {
    const el = document.createElement("p");
    el.innerHTML = fmt(t);
    body.appendChild(el);
  });
  const email = document.getElementById("contact-email");
  email.href = "mailto:" + data.site.email;
  email.textContent = data.site.email;
  const ig = document.getElementById("contact-instagram");
  if (data.site.instagram) ig.href = data.site.instagram; else ig.remove();
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

/* ---------- Boot ---------- */
loadContent()
  .then((data) => {
    document.querySelectorAll(".js-site-name").forEach((el) => {
      el.innerHTML = "";
      const parts = data.site.name.split(" ");
      el.appendChild(document.createTextNode(parts[0] + " "));
      const em = document.createElement("em");
      em.textContent = parts.slice(1).join(" ");
      el.appendChild(em);
    });
    const page = document.body.dataset.page;
    if (page === "index") renderIndex(data);
    if (page === "project") renderProject(data);
    if (page === "about") renderAbout(data);
    const yr = document.getElementById("footer-year");
    if (yr) yr.textContent = new Date().getFullYear();
  })
  .catch((err) => {
    console.error(err);
    document.body.insertAdjacentHTML(
      "beforeend",
      '<p style="padding:40px">Content failed to load. Check that content/projects.json is valid JSON.</p>'
    );
  });
