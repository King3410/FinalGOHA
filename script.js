// ─── Tab Switching ───────────────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".nav-links li").forEach((link) => {
    link.classList.remove("active");
  });

  const targetTab = document.getElementById(tabId);
  const targetNav = document.getElementById("nav-" + tabId);

  if (targetTab) targetTab.classList.add("active");
  if (targetNav) targetNav.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── About Us Content Switching ──────────────────────────────────────────────
function switchAboutInfo(tabId) {
  document.querySelectorAll(".about-sidebar div").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".about-text-pane").forEach((content) => {
    content.classList.remove("active");
  });

  const targetSidebar = document.getElementById("tab-" + tabId);
  const targetContent = document.getElementById("content-" + tabId);

  if (targetSidebar) targetSidebar.classList.add("active");
  if (targetContent) targetContent.classList.add("active");
}

// ─── Combined Smart Modal (Lightbox) ─────────────────────────────────────────
// Merged both of your openModal logic layers into one clean, adaptive handler
function openModal(imageSrc) {
  const imageModal = document.getElementById("imageModal");
  const imageLightbox = document.getElementById("imageLightbox");

  if (imageModal) {
    const modalImg = document.getElementById("modalImg");
    if (modalImg) modalImg.src = imageSrc;
    imageModal.style.display = "flex";
  }

  if (imageLightbox) {
    const lightboxImg = document.getElementById("lightboxImg");
    if (lightboxImg) lightboxImg.src = imageSrc;
    imageLightbox.style.display = "flex";
    document.body.style.overflow = "hidden"; // Lock background scrolling safely
  }
}

function closeModal(event) {
  const imageModal = document.getElementById("imageModal");
  const imageLightbox = document.getElementById("imageLightbox");

  // Handle imageModal events (if an event object is passed)
  if (imageModal && event && event.target) {
    if (
      event.target.classList.contains("modal") ||
      event.target.classList.contains("close-modal")
    ) {
      imageModal.style.display = "none";
    }
  }

  // Handle imageLightbox safely
  if (imageLightbox) {
    imageLightbox.style.display = "none";
    document.body.style.overflow = "auto"; // Re-enable background window scrolling
  }
}

// ─── FAQ Toggle ───────────────────────────────────────────────────────────────
function toggleFaq(element) {
  if (!element) return;
  const answer = element.querySelector(".faq-answer");
  if (!answer) return;

  // Toggle the active class on the clicked FAQ item
  element.classList.toggle("active");

  // Show or hide the answer based on the active state
  answer.style.display = element.classList.contains("active")
    ? "block"
    : "none";
}

