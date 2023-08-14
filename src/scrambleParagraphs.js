import SplitType from "split-type";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { createScrollTrigger } from "./utils.js";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Scramble Text on Paragraphs ==================================//
export default function initScrambleParagraphs(transitionCallback) {
  const scrambleParagraphs = gsap.utils.toArray("[scramble]");

  scrambleParagraphs.forEach((item) => {
    // wrap and clone item to prevent paragraphs vertically centered to "grow".
    const wrapper = document.createElement("div");
    item.parentNode.insertBefore(wrapper, item);
    wrapper.innerHTML = `<${item.tagName} class="${item.className}" aria-hidden="true">${item.innerHTML}</${item.tagName}>`;
    wrapper.appendChild(item);
    wrapper.setAttribute("class", "scramble-wrapper");

    const trigger = item.dataset.scrambleTrigger || item;
    const delay = Number(item.dataset.scrambleDelay) || 1;
    const duration = Number(item.dataset.scrambleDuration) || 2;
    const start = item.dataset.scrambleStart;
    const end = item.dataset.scrambleEnd;
    const once = Object.keys(item.dataset).indexOf("scrambleOnce") !== -1;

    let tl = gsap.timeline({
      delay: delay,
      overwrite: true,
      paused: true,
      ease: "none",
    });
    tl.from(item, { duration: duration, text: "" });

    createScrollTrigger(
      trigger,
      tl,
      true,
      start,
      end,
      delay,
      false,
      once,
      "scramble"
    );
  });
}
