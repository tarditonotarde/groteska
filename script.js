/* ==========================================================
   GROTESKA
   script.js
========================================================== */

class Groteska {

    constructor() {

        this.cache();

        this.events();

        this.reveal();

        this.images();

        this.cursor();

        this.progress();

    }

    cache() {

        this.headerElement = document.querySelector(".header");

        this.cursorElement = document.querySelector(".cursor");

        this.menu = document.querySelector(".menu-overlay");

        this.menuButton = document.querySelector(".menu");

        this.progressBar = document.querySelector(".progress");

        this.menuClose = document.querySelector(".menu-close");

        this.previous = 0;

    }

    events() {

        window.addEventListener("scroll", () => {

            this.scrollHeader();

            this.scrollProgress();

        });

        window.addEventListener("mousemove", (e) => {

            this.moveCursor(e);

        });

        if (this.menuButton && this.menu) {

            this.menuButton.addEventListener("click", () => {

                this.toggleMenu();

            });

        }

        if (this.menuClose) {

            this.menuClose.addEventListener("click", () => {

                this.closeMenu();

            });

        }

        document.querySelectorAll(".menu-content a").forEach(link => {

            link.addEventListener("click", () => {

                this.closeMenu();

            });

        });

        document.addEventListener("keydown", (e) => {

            if (e.key === "Escape") {

                this.closeMenu();

            }

        });

    }

    toggleMenu() {

        this.menu.classList.toggle("active");

        document.body.classList.toggle("menu-open");

    }

    closeMenu() {

        if (!this.menu) return;

        this.menu.classList.remove("active");

        document.body.classList.remove("menu-open");

    }



    scrollHeader() {

        if (!this.headerElement) return;

        const current = window.scrollY;

        if (current > this.previous && current > 120) {

            this.headerElement.style.transform = "translateY(-100%)";

        } else {

            this.headerElement.style.transform = "translateY(0)";

        }

        this.previous = current;

    }

    reveal() {

        const items = document.querySelectorAll(".reveal");

        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                }

            });

        }, {

            threshold: 0.15

        });

        items.forEach(item => observer.observe(item));

    }

    images() {

        document.querySelectorAll("img").forEach(img => {

            if (img.complete) {

                img.classList.add("loaded");

            } else {

                img.addEventListener("load", () => {

                    img.classList.add("loaded");

                });

            }

        });

    }

    cursor() {

        if (!this.cursorElement) return;

        document.querySelectorAll(".look img, .button, .look-link").forEach(item => {

            item.addEventListener("mouseenter", () => {

                this.cursorElement.classList.add("active");

            });

            item.addEventListener("mouseleave", () => {

                this.cursorElement.classList.remove("active");

            });

        });

    }

    moveCursor(e) {

        if (!this.cursorElement) return;

        this.cursorElement.style.left = e.clientX + "px";

        this.cursorElement.style.top = e.clientY + "px";

    }

    progress() {

        this.scrollProgress();

    }

    scrollProgress() {

        if (!this.progressBar) return;

        const doc = document.documentElement;

        const total = doc.scrollHeight - doc.clientHeight;

        const percent = total > 0 ? (window.scrollY / total) * 100 : 0;

        this.progressBar.style.width = percent + "%";

    }

}

document.addEventListener("DOMContentLoaded", () => {

    new Groteska();

});

/* ==========================================
BACK TO TOP
========================================== */

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

/* ==========================================
LANGUAGE SWITCHER
========================================== */

const buttons = document.querySelectorAll(".lang");

const language = localStorage.getItem("lang") || "en";

setLanguage(language);

buttons.forEach(button => {

    button.addEventListener("click", () => {

        setLanguage(button.dataset.lang);

    });

});

