// Helpers
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* Mobile nav */
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link
  $$(".nav__link, .nav__cta", navMenu).forEach((a) => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    const isClickInside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!isClickInside) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* Scroll reveal */
const revealEls = $$(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

/* Gallery lightbox */
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxClose = $("#lightboxClose");

function openLightbox(src, alt = "") {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

const galleryGrid = $("#galleryGrid");
if (galleryGrid) {
  $$(".masonry__item", galleryGrid).forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full");
      const img = $("img", btn);
      openLightbox(src, img?.alt || "Gallery image");
    });
  });
}

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

/* Reviews slider */
const track = $("#reviewTrack");
const nextBtn = $("#nextReview");
const prevBtn = $("#prevReview");

function slideBy(dir = 1) {
  if (!track) return;
  const card = track.querySelector(".review");
  const step = (card?.getBoundingClientRect().width || 360) + 16;
  track.scrollBy({ left: dir * step, behavior: "smooth" });
}
nextBtn?.addEventListener("click", () => slideBy(1));
prevBtn?.addEventListener("click", () => slideBy(-1));

// Optional auto-advance (subtle)
let auto = null;
function startAuto() {
  if (!track) return;
  auto = setInterval(() => slideBy(1), 5500);
}
function stopAuto() {
  if (auto) clearInterval(auto);
}
track?.addEventListener("mouseenter", stopAuto);
track?.addEventListener("mouseleave", startAuto);
startAuto();

/* FAQ accordion */
const faqButtons = $$(".faq__q");
faqButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    // close others
    faqButtons.forEach((b) => {
      if (b !== btn) {
        b.setAttribute("aria-expanded", "false");
        const a = b.nextElementSibling;
        if (a) a.hidden = true;
      }
    });
    // toggle current
    btn.setAttribute("aria-expanded", String(!expanded));
    const answer = btn.nextElementSibling;
    if (answer) answer.hidden = expanded;
  });
});

/* Booking form — no backend:
   Opens a pre-filled Instagram message OR mailto fallback.
   Replace with real booking link later (Square/Calendly).
*/
const form = $("#bookingForm");
const formMsg = $("#formMsg");

function sanitize(v) {
  return String(v || "").replace(/[<>]/g, "").trim();
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = sanitize(data.get("name"));
    const phone = sanitize(data.get("phone"));
    const service = sanitize(data.get("service"));
    const location = sanitize(data.get("location"));
    const time = sanitize(data.get("time"));
    const notes = sanitize(data.get("notes"));

    if (!name || !phone || !service || !location || !time) {
      if (formMsg) formMsg.textContent = "Please complete required fields.";
      return;
    }

    const msg =
      `BOOKING REQUEST (HCuts)\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Service: ${service}\n` +
      `Location: ${location}\n` +
      `Preferred time: ${time}\n` +
      `Notes: ${notes || "—"}`;

    // Instagram DMs cannot be deep-linked reliably across all devices.
    // So we open Instagram profile and show the text for copy/paste.
    // If you later add WhatsApp/SMS link, replace this behavior.
    navigator.clipboard?.writeText(msg).catch(() => {});

    if (formMsg) {
      formMsg.textContent = "Copied request to clipboard. Opening Instagram — paste it into DM.";
    }

    window.open("https://www.instagram.com/hcutsbarber/", "_blank", "noopener,noreferrer");
    form.reset();
  });
}

/* Footer year */
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());
