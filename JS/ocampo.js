function moreInfo() {
  alert("Hello! I’m Kenzo Lian M. Ocampo, The Guardian of the WATER GEM.");
}

function navigateTo(section) {
  document.getElementById(section).scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  let sections = document.querySelectorAll("section");
  let scrollPos = window.scrollY + 150;

  sections.forEach(sec => {
    if (
      scrollPos >= sec.offsetTop &&
      scrollPos < sec.offsetTop + sec.offsetHeight
    ) {
      let id = sec.getAttribute("id");
      document.querySelectorAll("nav button").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick").includes(id)) {
          btn.classList.add("active");
        }
      });
    }
  });
});

function createRainDrop() {
  const drop = document.createElement("div");
  drop.classList.add("rain");

  let x = Math.random() * window.innerWidth;
  drop.style.left = x + "px";
  drop.style.top = "-50px";

  document.body.appendChild(drop);

  drop.addEventListener("animationend", () => {
    drop.remove();
    createRipple(x, window.innerHeight - 50);
  });
}

// Joke API Functionality
document.addEventListener("DOMContentLoaded", function () {
  const jokeBtn = document.getElementById("joke-btn");
  const jokeText = document.getElementById("joke-text");

  if (jokeBtn) {
    jokeBtn.addEventListener("click", function () {
      fetch("https://official-joke-api.appspot.com/random_joke")
        .then(response => response.json())
        .then(data => {
          jokeText.textContent = `${data.setup} - ${data.punchline}`;
        })
        .catch(() => {
          jokeText.textContent = "Oops! Something went wrong loading a joke.";
        });
    });
  }
});

function createRipple(x, y) {
  const ripple = document.createElement("div");
  ripple.classList.add("ripple");

  let size = Math.random() * 40 + 20;
  ripple.style.width = size + "px";
  ripple.style.height = size + "px";
  ripple.style.left = x - size / 2 + "px";
  ripple.style.top = y - size / 2 + "px";

  document.body.appendChild(ripple);

  setTimeout(() => ripple.remove(), 2000);
}

setInterval(createRainDrop, 100); 
