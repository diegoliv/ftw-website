import SplitType from "split-type";
import Lenis from "@studio-freight/lenis";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import ScrambleTextPlugin from "./ScrambleTextPlugin.min.js";

gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrambleTextPlugin);

const body = document.querySelector("body");
body.classList.add("loading");

window.addEventListener("DOMContentLoaded", (event) => {
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
  checkIfLoaded(document.querySelector(".frame-header"), initPage);

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
          if (!isLoaded) return;
          maybePlay(headlineGlitch);
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

    // Scramble Text on Paragraphs ==================================//
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

    // Factions Slider ============================================== //
    const heroes = gsap.utils.toArray(".factions-slider-hero");
    let factions = {
      homefront: [],
      sapiens: [],
    };
    let currentIndex = 0,
      prevIndex = 0,
      currentFaction = "",
      prevHero = null,
      currentHero = null;

    // Populate hero data
    heroes.forEach((hero) => {
      const img = hero.querySelector("img");
      const elInner = `
      <div class="slice top-third"></div>
      <div class="slice middle-third"></div>
      <div class="slice bottom-third"></div>`;
      hero.innerHTML = elInner;

      const slices = hero.querySelectorAll("div");
      slices.forEach((slice) => {
        slice.appendChild(img.cloneNode(true));
      });

      // Defaults
      gsap.set(slices, {
        opacity: 0,
        y: "random(-50%, 50%)",
        x: "random(-50%, 50%)",
      });

      const heroData = {
        el: hero,
        name: hero.dataset.heroName,
        tl: gsap.timeline({
          overwrite: true,
          paused: true,
        }),
      };

      heroData.tl
        .to(slices, 0.01, {
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
        })
        .to(slices, 0.01, {
          opacity: 1,
          stagger: { amount: 0.02, from: "random" },
        })
        .to(slices, 0.02, { x: 0, stagger: { amount: 0.02 } })
        .to(slices, 0.01, { x: 0, stagger: { amount: 0.02 } });

      const faction = hero.dataset.heroFaction;

      if (["homefront", "sapiens"].includes(faction)) {
        factions[faction].push(heroData);
      }
    });

    // Slider controls
    const next = document.querySelector(
        ".factions-slider-controls .slider-arrow.next"
      ),
      prev = document.querySelector(
        ".factions-slider-controls .slider-arrow.prev"
      ),
      label = document.querySelector(".factions-slider-controls-name"),
      labelTl = gsap.timeline();

    function goToHero(index) {
      if (factions[currentFaction][index] === "undefined") return;

      currentIndex = index;
      transitionHero();
    }

    // Transition function between heroes
    function transitionHero() {
      if (prevHero && prevHero === currentHero) return;
      prevHero = currentHero;
      currentHero = factions[currentFaction][currentIndex];

      // update hero hame
      labelTl
        .to(label, {
          text: "",
          duration: 0.25,
          ease: "sine.in",
        })
        .delay(0.25)
        .to(label, {
          text: currentHero.name,
          duration: 0.25,
          ease: "sine.in",
        });

      if (!prevHero) {
        currentHero.tl.play();
      } else {
        prevHero.tl.eventCallback("onReverseComplete", () => {
          currentHero.tl.play();
        });

        prevHero.tl.reverse();
      }

      // Play glitch effect
      if (!isLoaded) return;
      maybePlay(headlineGlitch);
    }

    function updateIndex(type) {
      if (type === "next") {
        prevIndex = currentIndex;
        currentIndex =
          currentIndex >= factions[currentFaction].length - 1
            ? 0
            : currentIndex + 1;
      }
      if (type === "prev") {
        prevIndex = currentIndex;

        currentIndex =
          currentIndex - 1 < 0
            ? factions[currentFaction].length - 1
            : currentIndex - 1;
      }
    }

    next.addEventListener("click", () => {
      updateIndex("next");
      transitionHero();
    });

    prev.addEventListener("click", () => {
      updateIndex("prev");
      transitionHero();
    });

    // Trigger - Homefront
    ScrollTrigger.create({
      trigger: "#factions-homefront-trigger",
      start: "top center",
      end: "bottom center",
      pin: false,
      onEnter: () => {
        if (currentFaction !== "homefront") {
          currentFaction = "homefront";
          goToHero(0);
        }
      },
      onEnterBack: () => {
        if (currentFaction !== "homefront") {
          currentFaction = "homefront";
          goToHero(0);
        }
      },
    });

    // Trigger - Sapiens
    ScrollTrigger.create({
      trigger: "#factions-sapiens-trigger",
      start: "top center",
      end: "bottom center",
      pin: false,
      onEnter: () => {
        if (currentFaction !== "sapiens") {
          currentFaction = "sapiens";
          console.log("current faction is", currentFaction);
          goToHero(0);
        }
      },
    });

    // Weapons Slider ============================================== //
    const weaponsList = gsap.utils.toArray(".weapons-slide");
    let weapons = [];

    let currentWeaponIndex = 0,
      prevWeaponIndex = 0,
      prevWeapon = null,
      currentWeapon = null;

    // Populate hero data
    weaponsList.forEach((weapon) => {
      const inner = weapon.querySelector(".weapon-slide-inner");
      const img = inner.querySelector(".weapons-slider-weapon");
      const detail = weapon.querySelector(".weapon-detail");
      const elInner = `
      <div class="slice top-left-third"></div>
      <div class="slice bottom-left-third"></div>
      <div class="slice top-middle-third"></div>
      <div class="slice bottom-middle-third"></div>
      <div class="slice top-right-third"></div>
      <div class="slice bottom-right-third"></div>`;
      inner.innerHTML = elInner;

      const slices = inner.querySelectorAll("div");
      slices.forEach((slice) => {
        slice.appendChild(img.cloneNode(true));
      });

      img.classList.add("invisible");
      inner.appendChild(img);

      // Defaults
      gsap.set(slices, {
        opacity: 0,
        y: "random(-50%, 50%)",
        x: "random(-50%, 50%)",
      });
      gsap.set(detail, {
        opacity: 0,
      });

      const weaponData = {
        el: weapon,
        name: weapon.dataset.name,
        damage: parseFloat(weapon.dataset.damage),
        accuracy: parseFloat(weapon.dataset.accuracy),
        fireRate: parseFloat(weapon.dataset.fireRate),
        tl: gsap.timeline({
          overwrite: true,
          paused: true,
        }),
      };

      weaponData.tl
        .to(slices, 0.01, {
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
        })
        .to(slices, 0.01, {
          opacity: 1,
          stagger: { amount: 0.02, from: "random" },
        })
        .to(slices, 0.02, { x: 0, stagger: { amount: 0.02 } })
        .to(slices, 0.01, { x: 0, stagger: { amount: 0.02 } })
        // weapon detail
        .to(detail, 0.04, { opacity: 1 })
        .to(detail, 0.04, { opacity: 0 })
        .to(detail, 0.04, { opacity: 1 })
        .to(detail, 0.04, { opacity: 0 })
        .to(detail, 0.04, { opacity: 1 })
        .to(detail, 0.04, { opacity: 0 })
        .to(detail, 0.04, { opacity: 1 });

      weapons.push(weaponData);
    });

    // Slider controls
    const weaponsNext = document.querySelector(
        ".weapons-slider-controls .slider-arrow.next"
      ),
      weaponsPrev = document.querySelector(
        ".weapons-slider-controls .slider-arrow.prev"
      ),
      damageBar = document.querySelector(".weapons-stats-bar-inner.damage"),
      accuracyBar = document.querySelector(".weapons-stats-bar-inner.accuracy"),
      fireRateBar = document.querySelector(
        ".weapons-stats-bar-inner.fire-rate"
      ),
      damageTL = gsap.timeline(),
      accuracyTL = gsap.timeline(),
      fireRateTL = gsap.timeline(),
      weaponlabel = document.querySelector(".weapons-slider-controls-name"),
      weaponlabelTl = gsap.timeline();

    function goToWeapon(index) {
      if (weapons[index] === "undefined") return;

      currentWeaponIndex = index;
      transitionWeapon();
    }

    // Transition function between heroes
    function transitionWeapon() {
      if (prevWeapon && prevWeapon === currentWeapon) return;
      prevWeapon = currentWeapon;
      currentWeapon = weapons[currentWeaponIndex];

      // update Stats
      damageTL.to(damageBar, {
        width: `${currentWeapon.damage}%`,
        duration: 0.3,
        ease: "sine.in",
      });

      accuracyTL.to(accuracyBar, {
        width: `${currentWeapon.accuracy}%`,
        duration: 0.3,
        ease: "sine.in",
      });

      fireRateTL.to(fireRateBar, {
        width: `${currentWeapon.fireRate}%`,
        duration: 0.3,
        ease: "sine.in",
      });

      // update weapon hame
      weaponlabelTl
        .to(weaponlabel, {
          text: "",
          duration: 0.25,
          ease: "sine.in",
        })
        .delay(0.25)
        .to(weaponlabel, {
          text: currentWeapon.name,
          duration: 0.25,
          ease: "sine.in",
        });

      if (!prevWeapon) {
        currentWeapon.tl.play();
      } else {
        prevWeapon.tl.eventCallback("onReverseComplete", () => {
          currentWeapon.tl.play();
        });

        prevWeapon.tl.reverse();
      }

      // Play glitch effect
      if (!isLoaded) return;
      maybePlay(headlineGlitch);
    }

    function updateWeaponIndex(type) {
      if (type === "next") {
        prevWeaponIndex = currentWeaponIndex;
        currentWeaponIndex =
          currentWeaponIndex >= weapons.length - 1 ? 0 : currentWeaponIndex + 1;
      }
      if (type === "prev") {
        prevWeaponIndex = currentWeaponIndex;

        currentWeaponIndex =
          currentWeaponIndex - 1 < 0
            ? weapons.length - 1
            : currentWeaponIndex - 1;
      }
    }

    weaponsNext.addEventListener("click", () => {
      updateWeaponIndex("next");
      transitionWeapon();
    });

    weaponsPrev.addEventListener("click", () => {
      updateWeaponIndex("prev");
      transitionWeapon();
    });

    // Trigger initial
    ScrollTrigger.create({
      trigger: "#weapons-content-trigger",
      start: "top center",
      end: "bottom center",
      pin: false,
      onEnter: () => {
        goToWeapon(0);
      },
    });

    // glitch effect for footer linkst
    const links = gsap.utils.toArray("[glitch-link]");

    links.forEach((link) => {
      const el = link.querySelector("[glitch-el]");
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
      });

      if (el.hasAttribute("glitch-sizer")) {
        el.classList.add("invisible");
        inner.appendChild(el);
      }

      // set button timeline
      const tl = gsap.timeline({ paused: true });

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
        })
        .to(slices, 0.01, {
          opacity: 1,
          stagger: { amount: 0.02, from: "random" },
        })
        .to(slices, 0.02, { x: 0, stagger: { amount: 0.02 } })
        .to(slices, 0.01, { x: 0, stagger: { amount: 0.02 } });

      link.addEventListener("mouseover", () => {
        tl.play();
      });
      link.addEventListener("mouseout", () => {
        tl.pause(0);
      });
    });

    // Mobile menu interaction
    const menuTrigger = document.querySelector(".menu-trigger");
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

    // Close mobile menu if link is clicked
    document.querySelectorAll(".nav-link.mobile").forEach((link) => {
      link.addEventListener("click", () => {
        menuTrigger.click();
      });
    });

    // Form submit
    document
      .querySelector(".newsletter-submit")
      .addEventListener("click", () => {
        document.querySelector(".form-submit-hidden").click();
      });
  }
});
