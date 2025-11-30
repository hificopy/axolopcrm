import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { CustomEase } from "gsap/CustomEase";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, CustomEase);

// Apple-style custom easing
try {
  CustomEase.create("apple-ease", "0.25, 0.46, 0.45, 0.94");
  CustomEase.create("apple-smooth", "0.4, 0, 0.2, 1");
} catch (e) {
  console.warn("CustomEase not available, using fallback");
}

/**
 * Apple-style animation utilities
 * Simple, seamless, and premium
 */

// Counter animation with scroll control
export const animateCounter = (element, endValue, options = {}) => {
  const {
    duration = 1.2,
    prefix = "",
    suffix = "",
    decimals = 0,
    onComplete = () => {},
  } = options;

  // Store original text to ensure symbols don't disappear
  const formatValue = (value) => {
    const formattedNumber =
      decimals > 0
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString();
    return `${prefix}${formattedNumber}${suffix}`;
  };

  // Set initial value
  element.textContent = formatValue(0);

  // Create object to tween
  const counter = { value: 0 };

  // Create ScrollTrigger for counter
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
    },
    onComplete,
  });

  // Quick, sleek counter animation from 0 to target
  tl.to(counter, {
    value: endValue,
    duration: duration,
    ease: "power2.out",
    onUpdate: function () {
      element.textContent = formatValue(counter.value);
    },
    onComplete: function () {
      // Ensure final value is exact
      element.textContent = formatValue(endValue);
    },
  });

  return tl;
};

// Apple-style scroll-controlled counter animation
export const createScrollControlledCounter = (
  element,
  endValue,
  options = {},
) => {
  const {
    duration = 3,
    prefix = "",
    suffix = "",
    decimals = 0,
    onComplete = () => {},
  } = options;

  let currentValue = 0;
  let animationComplete = false;
  let scrollTrigger = null;

  const startCounterAnimation = () => {
    if (animationComplete) return;

    // Phase 1: Scale up (0.3s)
    gsap.to(element, {
      scale: 1.15,
      duration: 0.3,
      ease: "apple-smooth",
    });

    // Phase 2: Counter animation (2.4s)
    const increment = endValue / (duration * 60); // 60fps
    const counterTl = gsap.timeline();

    counterTl.to(
      {},
      {
        duration: 2.4,
        ease: "apple-ease",
        onUpdate: function () {
          currentValue += increment;
          if (currentValue > endValue) currentValue = endValue;

          const displayValue =
            decimals > 0
              ? currentValue.toFixed(decimals)
              : Math.round(currentValue).toLocaleString();

          element.textContent = `${prefix}${displayValue}${suffix}`;
        },
      },
    );

    // Phase 3: Pulse effect (0.3s total)
    counterTl.to(element, {
      scale: 1.05,
      duration: 0.15,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        animationComplete = true;

        // 0.2s delay before scroll resume
        setTimeout(() => {
          if (scrollTrigger) {
            scrollTrigger.kill();
            ScrollTrigger.refresh();
          }
          onComplete();
        }, 200);
      },
    });
  };

  const handleScrollBack = () => {
    if (animationComplete) {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "apple-smooth",
      });
    }
  };

  // Create ScrollTrigger for pin and animation control
  scrollTrigger = ScrollTrigger.create({
    trigger: element,
    start: "top center",
    end: "bottom center",
    pin: true,
    pinSpacing: false,
    onEnter: startCounterAnimation,
    onLeaveBack: handleScrollBack,
    onEnterBack: handleScrollBack,
  });

  return () => {
    if (scrollTrigger) {
      scrollTrigger.kill();
    }
    gsap.killTweensOf(element);
  };
};

// Magnetic button effect
export const createMagneticButton = (button, options = {}) => {
  const { strength = 0.15 } = options;

  const handleMouseMove = (e) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(button, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "apple-smooth",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "apple-ease",
    });
  };

  button.addEventListener("mousemove", handleMouseMove);
  button.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    button.removeEventListener("mousemove", handleMouseMove);
    button.removeEventListener("mouseleave", handleMouseLeave);
  };
};

// Text reveal animation for section headers
export const revealText = (element, options = {}) => {
  const { delay = 0, stagger = 0.1 } = options;

  // Split text into words
  const text = element.textContent;
  const words = text.split(" ");

  element.innerHTML = words
    .map(
      (word, index) =>
        `<span style="display: inline-block; opacity: 0; transform: translateY(20px);">${word}</span>`,
    )
    .join(" ");

  const spans = element.querySelectorAll("span");

  gsap.to(spans, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: delay,
    stagger: stagger,
    ease: "apple-smooth",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  });

  return spans;
};

// Smooth section transitions
export const createSectionTransition = (sections) => {
  sections.forEach((section, index) => {
    if (index === 0) return; // Skip first section

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "top top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Fade out previous section
        if (sections[index - 1]) {
          gsap.to(sections[index - 1], {
            opacity: 1 - progress * 0.3,
            duration: 0,
          });
        }

        // Fade in current section
        gsap.to(section, {
          opacity: 0.7 + progress * 0.3,
          duration: 0,
        });
      },
    });
  });
};

// Gentle floating animation
export const createFloatingElement = (element, options = {}) => {
  const {
    amplitude = 5,
    duration = 3,
    rotation = 2,
    delay = Math.random() * 2,
  } = options;

  gsap.to(element, {
    y: `+=${amplitude}`,
    rotation: `+=${rotation}`,
    duration: duration,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    delay: delay,
  });

  return () => {
    gsap.killTweensOf(element);
  };
};

// Feature card hover effect
export const createFeatureCardHover = (card) => {
  const handleMouseEnter = () => {
    gsap.to(card, {
      y: -8,
      scale: 1.02,
      duration: 0.3,
      ease: "apple-smooth",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(card, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "apple-ease",
    });
  };

  card.addEventListener("mouseenter", handleMouseEnter);
  card.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    card.removeEventListener("mouseenter", handleMouseEnter);
    card.removeEventListener("mouseleave", handleMouseLeave);
  };
};

// Initialize all animations
export const initAppleAnimations = () => {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnimations);
  } else {
    initAnimations();
  }
};

const initAnimations = () => {
  // Initialize counters
  document.querySelectorAll("[data-counter]").forEach((element) => {
    const endValue = parseFloat(element.dataset.counter);
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";
    const decimals = parseInt(element.dataset.decimals) || 0;

    animateCounter(element, endValue, { prefix, suffix, decimals });
  });

  // Initialize magnetic buttons
  document.querySelectorAll("[data-magnetic]").forEach((button) => {
    createMagneticButton(button);
  });

  // Initialize text reveals
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    revealText(element);
  });

  // Initialize floating elements
  document.querySelectorAll("[data-float]").forEach((element) => {
    const amplitude = parseFloat(element.dataset.floatAmplitude) || 5;
    const duration = parseFloat(element.dataset.floatDuration) || 3;
    createFloatingElement(element, { amplitude, duration });
  });

  // Initialize feature cards
  document.querySelectorAll("[data-feature-card]").forEach((card) => {
    createFeatureCardHover(card);
  });

  // Initialize section transitions
  const sections = document.querySelectorAll("section");
  createSectionTransition(Array.from(sections));
};

export default {
  animateCounter,
  createScrollControlledCounter,
  createMagneticButton,
  revealText,
  createSectionTransition,
  createFloatingElement,
  createFeatureCardHover,
  initAppleAnimations,
};