function setLanguage(lang) {

    localStorage.setItem("lang", lang);

    document.documentElement.lang = lang;

    buttons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.lang === lang
        );

    });

    /* ---------- TEXT ---------- */

    document.querySelectorAll("[data-en]").forEach(el => {

        const value = el.getAttribute(`data-${lang}`);

        if (value !== null) {

            el.innerHTML = value;

        }

    });

    /* ---------- PLACEHOLDER ---------- */

    document.querySelectorAll("[data-placeholder-en]").forEach(el => {

        const value = el.getAttribute(`data-placeholder-${lang}`);

        if (value !== null) {

            el.placeholder = value;

        }

    });

    /* ---------- ALT ---------- */

    document.querySelectorAll("[data-alt-en]").forEach(el => {

        const value = el.getAttribute(`data-alt-${lang}`);

        if (value !== null) {

            el.alt = value;

        }

    });

    /* ---------- TITLE ---------- */

    document.querySelectorAll("[data-title-en]").forEach(el => {

        const value = el.getAttribute(`data-title-${lang}`);

        if (value !== null) {

            el.title = value;

        }

    });

    /* ---------- ARIA LABEL ---------- */

    document.querySelectorAll("[data-aria-en]").forEach(el => {

        const value = el.getAttribute(`data-aria-${lang}`);

        if (value !== null) {

            el.setAttribute("aria-label", value);

        }

    });

}

/* ==========================================
NEWSLETTER
========================================== */

const newsletterForm = document.getElementById("newsletter-form");

const newsletterMessage = document.getElementById("newsletter-message");

if (newsletterForm) {

    newsletterForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const data = new FormData(newsletterForm);

        try {

            const response = await fetch(newsletterForm.action, {

                method: "POST",

                body: data,

                headers: {
                    "Accept": "application/json"
                }

            });

            const lang = localStorage.getItem("lang") || "en";

            const success = {

                en: "✓ You're in. Welcome to Groteska.",

                es: "✓ Ya formas parte del Club.",

                it: "✓ Benvenuto nel Club."

            };

            const error = {

                en: "Something went wrong. Please try again.",

                es: "Ha ocurrido un error. Inténtalo de nuevo.",

                it: "Si è verificato un errore. Riprova."

            };

            if (response.ok) {

                newsletterMessage.textContent = success[lang];

                newsletterMessage.className = "success";

                newsletterForm.reset();

            } else {

                newsletterMessage.textContent = error[lang];

                newsletterMessage.className = "error";

            }

        } catch {

            const lang = localStorage.getItem("lang") || "en";

            const error = {

                en: "Something went wrong. Please try again.",

                es: "Ha ocurrido un error. Inténtalo de nuevo.",

                it: "Si è verificato un errore. Riprova."

            };

            newsletterMessage.textContent = error[lang];

            newsletterMessage.className = "error";

        }

    });

}

/* ==========================================
CONTACT
========================================== */

const contactForm = document.getElementById("contact-form");

const contactMessage = document.getElementById("contact-message");

if (contactForm) {

    contactForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const data = new FormData(contactForm);

        const lang = localStorage.getItem("lang") || "en";

        const success = {

            en: "✓ Message sent. We'll be in touch soon.",

            es: "✓ Mensaje enviado. Te responderemos pronto.",

            it: "✓ Messaggio inviato. Ti risponderemo al più presto."

        };

        const error = {

            en: "Something went wrong. Please try again.",

            es: "Ha ocurrido un error. Inténtalo de nuevo.",

            it: "Si è verificato un errore. Riprova."

        };

        try {

            const response = await fetch(contactForm.action, {

                method: "POST",

                body: data,

                headers: {
                    Accept: "application/json"
                }

            });

            if (response.ok) {

                contactMessage.textContent = success[lang];

                contactMessage.className = "success";

                contactForm.reset();

            } else {

                contactMessage.textContent = error[lang];

                contactMessage.className = "error";

            }

        } catch {

            contactMessage.textContent = error[lang];

            contactMessage.className = "error";

        }

    });

}

/* ==========================================
SHOP CATEGORIES FILTER
========================================== */

/* Groteska shop category filters */
document.addEventListener('DOMContentLoaded', () => {
    const shop = document.querySelector('#shop.collection');
    if (!shop) return;
    const buttons = shop.querySelectorAll('.shop-category');
    const products = shop.querySelectorAll('article[data-category]');
    const quotes = shop.querySelectorAll('[data-category].editorial-quote');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            buttons.forEach(item => {
                const active = item === button;
                item.classList.toggle('active', active);
                item.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            products.forEach(product => {
                product.hidden = filter !== 'all' && product.dataset.category !== filter;
            });
            quotes.forEach(quote => {
                quote.hidden = filter !== 'all' && quote.dataset.category !== filter;
            });
        });
    });
});
