// ==============================
// scripts.js — Web Zarpada (con Supabase integrado)
// ==============================

// ===== CONFIGURACIÓN DE SUPABASE =====
const SUPABASE_URL = 'https://fmsysdjqcliuwjesilam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtc3lzZGpxY2xpdXdqZXNpbGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDYzNTYsImV4cCI6MjA3MDg4MjM1Nn0.PJpuqtAAnP5396wzP-g4Bh2tFs_NWjJ6YgyQiTVcx5w';

const supabaseCliente = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ===== FUNCIÓN PARA CARGAR PROYECTOS DEL PORTFOLIO =====
async function cargarProyectos() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return; // Si no está el contenedor, no hacemos nada

    const { data, error } = await supabaseCliente
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar proyectos:', error);
        portfolioGrid.innerHTML = '<p>Error al cargar los proyectos. Intenta de nuevo más tarde.</p>';
        return;
    }

    if (data.length === 0) {
        portfolioGrid.innerHTML = '<p>Aún no hay proyectos para mostrar. ¡Vuelve pronto!</p>';
        return;
    }

    // Generamos el HTML para cada proyecto y lo insertamos
    portfolioGrid.innerHTML = data.map(proyecto => {
        // Creamos los tags dinámicamente
        const tagsHTML = proyecto.tags.map(tag => `<span class="portfolio-card__tag">${tag}</span>`).join('');

        // Usamos la estructura de tu card original
        return `
            <article class="portfolio-card" data-aos="fade-up">
                <div class="portfolio-card__image">
                    ${proyecto.url_imagen ? `<img src="${proyecto.url_imagen}" alt="${proyecto.titulo}" style="width:100%; height:100%; object-fit:cover;">` : `
                    <div class="portfolio-card__mockup">
                        <div class="portfolio-card__mockup-header">
                            <div class="portfolio-card__mockup-dot"></div>
                            <div class="portfolio-card__mockup-dot"></div>
                            <div class="portfolio-card__mockup-dot"></div>
                        </div>
                        <div class="portfolio-card__mockup-content">
                            <div class="portfolio-card__mockup-line"></div>
                            <div class="portfolio-card__mockup-line portfolio-card__mockup-line--short"></div>
                        </div>
                    </div>`}
                </div>
                <div class="portfolio-card__content">
                    <h3 class="portfolio-card__title">${proyecto.titulo}</h3>
                    <p class="portfolio-card__description">${proyecto.descripcion}</p>
                    <div class="portfolio-card__tags">
                        ${tagsHTML}
                    </div>
                    <a href="${proyecto.url_sitio}" class="portfolio-card__link" target="_blank" rel="noopener">
                        Ver proyecto
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            </article>
        `;
    }).join('');
}


// ===== TU CÓDIGO ORIGINAL EMPIEZA AQUÍ =====

// Polyfill liviano para requestIdleCallback (no bloquea)
(() => {
  if (!("requestIdleCallback" in window)) {
    window.requestIdleCallback = (cb) => setTimeout(() => cb({ timeRemaining: () => 0 }), 1);
  }
})();

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  // LLAMAMOS A LA FUNCIÓN PARA CARGAR PROYECTOS CUANDO LA PÁGINA ESTÉ LISTA
  cargarProyectos();

  // Initialize AOS (con guardas y config estable)
  const AOS = window.AOS;
  if (AOS && typeof AOS.init === "function") {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true,
      offset: 100,
      disable: window.matchMedia("(max-width: 767px)").matches ? "mobile" : false
    });
  }

  // Core features primero (rápidos)
  initMobileMenu();
  initScrollEffects();
  initWhatsAppFloat();
  initSmoothScroll();

  // Diferir lo no crítico al idle (libera main thread)
  requestIdleCallback(() => {
    initModalHandlers();
    initCounterAnimations();
    initLazyLoading();
    initPerformanceOptimizations();
    initSEOEnhancements();
  });

  // Loading screen si lo usás
  requestIdleCallback(showLoadingScreen);

  console.log("🚀 Web Zarpada - Website loaded successfully");
});

// ===== LOADING SCREEN =====
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) return;

  // Hide loading screen after content is loaded
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
    document.body.classList.add("loaded");

    if (window.AOS && typeof window.AOS.refresh === "function") {
      window.AOS.refresh();
    }
  }, 1200);
}

