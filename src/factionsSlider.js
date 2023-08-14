import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Factions Slider ============================================== //
export default function initFactionsSlider(transitionCallback) {
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

    if (typeof transitionCallback === "function") {
      transitionCallback();
    }
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
        // console.log("current faction is", currentFaction);
        goToHero(0);
      }
    },
  });
}
