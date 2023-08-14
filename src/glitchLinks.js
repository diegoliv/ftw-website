import { gsap } from "gsap";

// glitch effect for footer links ====================================== //
export default function initGlitchLinks(transitionCallback) {
  const links = gsap.utils.toArray("[glitch-link]");

  links.forEach((link) => {
    const el = link.querySelector("[glitch-el]");
    const altEl = link.querySelector("[glitch-el-alt]");
    const inner = link.querySelector("[glitch-wrapper]");
    const elInner = `
      <div class="slice top-left"></div>
      <div class="slice bottom-left"></div>
      <div class="slice top-right"></div>
      <div class="slice bottom-right"></div>`;
    inner.innerHTML = elInner;

    const slices = inner.querySelectorAll("div");
    slices.forEach((slice) => {
      slice.appendChild(el.cloneNode(true));
      if (altEl) {
        slice.appendChild(altEl.cloneNode(true));
      }
    });

    if (el.hasAttribute("glitch-sizer")) {
      el.classList.add("invisible");
      inner.appendChild(el);
    }

    const els = link.querySelectorAll("[glitch-el]");
    const altEls = altEl ? link.querySelectorAll("[glitch-el-alt]") : null;
    // set button timeline
    const tl = gsap.timeline({ paused: true });

    if (altEl) {
      gsap.set(altEls, { opacity: 0 });
    }

    tl.to(slices, 0.01, {
      opacity: 1,
      stagger: { amount: 0.2 },
    })
      .to(slices, 0.01, { y: "random(-50%, 50%)", stagger: { amount: 0.02 } })
      .to(slices, 0.02, { y: 0, stagger: { amount: 0.02 } })
      .to(slices, 0.02, {
        opacity: 0,
        stagger: { amount: 0.02, from: "random" },
      })
      .to(slices, 0.01, {
        opacity: 1,
        stagger: { amount: 0.02, from: "random" },
      })
      .to(slices, 0.02, { x: "random(-50%, 50%)", stagger: { amount: 0.01 } })
      .to(slices, 0.01, { x: "random(-50%, 50%)", stagger: { amount: 0.02 } })
      .to(slices, 0.02, {
        opacity: 0,
        stagger: { amount: 0.02, from: "random" },
      });

    if (altEl) {
      tl.to(els, { opacity: 0, duration: 0 }).to(altEls, {
        opacity: 1,
        duration: 0,
      });
    }

    tl.to(slices, 0.01, {
      opacity: 1,
      stagger: { amount: 0.02, from: "random" },
    })
      .to(slices, 0.02, { x: 0, stagger: { amount: 0.02 } })
      .to(slices, 0.01, { x: 0, stagger: { amount: 0.02 } });

    link.addEventListener("mouseover", () => {
      tl.play();
    });
    link.addEventListener("mouseout", () => {
      if (altEl) {
        tl.reverse();
      } else {
        tl.pause(0);
      }
    });
  });
}
