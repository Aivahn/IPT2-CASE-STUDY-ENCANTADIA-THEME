document.getElementById("moreBtn").addEventListener("click", function () {
  document.getElementById("about").scrollIntoView({
    behavior: "smooth"
  });
});

const aboutBoxes = document.querySelectorAll(".about-box");

aboutBoxes.forEach(box => {
  box.addEventListener("click", function (e) {
    e.preventDefault(); // stop default jump
    const targetId = this.getAttribute("href"); // get the target section
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

document.querySelectorAll(".scroll-down").forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Scroll Up button (Contact → Home)
document.querySelectorAll(".scroll-up").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById("home"); // force scroll to top
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
