import { db } from "./firebase-config.js";
import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const checkForm = document.getElementById("checkForm");
const bookingResults = document.getElementById("bookingResults");
let unsubscribe = null;

checkForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const phone = document.getElementById("checkPhone").value.trim();

    if (unsubscribe) unsubscribe();

    const q = query(collection(db, "bookings"), where("phone", "==", phone));

    unsubscribe = onSnapshot(q, (snapshot) => {
        bookingResults.innerHTML = "";

        if (snapshot.empty) {
            bookingResults.innerHTML = "<p>No bookings found.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const booking = docSnap.data();
            const card = document.createElement("div");
            card.className = "item-card";
            card.innerHTML = `
                <h3>${booking.name}</h3>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
                <p><strong>Service:</strong> ${booking.service}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
            `;
            bookingResults.appendChild(card);
        });
    });
});