import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Wait until loading animation finishes before initializing
// all the GSAP logic
function checkIfLoaded(el, callback) {
  let isLoaded = false;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style") {
        if (Number(el.style.opacity) === 1 && !isLoaded) {
          isLoaded = true;
          if (typeof callback === "function") {
            callback();
            observer.disconnect();
          }
        }
      }
    });
  });

  const observerConfig = {
    attributes: true,
    attributeFilter: ["style"],
  };

  observer.observe(el, observerConfig);
}

// Link timelines to scroll position ==============================//
function createScrollTrigger(
  triggerElement,
  timeline,
  reverse,
  start,
  end,
  delay,
  audio,
  once,
  noOverlapping
) {
  // Play tl when scrolled into view (60% from top of screen)
  var shouldReverse = reverse || false;
  var triggerStart = start || "top 60%";
  var triggerEnd = end || null;
  var triggerDelay = Number(delay) || 0;
  ScrollTrigger.create({
    trigger: triggerElement,
    start: triggerStart,
    end: triggerEnd,
    preventOverlaps: noOverlapping || false,
    // markers: true,
    onEnter: (self) => {
      timeline.delay(triggerDelay).timeScale(1).play();
      if (once) {
        self.disable(false, true);
      }
    },
    onEnterBack: () => {
      if (shouldReverse) {
        timeline.timeScale(1).play();
      }
    },
    onLeave: (self) => {
      if (shouldReverse) {
        timeline.timeScale(2).reverse();
      }
    },
    onLeaveBack: () => {
      if (shouldReverse) {
        timeline.timeScale(2).reverse();
      }
    },
  });
}

export { checkIfLoaded, createScrollTrigger };
