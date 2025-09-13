/* ==========================================================================
   SCRIPT PRINCIPALE — Basilica Twin
   - Anno corrente nel footer
   - Menu mobile accessibile (aria-expanded + data-open)
   - Evidenziazione link attivo durante scroll (IntersectionObserver)
   - Chiusura menu mobile al click su voce e con tasto ESC
   - Mini carousel hero (autoplay + prev/next + pausa on-hover)
   ========================================================================== */

/* 1) Anno corrente nel footer ------------------------------------------------*/
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* 2) Menu mobile: toggle + accessibilità -----------------------------------*/
const menuBtn = document.getElementById("menu-button");
const primaryNav = document.getElementById("primary-nav");

if (menuBtn && primaryNav) {
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    primaryNav.setAttribute("data-open", String(!open));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menuBtn.setAttribute("aria-expanded", "false");
      primaryNav.setAttribute("data-open", "false");
    }
  });

  primaryNav.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      if (menuBtn.getAttribute("aria-expanded") === "true") {
        menuBtn.setAttribute("aria-expanded", "false");
        primaryNav.setAttribute("data-open", "false");
      }
    });
  });
}

/* 3) Evidenziazione link attivo durante lo scroll ---------------------------*/
const nav = document.getElementById("primary-nav");
const navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
const sectionsMap = new Map();

navLinks.forEach((link) => {
  const id = link.getAttribute("href");
  const section = id ? document.querySelector(id) : null;
  if (section) sectionsMap.set(section, link);
});

function setActiveLink(sectionEl) {
  navLinks.forEach((a) => a.removeAttribute("aria-current"));
  const link = sectionsMap.get(sectionEl);
  if (link) link.setAttribute("aria-current", "page");
}

if ("IntersectionObserver" in window && sectionsMap.size) {
  const io = new IntersectionObserver(
    (entries) => {
      let best = null;
      for (const e of entries) {
        if (e.isIntersecting) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
      }
      if (best) setActiveLink(best.target);
    },
    {
      root: null,
      rootMargin: "-35% 0px -35% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }
  );
  sectionsMap.forEach((_l, section) => io.observe(section));
}

window.addEventListener("hashchange", () => {
  const current = document.querySelector(location.hash);
  if (current && sectionsMap.has(current)) setActiveLink(current);
});

document.addEventListener("DOMContentLoaded", () => {
  const current = document.querySelector(location.hash);
  if (current && sectionsMap.has(current)) setActiveLink(current);
});

/* 4) Mini carousel Hero -----------------------------------------------------*/
(function () {
  const slides = Array.from(document.querySelectorAll(".hero__slide"));
  if (!slides.length) return;

  let i = 0;
  const show = (idx) => {
    slides.forEach((s) => s.classList.remove("is-active"));
    slides[idx].classList.add("is-active");
  };
  const next = () => { i = (i + 1) % slides.length; show(i); };
  const prev = () => { i = (i - 1 + slides.length) % slides.length; show(i); };

  const btnNext = document.querySelector(".hero__ctrl.next");
  const btnPrev = document.querySelector(".hero__ctrl.prev");
  btnNext && btnNext.addEventListener("click", next);
  btnPrev && btnPrev.addEventListener("click", prev);

  let timer = setInterval(next, 7000);
  const slidesWrap = document.querySelector(".hero__slides");
  if (slidesWrap) {
    slidesWrap.addEventListener("mouseenter", () => clearInterval(timer));
    slidesWrap.addEventListener("mouseleave", () => (timer = setInterval(next, 7000)));
  }
})();
