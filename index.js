"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ================= CONFIGURATION =================

    const CONFIG = {
        whatsappNumber: "923111442899",
        scrollThreshold: 300,
        brandName: "Hunza Touristan"
    };


    // ================= DOM ELEMENTS =================

    const header = document.querySelector(".header");
    const menuBtn = document.querySelector("#menu-bar");
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".navbar a");
    const sections = document.querySelectorAll("section[id]");
    const backToTopBtn = document.getElementById("myBtn");
    const bookingForm = document.querySelector("#booking-form");
    const formMessage = document.querySelector("#form-message");


    // ================= MOBILE NAVIGATION =================

    function closeMobileMenu() {
        menuBtn?.classList.remove("fa-times");
        navbar?.classList.remove("active");
    }

    function toggleMobileMenu() {
        menuBtn?.classList.toggle("fa-times");
        navbar?.classList.toggle("active");
    }

    if (menuBtn && navbar) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });

        navLinks.forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("click", (event) => {
            if (!navbar.contains(event.target) && !menuBtn.contains(event.target)) {
                closeMobileMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMobileMenu();
        });
    }


    // ================= SCROLL HANDLER (THROTTLED) =================

    let isScrolling = false;

    function updateActiveNavLink(scrollY) {
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === `#${sectionId}`
                    );
                });
            }
        });
    }

    function onScroll() {
        if (isScrolling) return;
        isScrolling = true;

        window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            // Close mobile menu on scroll
            closeMobileMenu();

            // Add subtle shadow to header after scrolling
            header?.classList.toggle("scrolled", scrollY > 40);

            // Show or hide Back to Top button
            if (backToTopBtn) {
                backToTopBtn.style.display = scrollY > CONFIG.scrollThreshold ? "flex" : "none";
            }

            // Highlight current section in navbar
            updateActiveNavLink(scrollY);

            isScrolling = false;
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initialize on page load


    // ================= BACK TO TOP =================

    window.topFunction = function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ================= AUTO-FILL DESTINATION ON CARD CLICK =================

    const destinationInput = bookingForm?.querySelector('input[name="destination"]');
    const destinationCardButtons = document.querySelectorAll(".popular .box .btn");

    destinationCardButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".box");
            const placeTitle = card?.querySelector("h3")?.textContent.trim();

            if (destinationInput && placeTitle) {
                destinationInput.value = placeTitle;
                destinationInput.focus({ preventScroll: true });
            }
        });
    });


    // ================= DATE INPUT MINIMUM (NO PAST DATES) =================

    const travelDateInput = bookingForm?.querySelector('input[name="travel_date"]');

    if (travelDateInput) {
        const today = new Date().toISOString().split("T")[0];
        travelDateInput.setAttribute("min", today);
    }


    // ================= HELPER: FORMAT DATE =================

    function formatReadableDate(dateString) {
        if (!dateString) return "Not specified";
        const date = new Date(dateString + "T00:00:00");
        if (Number.isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }


    // ================= BOOKING FORM SUBMISSION =================

    function showStatusMessage(text, isError = false) {
        if (!formMessage) return;

        formMessage.textContent = text;
        formMessage.style.color = isError ? "#b91c1c" : "#153b35";
        formMessage.style.backgroundColor = isError ? "#fee2e2" : "#e6f2ef";
        formMessage.style.padding = "1.2rem 1.6rem";
        formMessage.style.borderRadius = "0.6rem";
        formMessage.style.fontWeight = "700";
        formMessage.style.fontSize = "1.5rem";
        formMessage.style.marginTop = "1.5rem";

        setTimeout(() => {
            formMessage.textContent = "";
            formMessage.style.padding = "0";
            formMessage.style.backgroundColor = "transparent";
        }, 8000);
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!bookingForm.checkValidity()) {
                bookingForm.reportValidity();
                return;
            }

            const formData = new FormData(bookingForm);
            const name = (formData.get("name") || "").toString().trim();
            const email = (formData.get("email") || "").toString().trim();
            const phone = (formData.get("phone") || "").toString().trim();
            const destination = (formData.get("destination") || "").toString().trim();
            const travelDate = (formData.get("travel_date") || "").toString();
            const travelers = (formData.get("travelers") || "").toString().trim();
            const message = (formData.get("message") || "").toString().trim();

            if (!name || !email || !phone) {
                showStatusMessage("Please fill in your name, email, and phone number.", true);
                return;
            }

            const whatsappMessage = [
                `🌍 *NEW TRAVEL INQUIRY*`,
                `━━━━━━━━━━━━━━━━━━`,
                ``,
                `👤 *Name:* ${name}`,
                `📧 *Email:* ${email}`,
                `📱 *Phone:* ${phone}`,
                ``,
                `📍 *Destination:* ${destination || "Not specified"}`,
                `📅 *Travel Date:* ${formatReadableDate(travelDate)}`,
                `👥 *Travelers:* ${travelers || "Not specified"}`,
                ``,
                `💬 *Trip Details:*`,
                `${message || "No additional details"}`,
                ``,
                `━━━━━━━━━━━━━━━━━━`,
                `🌐 ${CONFIG.brandName}`
            ].join("\n");

            const whatsappURL = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            // Open WhatsApp in a new tab so the confirmation stays visible
            const popup = window.open(whatsappURL, "_blank", "noopener,noreferrer");

            // Fallback if browser blocks popups
            if (!popup) {
                window.location.href = whatsappURL;
            }

            showStatusMessage("Inquiry prepared! Please click Send inside WhatsApp to complete your request.");
            bookingForm.reset();
        });
    }

});
