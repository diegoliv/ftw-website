import SplitType from "split-type";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScrollTrigger } from "./utils.js";

gsap.registerPlugin(ScrollTrigger);

// glitch effect on headlines ================================ //
export default function initGlitchHeadlines(transitionCallback) {
  new SplitType("[glitch-effect]", {
    types: "words",
    tagName: "span",
  });

  // now duplicate elements inside words
  var words = document.querySelectorAll("[glitch-effect] .word");

  words.forEach((word) => {
    const text = word.textContent;
    const html = `<span class="top" aria-hidden="true">${text}</span><span class="bottom">${text}</span>`;
    word.innerHTML = html;
  });

  const headlines = gsap.utils.toArray("[glitch-effect]");

  headlines.forEach((words) => {
    var trigger = words.dataset.glitchTrigger || words;
    var delay = Number(words.dataset.glitchDelay) || 1;
    var start = words.dataset.glitchStart;
    var end = words.dataset.glitchEnd;
    var once = Object.keys(words.dataset).indexOf("glitchOnce") !== -1;

    var tl = gsap.timeline({
      delay: delay,
      overwrite: true,
      paused: true,
      onStart: () => {
        if (typeof transitionCallback === "function") {
          transitionCallback();
        }
      },
    });
    var item = words.querySelectorAll(".word");
    var top = words.querySelectorAll(".top");

    tl.to(item, 0.01, {
      opacity: 1,
      stagger: { amount: 0.2 },
    })
      .to(item, 0.01, { y: "random(-50%, 50%)", stagger: { amount: 0.02 } })
      .to(item, 0.02, { y: 0, stagger: { amount: 0.02 } })
      .to(item, 0.02, {
        opacity: 0,
        stagger: { amount: 0.02, from: "random" },
      })
      .to(item, 0.01, {
        opacity: 1,
        stagger: { amount: 0.02, from: "random" },
      })
      .to(item, 0.02, { x: "random(-50%, 50%)", stagger: { amount: 0.01 } })
      .to(top, 0.01, { x: "random(-50%, 50%)", stagger: { amount: 0.02 } })
      .to(item, 0.02, {
        opacity: 0,
        stagger: { amount: 0.02, from: "random" },
      })
      .to(item, 0.01, {
        opacity: 1,
        stagger: { amount: 0.02, from: "random" },
      })
      .to(item, 0.02, { x: 0, stagger: { amount: 0.02 } })
      .to(top, 0.01, { x: 0, stagger: { amount: 0.02 } });

    createScrollTrigger(trigger, tl, true, start, end, delay, true, once);
  });

  gsap.set("[glitch-effect]", {
    opacity: 1,
  });

  gsap.set("[glitch-effect] .word", {
    opacity: 0,
    y: "random(-50%, 50%)",
    x: "random(-50%, 50%)",
  });
}
