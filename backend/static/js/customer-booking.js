import { db, storage } from "./firebase-config.js";
import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const bookingForm = document.getElementById("bookingForm");
const serviceSelect = document.getElementById("service");

async function loadServices() {
    const snapshot = await getDocs(collection(db, "services"));
    serviceSelect.innerHTML = `<option value="">Select Service</option>`;

    snapshot.forEach((docSnap) => {
        const service = docSnap.data();
        const option = document.createElement("option");
        option.value = service.name;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
    });
}

bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const file = document.getElementById("vehiclePhoto").files[0];
        let imageUrl = "";

        if (file) {
            const storageRef = ref(storage, `booking-photos/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(storageRef);
        }

        await addDoc(collection(db, "bookings"), {
            name: document.getElementById("name").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            vehicle: document.getElementById("vehicle").value,
            service: document.getElementById("service").value,
            date: document.getElementById("date").value,
            message: document.getElementById("message").value.trim(),
            imageUrl,
            status: "Pending",
            createdAt: serverTimestamp()
        });

        bookingForm.reset();
        window.showToast("Booking submitted successfully.", "success");
    } catch (error) {
        console.error(error);
        window.showToast("Booking failed.", "error");
    }
});

loadServices();