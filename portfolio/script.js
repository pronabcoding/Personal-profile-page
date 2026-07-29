
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const submitBtn = document.querySelector("#submit-btn");

contactForm.addEventListener("submit", async function (event) {
  
  event.preventDefault();

  
  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const message = document.querySelector("#message").value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = "Please fill in every field before sending.";
    formStatus.classList.add("is-error");
    return;
  }

  
  const formData = new FormData(contactForm);

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  formStatus.classList.remove("is-error");
  formStatus.textContent = "";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      formStatus.textContent = "Thank you! Your message has been sent.";
      contactForm.reset();
    } else {
      formStatus.textContent = "Something went wrong. Please try again.";
      formStatus.classList.add("is-error");
    }
  } catch (error) {
    formStatus.textContent = "Network error. Please try again later.";
    formStatus.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send message";
  }
});


const menuToggle = document.querySelector("#menu-toggle");
const sidebar = document.querySelector("#sidebar");

menuToggle.addEventListener("click", function () {
  const isOpen = sidebar.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});


document.querySelectorAll(".nav-link").forEach(function (link) {
  link.addEventListener("click", function () {
    sidebar.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});


const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");

const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(function (link) {
          link.classList.toggle(
            "is-active",
            link.getAttribute("data-section") === id
          );
        });
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);

sections.forEach(function (section) {
  observer.observe(section);
});
