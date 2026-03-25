import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-config.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/admin";
    }
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        errorMessage.textContent = "Email and password are required.";
        return;
    }

    errorMessage.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "/admin";
    } catch (error) {
        console.error(error);
        errorMessage.textContent = formatAuthError(error.code);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});

function formatAuthError(code) {
    switch (code) {
        case "auth/invalid-email":
            return "Invalid email address.";
        case "auth/invalid-credential":
            return "Wrong email or password.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Try again later.";
        default:
            return "Unable to login right now.";
    }
}