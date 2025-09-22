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

// === MAIN MEDIA: lightbox per galleria ===
(function(){
  const galleryImages = Array.from(document.querySelectorAll('[data-gallery]'));

  function ensureLightbox() {
    let lb = document.querySelector('.lightbox');
    if (lb) return lb;
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role','dialog');
    lb.setAttribute('aria-modal','true');
    lb.innerHTML = `
      <div class="lb-inner" tabindex="0">
        <button class="lb-close" aria-label="Chiudi lightbox">&times;</button>
        <button class="lb-nav lb-prev" aria-label="Immagine precedente">&#10094;</button>
        <img alt="" />
        <button class="lb-nav lb-next" aria-label="Immagine successiva">&#10095;</button>
      </div>`;
    document.body.appendChild(lb);
    return lb;
  }

  const lb = ensureLightbox();
  const lbImg = lb.querySelector('img');
  let currentIndex = -1;
  let currentGallery = null;

  function openLightbox(index, galleryName) {
    const items = galleryImages.filter(i => i.dataset.gallery === galleryName);
    currentIndex = index;
    currentGallery = galleryName;
    const src = items[index].getAttribute('src');
    const alt = items[index].alt || '';
    lbImg.src = src;
    lbImg.alt = alt;
    lb.classList.add('open');
    lb.querySelector('.lb-inner').focus();
  }

  function closeLightbox() {
    lb.classList.remove('open');
    lbImg.src = '';
    currentIndex = -1;
    currentGallery = null;
  }

  function showNext(delta) {
    const items = galleryImages.filter(i => i.dataset.gallery === currentGallery);
    if (!items.length) return;
    currentIndex = (currentIndex + delta + items.length) % items.length;
    lbImg.src = items[currentIndex].getAttribute('src');
    lbImg.alt = items[currentIndex].alt || '';
  }

  galleryImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const galleryName = img.dataset.gallery;
      const items = galleryImages.filter(i => i.dataset.gallery === galleryName);
      const idx = items.indexOf(img);
      openLightbox(idx, galleryName);
    });
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        img.click();
      }
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  lb.querySelector('.lb-prev').addEventListener('click', () => showNext(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => showNext(1));

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showNext(-1);
    if (e.key === 'ArrowRight') showNext(1);
  });
})();
// === END MAIN MEDIA ===