// ===== COUNTER ANIMATIONS =====
function initCounterAnimations() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animateCounter = (counter) => {
    const target = Number.parseInt(counter.getAttribute("data-count"), 10) || 0;
    const duration = 2000;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    let current = 0;

    const update = () => {
      current += step;
      if (current < target) {
        counter.textContent = current;
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    };
    update();
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5, rootMargin: "0px 0px -50px 0px" }
  );

  counters.forEach((el) => counterObserver.observe(el));
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navClose = document.getElementById("nav-close");
  const navLinks = document.querySelectorAll(".nav__link");

  if (!navMenu) return;

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.add("show-menu");
      document.body.style.overflow = "hidden";
    });
  }

  if (navClose) {
    navClose.addEventListener("click", () => {
      navMenu.classList.remove("show-menu");
      document.body.style.overflow = "auto";
    });
  }

  if (navLinks.length) {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show-menu");
        document.body.style.overflow = "auto";
      });
    });
  }

  // Close menu with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("show-menu")) {
      navMenu.classList.remove("show-menu");
      document.body.style.overflow = "auto";
    }
  });
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  const header = document.getElementById("header");
  if (!header) return;

  const onScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 50) {
      // usar style minimal para evitar layout thrash
      header.style.cssText = "background:rgba(255,255,255,.98);box-shadow:0 1px 3px 0 rgb(0 0 0 / 0.1)";
    } else {
      header.style.cssText = "background:rgba(255,255,255,.95);box-shadow:none";
    }
  };

  onScroll(); // estado inicial
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ===== WHATSAPP FLOATING BUTTON =====
function initWhatsAppFloat() {
  const whatsappFloat = document.getElementById("whatsapp-float");
  if (!whatsappFloat) return;
  whatsappFloat.style.opacity = "1";
  whatsappFloat.style.visibility = "visible";
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  const header = document.getElementById("header");
  const headerHeight = header ? header.offsetHeight : 0;

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length < 2) return; // href="#"
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      e.preventDefault();
      const rect = targetSection.getBoundingClientRect();
      const targetPosition = window.scrollY + rect.top - headerHeight - 20;

      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    });
  });
}

// ===== MODAL HANDLERS =====
function initModalHandlers() {
  // Close modal with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeWhatsAppModal();
  });

  // Close modal when clicking outside
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("whatsapp-modal");
    if (modal && e.target === modal) closeWhatsAppModal();
  }, { passive: true });
}

// ===== WHATSAPP FUNCTIONS =====
function openWhatsApp() {
  contactMatias();
}

function closeWhatsAppModal() {
  const modal = document.getElementById("whatsapp-modal");
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

function contactMatias() {
  const base = "https://wa.me/59892014535";
  const message = encodeURIComponent(
    "¡Hola Matías! Vi tu portfolio de páginas web y me parece genial lo que haces. Soy [tu nombre] y me gustaría charlar sobre un proyecto web. ¿Tenés tiempo para una consulta?"
  );
  const whatsappUrl = `${base}?text=${message}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

// ===== SCROLL TO SECTION =====
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const header = document.getElementById("header");
  const headerHeight = header ? header.offsetHeight : 0;
  const rect = section.getBoundingClientRect();
  const targetPosition = window.scrollY + rect.top - headerHeight - 20;

  window.scrollTo({ top: targetPosition, behavior: "smooth" });
}

// ===== PRICING CONTACT FUNCTIONS =====
function contactPlan(planName) {
  const messages = {
    "Landing Simple - $30":
      '🚀 ¡Hola Matías! Me interesa el plan "Landing Simple" de $30 para mi página web. ¿Podemos charlar sobre mi proyecto?',
    "Sitio Completo - $60":
      '⚡ ¡Buenas Matías! El plan "Sitio Completo" de $60 es justo lo que necesito para mi sitio web. ¿Cuándo podemos arrancar?',
    "Proyecto Premium - $100":
      "🔥 ¡Hola Matías! Quiero hacer algo único con el plan Premium de $100 para mi página web. ¿Hablamos de mi idea?"
  };

  const message = encodeURIComponent(
    messages[planName] || `¡Hola Matías! Me interesa el plan "${planName}" para mi página web. ¿Charlamos?`
  );
  const whatsappUrl = `https://wa.me/59892014535?text=${message}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

// ===== LAZY LOADING =====
function initLazyLoading() {
  // nativo: asegura atributos en <img> normales
  document.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
  });

  // IO para data-src / data-srcset
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const img = entry.target;
          const src = img.getAttribute("data-src");
          const srcset = img.getAttribute("data-srcset");

          if (srcset) img.srcset = srcset;
          if (src) img.src = src;

          img.classList.add("loaded");
          img.classList.remove("lazy");
          obs.unobserve(img);
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    document.querySelectorAll("img[data-src], img[data-srcset]").forEach((img) => io.observe(img));
  }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function initPerformanceOptimizations() {
  // Preload critical local resources (mejor local que absoluto)
  const criticalImages = ["/logo.avif"];
  criticalImages.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    document.head.appendChild(link);
  });

  // Optimize animations for low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.documentElement.style.setProperty("--transition-fast", "0.1s ease-out");
    document.documentElement.style.setProperty("--transition-normal", "0.2s ease-out");
  }

  // Respeta usuarios con reduce motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.style.setProperty("--transition-fast", "0s");
    document.documentElement.style.setProperty("--transition-normal", "0s");
  }
}