// ─── Scrolling Logic (Glide, Drag, Hover, & Custom Arrow Scroll) ────────────
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".scroll-container").forEach((slider) => {
    // --- 1. Clone items for Infinite Loop ---
    const originalItems = Array.from(slider.children);
    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      slider.appendChild(clone);
    });

    // --- 2. Mouse Drag Scrolling ---
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.style.cursor = "grabbing";
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    const stopDragging = () => {
      isDown = false;
      slider.style.cursor = "grab";
    };

    slider.addEventListener("mouseleave", stopDragging);
    slider.addEventListener("mouseup", stopDragging);

    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    });

    // --- 3. Smooth Continuous Glide Logic ---
    let isHovered = false;
    let isPaused = false;
    let pauseTimeout;
    const glideSpeed = 1; // Standard idle gliding speed

    function glide() {
      // Only move if not hovered, not paused by an arrow click, and not dragged
      if (!isHovered && !isPaused && !isDown) {
        slider.scrollLeft += glideSpeed;

        const halfWidth = slider.scrollWidth / 2;
        if (slider.scrollLeft >= halfWidth) {
          slider.scrollLeft -= halfWidth;
        }
      }
      requestAnimationFrame(glide);
    }

    requestAnimationFrame(glide);

    // --- 4. Pause on Hover ---
    slider.addEventListener("mouseenter", () => {
      isHovered = true;
    });
    slider.addEventListener("mouseleave", () => {
      isHovered = false;
    });

    // --- 5. CUSTOM SMOOTH SCROLL FUNCTION ---
    function customSmoothScroll(element, distance, duration) {
      const startPos = element.scrollLeft;
      const startTime = performance.now();
      const halfWidth = element.scrollWidth / 2;

      // Handle seamless loop boundaries before translating positions
      if (startPos + distance < 0) {
        element.scrollLeft = startPos + halfWidth;
      } else if (startPos >= halfWidth) {
        element.scrollLeft = startPos - halfWidth;
      }

      const adjustedStartPos = element.scrollLeft;

      // "Ease In Out" math for a natural, gliding stop
      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      function animateScroll(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          element.scrollLeft = easeInOutQuad(
            elapsedTime,
            adjustedStartPos,
            distance,
            duration,
          );
          requestAnimationFrame(animateScroll);
        } else {
          element.scrollLeft = adjustedStartPos + distance; // Snap perfectly to the end
        }
      }
      requestAnimationFrame(animateScroll);
    }

    // --- 6. Arrow Interactions & 5-Second Pause ---
    const wrapper = slider.parentElement;
    if (wrapper) {
      const leftArrow = wrapper.querySelector(".left-arrow");
      const rightArrow = wrapper.querySelector(".right-arrow");

      function handleArrowClick(direction) {
        isPaused = true;

        // Move 400px over 800 milliseconds
        customSmoothScroll(slider, direction * 400, 800);

        clearTimeout(pauseTimeout);

        // Wait 5 seconds before waking the auto-glide back up
        pauseTimeout = setTimeout(() => {
          isPaused = false;
        }, 5000);
      }

      [leftArrow, rightArrow].forEach((arrow) => {
        if (arrow) {
          arrow.addEventListener("mouseenter", () => {
            isHovered = true;
          });
          arrow.addEventListener("mouseleave", () => {
            isHovered = false;
          });
        }
      });

      if (leftArrow) {
        leftArrow.addEventListener("click", () => handleArrowClick(-1));
      }

      if (rightArrow) {
        rightArrow.addEventListener("click", () => handleArrowClick(1));
      }
    }
  });
});

// ── Admissions Tab Switcher ──
function switchAdmTab(tab) {
  const panels = ["elementary", "preschool", "faqs"];
  panels.forEach((t) => {
    const panelEl = document.getElementById("panel-" + t);
    const heroEl = document.getElementById("hero-" + t);
    if (panelEl) panelEl.classList.remove("active");
    if (heroEl) heroEl.classList.remove("hero-active");
  });

  const targetPanel = document.getElementById("panel-" + tab);
  const targetHero = document.getElementById("hero-" + tab);
  if (targetPanel) targetPanel.classList.add("active");
  if (targetHero) targetHero.classList.add("hero-active");
}

// ── Refactored Unified Carousels (Hero & Left Banner) ──
// Cleaned up duplicate logic structures into a single declarative setup
const setupCarousel = ({
  trackSelector,
  slideSelector,
  dotsSelector,
  dotClass,
  interval,
}) => {
  const track = document.querySelector(trackSelector);
  const dotsContainer = document.querySelector(dotsSelector);
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll(slideSelector);
  let current = 0;
  let autoTimer;
  const dots = [];

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.classList.add(dotClass);
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  });

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), interval);
  }

  resetAuto();
};

// Fire up both carousels dynamically with their configurations
setupCarousel({
  trackSelector: ".hero-carousel-track",
  slideSelector: ".hero-slide",
  dotsSelector: ".hero-dots",
  dotClass: "hero-dot",
  interval: 5000,
});

setupCarousel({
  trackSelector: ".banner-track",
  slideSelector: "img",
  dotsSelector: ".banner-dots",
  dotClass: "banner-dot",
  interval: 4000,
});

// ── Horizontal Scroll Carousel Logic ──
function scrollCarousel(direction) {
  const wrapper = document.getElementById("brain-battle-carousel");
  if (!wrapper) return;

  const container = wrapper.querySelector(".scroll-container");
  if (!container) return;

  // Calculate movement jump based on visible window size dynamically
  const scrollAmount = container.clientWidth * 0.75;

  container.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth",
  });
}
