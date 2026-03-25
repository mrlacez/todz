import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");
  const bookingMessage = document.getElementById("bookingMessage");

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  if (!bookingForm) return;

  // Full Name: letters and spaces only
  nameInput?.addEventListener("input", () => {
    let cleaned = nameInput.value.replace(/[^A-Za-z\s]/g, "");
    cleaned = cleaned.replace(/\s{2,}/g, " ");
    nameInput.value = cleaned;
  });

  // Phone: digits only, max 11
  phoneInput?.addEventListener("input", () => {
    let cleaned = phoneInput.value.replace(/\D/g, "");
    cleaned = cleaned.slice(0, 11);
    phoneInput.value = cleaned;
  });

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const vehicle = document.getElementById("vehicle")?.value || "";
    const service = document.getElementById("service")?.value || "";
    const date = document.getElementById("date")?.value || "";
    const message = document.getElementById("message")?.value.trim() || "";

    // Name validation
    const nameRegex = /^[A-Za-z ]{2,60}$/;
    if (!nameRegex.test(name)) {
      showMessage("Full name must contain letters and spaces only.", "error");
      nameInput.focus();
      return;
    }

    // Phone validation
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      showMessage("Phone number must be 11 digits and start with 09.", "error");
      phoneInput.focus();
      return;
    }

    // Other required fields
    if (!vehicle || !service || !date) {
      showMessage("Please complete all required fields.", "error");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        name,
        phone,
        vehicle,
        service,
        date,
        message,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      bookingForm.reset();
      showMessage("Booking submitted successfully!", "success");
    } catch (error) {
      console.error("Booking submit error:", error);
      showMessage("Failed to submit booking. Please try again.", "error");
    }
  });

  function showMessage(text, type) {
    if (!bookingMessage) return;
    bookingMessage.textContent = text;
    bookingMessage.className = `form-message ${type}`;
  }
});