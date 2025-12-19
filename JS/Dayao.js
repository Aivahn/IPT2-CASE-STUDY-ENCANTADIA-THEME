document.getElementById("moreBtn").addEventListener("click", function () {
  document.getElementById("about").scrollIntoView({
    behavior: "smooth"
  });
});

const aboutBoxes = document.querySelectorAll(".about-box");

aboutBoxes.forEach(box => {
  box.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
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


document.querySelectorAll(".scroll-up").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById("home");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

const quote = document.getElementById("quote");

const getquote = async () => {
  try {
    const res = await fetch(
      `https://api.adviceslip.com/advice`
    );
const data = await res.json();
quote.innerHTML = `
 <div style="
    margin-bottom:12px;
    margin-top:12px;
    padding:12px;
    background:rgba(10, 20, 60, 0.4);
    backdrop-filter:blur(6px);
    border:1px solid rgba(30, 50, 120, 0.5);
    border-radius:10px;
    color:#dce6ff;
    font-size:14px;
    line-height:1.3;
    max-width:300px;
  ">
    <p style="margin:4px 0; font-style:italic; color:#bcd0ff;">${data.slip.advice}</p>`;

  } catch (error) {
    console.log(error);
  }
};

getquote();

quote.style.cursor = "pointer";
quote.addEventListener("click", () => {
  getquote();
});



