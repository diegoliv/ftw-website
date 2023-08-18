import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

export default function initWeaposSlider(transitionCallback) {
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
    fireRateBar = document.querySelector(".weapons-stats-bar-inner.fire-rate"),
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

    if (typeof transitionCallback === "function") {
      transitionCallback();
    }
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
}
