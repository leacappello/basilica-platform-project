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
  // Salta i link che hanno solo "#" o non sono validi
  if (id && id !== "#" && id.startsWith("#") && id.length > 1) {
    const section = document.querySelector(id);
    if (section) sectionsMap.set(section, link);
  }
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

/* 4) CAROUSEL HERO ------------------------------------------------------------------------------------------------------
   Sistema di scorrimento immagini con transizioni fluide
   - Autoplay ogni 7 secondi con pausa su hover
   - Controlli manuali (frecce prev/next)
   - Transizioni con fade e movimento orizzontale
   --------------------------------------------------------------------------*/
document.addEventListener('DOMContentLoaded', function() {
  // Elementi DOM del carousel
  const slides = Array.from(document.querySelectorAll(".hero__slide"));
  const btnNext = document.querySelector(".hero__ctrl.next");
  const btnPrev = document.querySelector(".hero__ctrl.prev");
  const slidesContainer = document.querySelector(".hero__slides");
  
  // Esci se non ci sono slide
  if (!slides.length) return;
  
  // Variabili di stato del carousel
  let currentIndex = 0;        // Slide attualmente visibile
  let isTransitioning = false; // Previene transizioni multiple simultanee
  let timer;                   // Timer autoplay

  /**
   * Gestisce la transizione tra slide con effetto fade e movimento
   * @param {number} targetIndex - Indice della slide di destinazione
   * @param {string} direction - Direzione: 'next' (da destra) o 'prev' (da sinistra)
   */
  function showSlide(targetIndex, direction = 'next') {
    // Blocca se già in transizione o stessa slide
    if (isTransitioning || targetIndex === currentIndex) return;
    
    isTransitioning = true;
    const currentSlide = slides[currentIndex];
    const targetSlide = slides[targetIndex];

    // Ottieni elementi di testo per animazioni sincronizzate
    const currentTexts = currentSlide.querySelectorAll('h1, .pill');
    const targetTexts = targetSlide.querySelectorAll('h1, .pill');

    // Prima fase: fade-out dei testi della slide corrente
    currentTexts.forEach(text => {
      text.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      text.style.opacity = '0';
      text.style.transform = 'translateY(-10px)';
    });

    // Dopo 150ms, inizia la transizione delle slide
    setTimeout(() => {
      // Rimuovi classe attiva da tutte le slide
      slides.forEach(slide => slide.classList.remove('is-active'));
      
      // Posiziona la nuova slide fuori schermo
      targetSlide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
      targetSlide.style.opacity = '0';
      targetSlide.classList.add('is-active');

      // Prepara i testi della nuova slide (invisibili inizialmente)
      targetTexts.forEach(text => {
        text.style.transition = 'none';
        text.style.opacity = '0';
        text.style.transform = 'translateY(20px)';
      });

      // Anima l'entrata della nuova slide e l'uscita di quella corrente
      requestAnimationFrame(() => {
        // Nuova slide: entra al centro con fade-in
        targetSlide.style.transform = 'translateX(0)';
        targetSlide.style.opacity = '1';
        
        // Slide corrente: esce dal lato opposto con fade-out
        currentSlide.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
        currentSlide.style.opacity = '0';

        // Dopo 400ms, anima i testi della nuova slide
        setTimeout(() => {
          targetTexts.forEach((text, index) => {
            text.style.transition = 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out';
            text.style.transitionDelay = `${0.2 + (index * 0.2)}s`;
            text.style.opacity = '1';
            text.style.transform = 'translateY(0)';
          });
        }, 400);
      });
    }, 150);

    // Cleanup dopo la transizione completa (1200ms totali)
    setTimeout(() => {
      // Reset stili inline per tornare al CSS base
      slides.forEach(slide => {
        slide.style.transform = '';
        slide.style.opacity = '';
        const texts = slide.querySelectorAll('h1, .pill');
        texts.forEach(text => {
          text.style.transition = '';
          text.style.opacity = '';
          text.style.transform = '';
          text.style.transitionDelay = '';
        });
      });
      
      // Aggiorna stato
      currentIndex = targetIndex;
      isTransitioning = false;
    }, 1200);
  }

  /**
   * Passa alla slide successiva (movimento circolare)
   */
  function next() {
    showSlide((currentIndex + 1) % slides.length, 'next');
  }

  /**
   * Passa alla slide precedente (movimento circolare)
   */
  function prev() {
    showSlide((currentIndex - 1 + slides.length) % slides.length, 'prev');
  }

  // Event listeners per controlli manuali
  if (btnNext) btnNext.addEventListener("click", (e) => { e.preventDefault(); next(); });
  if (btnPrev) btnPrev.addEventListener("click", (e) => { e.preventDefault(); prev(); });

  // Inizializza autoplay
  timer = setInterval(next, 7000);

  // Autoplay con pausa su hover del mouse
  if (slidesContainer) {
    slidesContainer.addEventListener("mouseenter", () => clearInterval(timer));
    slidesContainer.addEventListener("mouseleave", () => timer = setInterval(next, 7000));
  }

  // Supporto touch/swipe per dispositivi mobili
  let startX = 0;
  if (slidesContainer) {
    // Registra posizione iniziale del touch
    slidesContainer.addEventListener("touchstart", (e) => startX = e.touches[0].clientX, { passive: true });
    
    // Gestisce fine touch e determina direzione swipe
    slidesContainer.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      // Soglia minima 50px per swipe valido
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    }, { passive: true });
  }

  // Debug: log per verificare che tutto sia caricato
  console.log('Carousel initialized:', slides.length, 'slides found');
});