// ===== ANALYTICS & TRACKING =====
function trackEvent(eventName, properties = {}) {
  const eventData = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: location.href,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    referrer: document.referrer
  };

  // Consola para debug
  console.log(`📊 Event: ${eventName}`, eventData);

  // GA4 si existe
  if (window.gtag) window.gtag("event", eventName, eventData);

  // FB Pixel si existe
  if (window.fbq) window.fbq("track", eventName, eventData);
}

// Enhanced interaction tracking (delegación + pasivo)
document.addEventListener("click", (e) => {
  const pc = e.target.closest(".portfolio-card");
  if (pc) {
    const t = pc.querySelector(".portfolio-card__title");
    trackEvent("portfolio_card_click", { portfolio: t ? t.textContent : "unknown" });
  }

  const sc = e.target.closest(".service-card");
  if (sc) {
    const t = sc.querySelector(".service-card__title");
    trackEvent("service_card_click", { service: t ? t.textContent : "unknown" });
  }

  const btn = e.target.closest(".btn");
  if (btn) {
    const text = btn.textContent ? btn.textContent.trim() : "button";
    trackEvent("button_click", { button: text });
  }

  const sh = e.target.closest(".showcase-card");
  if (sh) {
    const t = sh.querySelector(".showcase-card__title");
    trackEvent("showcase_design_click", { design: t ? t.textContent : "unknown" });
  }
}, { passive: true });

// ===== ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("❌ JavaScript Error:", e.error);
  trackEvent("javascript_error", {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    stack: e.error?.stack
  });
});

// ===== DEVICE DETECTION =====
function isMobile() { return window.innerWidth <= 768; }
function isTablet() { return window.innerWidth > 768 && window.innerWidth <= 1024; }
function isTouch() { return "ontouchstart" in window || navigator.maxTouchPoints > 0; }

// ===== UTILITY FUNCTIONS =====
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// throttle real (no era igual que debounce)
function throttle(fn, wait) {
  let last = 0, timeout, pendingArgs;
  const later = () => {
    last = Date.now();
    timeout = null;
    fn(...pendingArgs);
  };
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    pendingArgs = args;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      last = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
  };
}

// ===== PAGE LOAD OPTIMIZATION =====
window.addEventListener("load", () => {
  document.body.classList.add("loaded");

  const loadTime = performance.now();
  trackEvent("page_loaded", {
    loadTime: Math.round(loadTime),
    userAgent: navigator.userAgent,
    connection: navigator.connection?.effectiveType || "unknown"
  });

  // Initialize non-critical features after load
  setTimeout(() => {
    initEnhancedAnimations();
    createParticles();
    initScrollProgress();
  }, 700);
});

