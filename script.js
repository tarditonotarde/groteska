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