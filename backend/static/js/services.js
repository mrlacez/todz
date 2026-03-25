import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

let servicesData = [];

function getEl(id) {
    return document.getElementById(id);
}

function renderServices() {
    const container = getEl("servicesContainer");
    if (!container) return;

    if (!servicesData.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Services found</h3>
                <p>Add your first service.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = servicesData.map(item => `
        <div class="data-card">
            <h3>${item.name || "No service"}</h3>
            <p><strong>Price:</strong> ${item.price || "-"}</p>
            <p><strong>Duration:</strong> ${item.duration || "-"}</p>
            <p><strong>Description:</strong> ${item.description || "-"}</p>

            <div class="card-actions">
                <button class="secondary-btn edit-service" data-id="${item.id}">Edit</button>
                <button class="danger-btn delete-service" data-id="${item.id}">Delete</button>
            </div>
        </div>
    `).join("");

    container.querySelectorAll(".delete-service").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm("Delete this service?")) return;
            await deleteDoc(doc(db, "services", btn.dataset.id));
        });
    });

    container.querySelectorAll(".edit-service").forEach(btn => {
        btn.addEventListener("click", async () => {
            const item = servicesData.find(s => s.id === btn.dataset.id);
            if (!item) return;

            const name = prompt("Service name:", item.name || "");
            const price = prompt("Price:", item.price || "");
            const duration = prompt("Duration:", item.duration || "");
            const description = prompt("Description:", item.description || "");

            await updateDoc(doc(db, "services", item.id), {
                name, price, duration, description
            });
        });
    });
}

export function initServices() {
    getEl("addServiceBtn")?.addEventListener("click", async () => {
        const payload = {
            name: getEl("serviceName").value.trim(),
            price: getEl("servicePrice").value.trim(),
            duration: getEl("serviceDuration").value.trim(),
            description: getEl("serviceDescription").value.trim()
        };

        if (!payload.name || !payload.price) {
            alert("Service name and price are required.");
            return;
        }

        await addDoc(collection(db, "services"), payload);

        getEl("serviceName").value = "";
        getEl("servicePrice").value = "";
        getEl("serviceDuration").value = "";
        getEl("serviceDescription").value = "";
    });

    onSnapshot(collection(db, "services"), (snapshot) => {
        servicesData = snapshot.docs.map(docItem => ({
            id: docItem.id,
            ...docItem.data()
        }));
        renderServices();
    });
}