// ===== NOTIFICATIONS =====
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1"};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    z-index: 3000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    font-weight: 500;
    max-width: 300px;
    font-size: 14px;
    word-wrap: break-word;
  `;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 300);
  }, 4000);
}

// ===== ENHANCED ANIMATIONS =====
function initEnhancedAnimations() {
  // Portfolio cards
  document.querySelectorAll(".portfolio-card").forEach((card) => {
    if (isTouch()) return;
    card.addEventListener("mouseenter", () => { card.style.transform = "translateY(-8px) scale(1.02)"; });
    card.addEventListener("mouseleave", () => { card.style.transform = "translateY(0) scale(1)"; });
  });

  // Service cards
  document.querySelectorAll(".service-card").forEach((card) => {
    if (isTouch()) return;
    const icon = card.querySelector(".service-card__icon");
    if (!icon) return;
    card.addEventListener("mouseenter", () => { icon.style.transform = "scale(1.1) rotate(5deg)"; });
    card.addEventListener("mouseleave", () => { icon.style.transform = "scale(1) rotate(0deg)"; });
  });

  // Showcase cards
  document.querySelectorAll(".showcase-card").forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector(".showcase-card__title");
      showNotification(`Diseño "${title ? title.textContent : "Desconocido"}" - ¡Contactanos para más información sobre páginas web!`, "info");
      trackEvent("showcase_card_click", { design: title ? title.textContent : "unknown" });
    });
  });
}

// ===== EPIC PARTICLE SYSTEM =====
function createParticles() {
  const particlesContainer = document.querySelector(".hero__particles");
  if (!particlesContainer || isMobile() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const maxParticles = 10;
  let particleCount = 0;

  const createParticle = () => {
    if (particleCount >= maxParticles) return;

    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = Math.random() * 10 + 15 + "s";
    particle.style.animationDelay = "0s";

    const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    particlesContainer.appendChild(particle);
    particleCount++;

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
        particleCount--;
      }
    }, 25000);
  };

  setInterval(createParticle, 3000);
}

// ===== SCROLL PROGRESS INDICATOR =====
function initScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    z-index: 9999;
    transition: width 0.1s ease;
    will-change: width;
  `;
  document.body.appendChild(progressBar);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const docHeight = (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      progressBar.style.width = scrollPercent + "%";
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ===== PERFORMANCE MONITORING =====
if ("performance" in window) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const paints = performance.getEntriesByType("paint");
      const fp = paints.find((p) => p.name === "first-paint")?.startTime || 0;

      if (nav) {
        trackEvent("performance_metrics", {
          loadTime: Math.round(nav.loadEventEnd - nav.loadEventStart),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart),
          firstPaint: Math.round(fp),
          connection: navigator.connection?.effectiveType || "unknown"
        });
      }
    }, 0);
  });
}

// ===== SEO & ACCESSIBILITY ENHANCEMENTS =====
function initSEOEnhancements() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  const titles = {
    inicio: "Web Zarpada - Páginas Web Profesionales en Uruguay",
    portfolio: "Portfolio - Proyectos de Páginas Web | Web Zarpada",
    servicios: "Servicios de Desarrollo Web | Web Zarpada Uruguay",
    precios: "Precios de Páginas Web | Web Zarpada Uruguay",
    nosotros: "Sobre Nosotros - Desarrollador Web | Web Zarpada",
    contacto: "Contacto - Desarrollador Web Uruguay | Web Zarpada"
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (titles[id]) document.title = titles[id];
    });
  }, { threshold: 0.5 });

  sections.forEach((s) => obs.observe(s));

  // Links externos seguros
  document.querySelectorAll('a[target="_blank"]').forEach((a) => {
    if (!a.rel || !a.rel.includes("noopener")) {
      a.rel = (a.rel ? a.rel + " " : "") + "noopener";
    }
  });
}

// ===== FINAL INITIALIZATION (compat) =====
document.addEventListener("DOMContentLoaded", () => {
  // Si otro código dependía de este timeout, se mantiene
  setTimeout(() => { initSEOEnhancements(); }, 2000);
});

// ===== CONSOLE BRANDING =====
console.log(`
🔥 MATÍAS - WEB ZARPADA
💻 Portfolio personal optimizado
📱 Responsive design profesional
⚡ Performance optimizada
🎨 Diseño que impacta
💰 Precios accesibles
🚀 100% funcional
🇺🇾 Hecho con ❤️ en Uruguay

¿Querés una página web profesional? ¡Hablemos!
WhatsApp: 092 014 535
Email: webzarpada@gmail.com
`);