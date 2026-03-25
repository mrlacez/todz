import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./firebase-config.js";

export function protectAdminPage() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "/";
        }
    });
}

export function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn?.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed.");
        }
    });
}