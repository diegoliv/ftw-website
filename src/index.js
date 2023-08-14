import SplitType from "split-type";
import Lenis from "@studio-freight/lenis";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import ScrambleTextPlugin from "./ScrambleTextPlugin.min.js";

import { checkIfLoaded, createScrollTrigger } from "./utils.js";
import initFactionsSlider from "./factionsSlider.js";
import initWeaponsSlider from "./weaponsSlider.js";
import initGlitchHeadlines from "./glitchHeadlines.js";
import initScrambleParagraphs from "./scrambleParagraphs.js";
import initGlitchLinks from "./glitchLinks.js";

gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrambleTextPlugin);

const body = document.querySelector("body");
body.classList.add("loading");

window.addEventListener("DOMContentLoaded", (event) => {
  // AUDIO ======================================== //
  const music = document.querySelector("#audio"); // music
  const headlineGlitch = document.querySelector("#headline-glitch"); // glitch
  const hoverGlitch = document.querySelector("#hover-glitch"); // hover
  headlineGlitch.volume = 0.4;
  hoverGlitch.volume = 0.3;

  let isLoaded = false;
  let audioEnabled = false;
  const musicControl = document.querySelector(".play-pause");
  const audioState = new (window.AudioContext || window.webkitAudioContext)();

  // Check if playing audio is allowed
  function maybePlay(audio, callback) {
    console.log("maybePlay", audioState.state, audioEnabled);
    //if (audioState.state === "running" && audioEnabled) {
    if (audioEnabled) {
      audio.play();
      if (callback && typeof callback === "function") {
        callback();
      }
    }
  }

  // initialize music if user clicks on the screen
  function initMusic(e) {
    if (!isLoaded) {
      audioEnabled = true;
      maybePlay(music, () => {
        if (!e.target.closest(".play-pause")) {
          musicControl.click();
        }
        body.removeEventListener("click", initMusic);
        isLoaded = true;
      });
    }
  }

  body.addEventListener("click", initMusic, false);
  document.addEventListener("touchend", initMusic, false);

  // Music toggle
  musicControl.addEventListener("click", () => {
    if (!isLoaded) return;
    musicControl.classList.toggle("paused");
    if (musicControl.classList.contains("paused")) {
      audioEnabled = false;
      music.pause();
    } else {
      audioEnabled = true;
      music.play();
    }
  });

  // Lenis =====================================================//
  const lenis = new Lenis({ resize: true });

  function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
  }

  // lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Grab all elements that have a "data-target" attribute
  const scrollButtons = document.querySelectorAll("[data-target]");

  // For each element, listen to a "click" event
  scrollButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // get the DOM element by the ID (data-target value)
      var target = button.dataset.target,
        $el = document.getElementById(target.replace("#", ""));

      // Use lenis.scrollTo() to scroll the page to the right element
      lenis.scrollTo($el, {
        offset: 0,
        immediate: false,
        duration: 1,
        easing: (x) =>
          x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, // https://easings.net
      });
    });
  });

  requestAnimationFrame(raf);

  // Initialize
  //checkIfLoaded(document.querySelector(".frame-header"), initPage);
  initPage();

  // Initialize gsap functionality
  function initPage() {
    body.classList.remove("loading");
    //lenis.scrollTo(1, { immediate: true });
    const heroIntro = document.querySelector(".hero-intro-trigger");
    if (heroIntro) {
      heroIntro.click();
    }

    // Link sounds
    const hoverSounds = gsap.utils.toArray(".hover-glitch");
    hoverSounds.forEach((el) => {
      el.addEventListener("mouseover", (e) => {
        maybePlay(hoverGlitch);
      });
    });

    // Scramble text on hover =======================================//
    const sT = gsap.utils.toArray(".scramble");

    sT.forEach((item) => {
      let tween = gsap.to(item, {
        duration: 1,
        scrambleText: { text: "{original}", chars: "F0RTH3W1N2023 " },
        paused: true,
      });

      item.addEventListener("mouseenter", () => {
        tween.play();
      });
      item.addEventListener("mouseleave", () => {
        tween.pause(0);
      });
    });

    // Scramble hover on triangle buttons ============================//
    const triangles = gsap.utils.toArray(".triangle-button");

    triangles.forEach((item) => {
      let label = item.querySelector(".triangle-button-label");
      var text = new SplitType(label, {
        types: "words",
        tagName: "span",
      });

      let tween = gsap.to(text.words, {
        duration: 0.5,
        scrambleText: {
          text: "{original}",
          chars: "F0RTH3W1N2023 ",
          delimiter: " ",
        },
        ease: "none",
        paused: true,
      });

      item.addEventListener("mouseenter", () => {
        tween.play();
      });
      item.addEventListener("mouseleave", () => {
        tween.pause(0);
      });
    });

    // glitch effect on headlines ================================ //
    initGlitchHeadlines(() => {
      if (!isLoaded) return;
      maybePlay(headlineGlitch);
    });

    // Scramble Text on Paragraphs ==================================//
    initScrambleParagraphs(() => {
      if (!isLoaded) return;
      maybePlay(headlineGlitch);
    });

    // glitch effect for footer links ====================================== //
    initGlitchLinks();

    // Mobile menu interaction ========================================== //
    const menuTrigger = document.querySelector(".menu-trigger");

    if (menuTrigger) {
      // Store link labels
      document.querySelectorAll(".mobile-nav-link-label").forEach((item) => {
        item.dataset.label = item.textContent;
      });
      const menuTl = gsap.timeline({ paused: true });
      menuTl
        .to(".mobile-nav-link-label", {
          text: (index, target) => {
            return target.dataset.label;
          },
          duration: 0.5,
          stagger: 0.2,
        })
        .to(
          ".nav-link-divider",
          {
            scaleX: 1,
            duration: 0.3,
            stagger: 0.2,
          },
          0
        )
        .to(
          ".nav-link-gradient",
          {
            opacity: 0.5,
            duration: 0.3,
            stagger: 0.2,
          },
          0
        );

      gsap.set(".mobile-nav-link-label", { text: "" });
      gsap.set(".nav-link-divider", { scaleX: 0 });
      gsap.set(".nav-link-gradient", { opacity: 0 });
      menuTrigger.addEventListener("click", (e) => {
        if (menuTrigger.classList.contains("active")) {
          menuTl.reverse();
        } else {
          menuTl.play();
        }
        menuTrigger.classList.toggle("active");
      });
      // Close mobile menu if link is clicked ========================= //
      document.querySelectorAll(".nav-link.mobile").forEach((link) => {
        link.addEventListener("click", () => {
          menuTrigger.click();
        });
      });
    }

    // Form submit ================================================== //
    if (document.querySelector(".newsletter-submit")) {
      document
        .querySelector(".newsletter-submit")
        .addEventListener("click", () => {
          document.querySelector(".form-submit-hidden").click();
        });
    }

    // Factions Slider ============================================== //
    if (document.querySelector(".factions-slider-wrapper")) {
      initFactionsSlider(() => {
        // Play glitch effect
        if (!isLoaded) return;
        maybePlay(headlineGlitch);
      });
    }

    // Weapons Slider ============================================== //
    if (document.querySelector(".weapons-slider")) {
      initWeaponsSlider(() => {
        // Play glitch effect
        if (!isLoaded) return;
        maybePlay(headlineGlitch);
      });
    }
  }
});
