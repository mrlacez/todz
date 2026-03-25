document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const contactMessage = document.getElementById("contactMessage");

    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        contactMessage.textContent = "Your message has been sent successfully.";
        contactMessage.style.color = "#16a34a";

        contactForm.reset();
    });
});