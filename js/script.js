document.querySelectorAll("nav ul li a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({
      behavior: "smooth",
    });
  });
});

var mouseclick = new Audio();
mouseclick.src = "1687569402mixkit-fast-double-click-on-mouse-275.wav";

window.addEventListener("click", function () {
  const audio = document.getElementById("bg-audio");
  if (audio.paused) {
    audio.play();
  }
});

window.addEventListener("scroll", function () {
  const image = document.querySelector(".image-3d");
  const scrollTop = window.scrollY;
  const speed = 0.3;
  image.style.transform = `translate(-50%, ${scrollTop * speed}px)`;
});

window.addEventListener("scroll", function () {
  const image = document.getElementById("parallax-image");
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  const scrollSpeed = 0.3;

  image.style.transform = `translateY(${scrollTop * scrollSpeed}px)`;
});

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "F12") {
    e.preventDefault();
  }

  if (e.ctrlKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
  }
});

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("dragstart", function (e) {
    e.preventDefault();
  });
});

window.addEventListener("scroll", function () {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.getElementById("progressBar").style.width = scrollPercent + "%";
});

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");

window.addEventListener("scroll", function () {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 50) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

const consentBanner = document.getElementById("cookieConsent");
const acceptCookies = document.getElementById("acceptCookies");

if (!localStorage.getItem("cookieConsent")) {
  consentBanner.style.display = "block";
}

acceptCookies.addEventListener("click", function () {
  localStorage.setItem("cookieConsent", true);
  consentBanner.style.display = "none";
});

window.addEventListener("scroll", () => {
  const navbar = document.getElementById("popup-navbar");
  if (window.scrollY > 100) {
    navbar.classList.add("visible");
  } else {
    navbar.classList.remove("visible");
  }
});

window.onload = function () {
  setTimeout(() => {
    document.getElementById("loading").style.display = "none";

    const mainContent = document.getElementById("main-content");
    mainContent.style.opacity = 0;
    mainContent.style.display = "block";
    setTimeout(() => {
      mainContent.style.opacity = 1;
    }, 50);
  }, 4000);
};

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav ul li a");

  document.addEventListener("scroll", () => {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (scrollY >= sectionTop - sectionHeight / 3) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // Smooth scrolling
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      targetSection.scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});