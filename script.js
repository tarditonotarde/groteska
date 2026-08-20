/* ==========================================================
   GROTESKA
   script.js — audited & optimized
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
        this.menuClose = document.querySelector(".menu-close");
        this.progressBar = document.querySelector(".progress");
        this.backToTop = document.getElementById("backToTop");

        this.previous = 0;

        this.scrollTicking = false;
        this.cursorTicking = false;

        this.cursorX = 0;
        this.cursorY = 0;

        this.lastFocusedElement = null;

        this.reduceMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        this.reduceMotion = this.reduceMotionQuery.matches;
    }

    events() {

        /* ---------------------------------------------
           Reduced motion
        --------------------------------------------- */

        if (this.reduceMotionQuery.addEventListener) {

            this.reduceMotionQuery.addEventListener(
                "change",
                (event) => {

                    this.reduceMotion = event.matches;

                    if (this.reduceMotion) {
                        this.showAllReveals();
                    }

                }
            );

        }

        /* ---------------------------------------------
           Scroll
        --------------------------------------------- */

        window.addEventListener(
            "scroll",
            () => this.requestScrollUpdate(),
            { passive: true }
        );

        /* ---------------------------------------------
           Custom cursor
        --------------------------------------------- */

        if (this.cursorElement) {

            window.addEventListener(
                "mousemove",
                (event) => this.requestCursorUpdate(event),
                { passive: true }
            );

        }

        /* ---------------------------------------------
           Mobile menu
        --------------------------------------------- */

        if (this.menuButton && this.menu) {

            this.menuButton.addEventListener(
                "click",
                () => this.toggleMenu()
            );

        }

        if (this.menuClose) {

            this.menuClose.addEventListener(
                "click",
                () => this.closeMenu(true)
            );

        }

        document
            .querySelectorAll(".menu-content a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => this.closeMenu(true)
                );

            });

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    !this.menu ||
                    !this.menu.classList.contains("active")
                ) {
                    return;
                }

                /* ESC closes menu */

                if (event.key === "Escape") {

                    event.preventDefault();

                    this.closeMenu(true);

                    return;

                }

                /* Keep keyboard focus inside menu */

                if (event.key === "Tab") {

                    this.trapFocus(event);

                }

            }
        );

        /* ---------------------------------------------
           Back to top
        --------------------------------------------- */

        if (this.backToTop) {

            this.backToTop.addEventListener(
                "click",
                () => {

                    window.scrollTo({
                        top: 0,
                        behavior: this.reduceMotion
                            ? "auto"
                            : "smooth"
                    });

                }
            );

        }

    }

    /* ======================================================
       MOBILE MENU
    ====================================================== */

    toggleMenu() {

        if (!this.menu) return;

        if (
            this.menu.classList.contains("active")
        ) {

            this.closeMenu(true);

        } else {

            this.openMenu();

        }

    }

    openMenu() {

        if (!this.menu) return;

        this.lastFocusedElement =
            document.activeElement;

        this.menu.classList.add("active");

        document.body.classList.add("menu-open");

        if (this.menuButton) {

            this.menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }

        this.menu.setAttribute(
            "aria-hidden",
            "false"
        );

        /* Move focus into menu */

        if (this.menuClose) {

            requestAnimationFrame(() => {

                this.menuClose.focus();

            });

        }

    }

    closeMenu(returnFocus = false) {

        if (!this.menu) return;

        this.menu.classList.remove("active");

        document.body.classList.remove("menu-open");

        if (this.menuButton) {

            this.menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

        this.menu.setAttribute(
            "aria-hidden",
            "true"
        );

        /* Return focus to the element that opened menu */

        if (
            returnFocus &&
            this.lastFocusedElement &&
            typeof this.lastFocusedElement.focus === "function"
        ) {

            requestAnimationFrame(() => {

                this.lastFocusedElement.focus();

            });

        }

    }

    trapFocus(event) {

        if (!this.menu) return;

        const focusable =
            this.menu.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

        if (!focusable.length) return;

        const first = focusable[0];

        const last =
            focusable[focusable.length - 1];

        /* Shift + Tab from first → last */

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {

            event.preventDefault();

            last.focus();

        }

        /* Tab from last → first */

        else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {

            event.preventDefault();

            first.focus();

        }

    }

    /* ======================================================
       SCROLL
    ====================================================== */

    requestScrollUpdate() {

        if (this.scrollTicking) return;

        this.scrollTicking = true;

        requestAnimationFrame(() => {

            this.scrollHeader();

            this.scrollProgress();

            this.updateBackToTop();

            this.scrollTicking = false;

        });

    }

    scrollHeader() {

        if (!this.headerElement) return;

        const current =
            window.scrollY;

        if (
            current > this.previous &&
            current > 120
        ) {

            this.headerElement.style.transform =
                "translateY(-100%)";

        } else {

            this.headerElement.style.transform =
                "translateY(0)";

        }

        this.previous = current;

    }

    updateBackToTop() {

        if (!this.backToTop) return;

        this.backToTop.classList.toggle(
            "show",
            window.scrollY > 500
        );

    }

    /* ======================================================
       REVEAL ANIMATIONS
    ====================================================== */

    reveal() {

        const items =
            document.querySelectorAll(".reveal");

        if (!items.length) return;

        /* Show immediately if reduced motion */

        if (
            this.reduceMotion ||
            !("IntersectionObserver" in window)
        ) {

            this.showAllReveals();

            return;

        }

        const observer =
            new IntersectionObserver(
                (entries, obs) => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show"
                            );

                            obs.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.15
                }
            );

        items.forEach(item => {

            observer.observe(item);

        });

    }

    showAllReveals() {

        document
            .querySelectorAll(".reveal")
            .forEach(item => {

                item.classList.add("show");

            });

    }

    /* ======================================================
       IMAGES
    ====================================================== */

    images() {

        document
            .querySelectorAll("img")
            .forEach(img => {

                if (
                    img.complete &&
                    img.naturalWidth > 0
                ) {

                    img.classList.add(
                        "loaded"
                    );

                } else {

                    img.addEventListener(
                        "load",
                        () => {

                            img.classList.add(
                                "loaded"
                            );

                        },
                        { once: true }
                    );

                    /*
                     * If an image fails, reveal it anyway
                     * so the page does not keep an invisible
                     * image forever.
                     */

                    img.addEventListener(
                        "error",
                        () => {

                            img.classList.add(
                                "loaded"
                            );

                        },
                        { once: true }
                    );

                }

            });

    }

    /* ======================================================
       CUSTOM CURSOR
    ====================================================== */

    cursor() {

        if (
            !this.cursorElement ||
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        ) {

            return;

        }

        document
            .querySelectorAll(
                ".look img, .button, .look-link"
            )
            .forEach(item => {

                item.addEventListener(
                    "mouseenter",
                    () => {

                        this.cursorElement.classList.add(
                            "active"
                        );

                    }
                );

                item.addEventListener(
                    "mouseleave",
                    () => {

                        this.cursorElement.classList.remove(
                            "active"
                        );

                    }
                );

            });

    }

    requestCursorUpdate(event) {

        this.cursorX =
            event.clientX;

        this.cursorY =
            event.clientY;

        if (this.cursorTicking) return;

        this.cursorTicking = true;

        requestAnimationFrame(() => {

            if (this.cursorElement) {

                this.cursorElement.style.left =
                    this.cursorX + "px";

                this.cursorElement.style.top =
                    this.cursorY + "px";

            }

            this.cursorTicking = false;

        });

    }

    /* Kept for compatibility */

    moveCursor(event) {

        this.requestCursorUpdate(event);

    }

    /* ======================================================
       PROGRESS BAR
    ====================================================== */

    progress() {

        this.scrollProgress();

        this.updateBackToTop();

    }

    scrollProgress() {

        if (!this.progressBar) return;

        const doc =
            document.documentElement;

        const total =
            doc.scrollHeight -
            doc.clientHeight;

        const percent =
            total > 0
                ? (
                    window.scrollY /
                    total
                ) * 100
                : 0;

        this.progressBar.style.width =
            percent + "%";

    }

}


/* ==========================================================
   INITIALIZE GROTESKA
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        new Groteska();

    }
);


/* ==========================================================
   LANGUAGE SWITCHER
========================================================== */

const languageButtons =
    document.querySelectorAll(".lang");

const savedLanguage =
    localStorage.getItem("lang") || "en";

setLanguage(savedLanguage);

languageButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            setLanguage(
                button.dataset.lang
            );

        }
    );

});


function setLanguage(lang) {

    localStorage.setItem(
        "lang",
        lang
    );

    document.documentElement.lang =
        lang;

    languageButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.lang === lang
        );

    });

    /* ---------------------------------------------
       Text content
    --------------------------------------------- */

    document
        .querySelectorAll("[data-en]")
        .forEach(element => {

            const value =
                element.getAttribute(
                    `data-${lang}`
                );

            if (value !== null) {

                element.innerHTML =
                    value;

            }

        });

    /* ---------------------------------------------
       Placeholders
    --------------------------------------------- */

    document
        .querySelectorAll(
            "[data-placeholder-en]"
        )
        .forEach(element => {

            const value =
                element.getAttribute(
                    `data-placeholder-${lang}`
                );

            if (value !== null) {

                element.placeholder =
                    value;

            }

        });

    /* ---------------------------------------------
       ALT text
    --------------------------------------------- */

    document
        .querySelectorAll(
            "[data-alt-en]"
        )
        .forEach(element => {

            const value =
                element.getAttribute(
                    `data-alt-${lang}`
                );

            if (value !== null) {

                element.alt =
                    value;

            }

        });

    /* ---------------------------------------------
       Title
    --------------------------------------------- */

    document
        .querySelectorAll(
            "[data-title-en]"
        )
        .forEach(element => {

            const value =
                element.getAttribute(
                    `data-title-${lang}`
                );

            if (value !== null) {

                element.title =
                    value;

            }

        });

    /* ---------------------------------------------
       ARIA labels
    --------------------------------------------- */

    document
        .querySelectorAll(
            "[data-aria-en]"
        )
        .forEach(element => {

            const value =
                element.getAttribute(
                    `data-aria-${lang}`
                );

            if (value !== null) {

                element.setAttribute(
                    "aria-label",
                    value
                );

            }

        });

}


/* ==========================================================
   NEWSLETTER
========================================================== */

const newsletterForm =
    document.getElementById(
        "newsletter-form"
    );

const newsletterMessage =
    document.getElementById(
        "newsletter-message"
    );


if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const data =
                new FormData(
                    newsletterForm
                );

            const lang =
                localStorage.getItem(
                    "lang"
                ) || "en";

            const success = {

                en:
                    "✓ You're in. Welcome to Groteska.",

                es:
                    "✓ Ya formas parte del Club.",

                it:
                    "✓ Benvenuto nel Club."

            };

            const error = {

                en:
                    "Something went wrong. Please try again.",

                es:
                    "Ha ocurrido un error. Inténtalo de nuevo.",

                it:
                    "Si è verificato un errore. Riprova."

            };

            try {

                const response =
                    await fetch(
                        newsletterForm.action,
                        {
                            method: "POST",
                            body: data,
                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );

                if (response.ok) {

                    if (newsletterMessage) {

                        newsletterMessage.textContent =
                            success[lang];

                        newsletterMessage.className =
                            "success";

                    }

                    newsletterForm.reset();

                } else {

                    if (newsletterMessage) {

                        newsletterMessage.textContent =
                            error[lang];

                        newsletterMessage.className =
                            "error";

                    }

                }

            } catch (errorObject) {

                if (newsletterMessage) {

                    newsletterMessage.textContent =
                        error[lang];

                    newsletterMessage.className =
                        "error";

                }

            }

        }
    );

}


/* ==========================================================
   CONTACT FORM
========================================================== */

const contactForm =
    document.getElementById(
        "contact-form"
    );

const contactMessage =
    document.getElementById(
        "contact-message"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const data =
                new FormData(
                    contactForm
                );

            const lang =
                localStorage.getItem(
                    "lang"
                ) || "en";

            const success = {

                en:
                    "✓ Message sent. We'll be in touch soon.",

                es:
                    "✓ Mensaje enviado. Te responderemos pronto.",

                it:
                    "✓ Messaggio inviato. Ti risponderemo al più presto."

            };

            const error = {

                en:
                    "Something went wrong. Please try again.",

                es:
                    "Ha ocurrido un error. Inténtalo de nuevo.",

                it:
                    "Si è verificato un errore. Riprova."

            };

            try {

                const response =
                    await fetch(
                        contactForm.action,
                        {
                            method: "POST",
                            body: data,
                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );

                if (response.ok) {

                    if (contactMessage) {

                        contactMessage.textContent =
                            success[lang];

                        contactMessage.className =
                            "success";

                    }

                    contactForm.reset();

                } else {

                    if (contactMessage) {

                        contactMessage.textContent =
                            error[lang];

                        contactMessage.className =
                            "error";

                    }

                }

            } catch (errorObject) {

                if (contactMessage) {

                    contactMessage.textContent =
                        error[lang];

                    contactMessage.className =
                        "error";

                }

            }

        }
    );

}


/* ==========================================================
   SHOP CATEGORY FILTER
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const shop =
            document.querySelector(
                "#shop.collection"
            );

        if (!shop) return;

        const categoryButtons =
            shop.querySelectorAll(
                ".shop-category"
            );

        const products =
            shop.querySelectorAll(
                "article[data-category]"
            );

        const quotes =
            shop.querySelectorAll(
                "[data-category].editorial-quote"
            );

        categoryButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.dataset.filter;

                    categoryButtons.forEach(
                        item => {

                            const active =
                                item === button;

                            item.classList.toggle(
                                "active",
                                active
                            );

                            item.setAttribute(
                                "aria-pressed",
                                active
                                    ? "true"
                                    : "false"
                            );

                        }
                    );

                    products.forEach(
                        product => {

                            product.hidden =
                                filter !== "all" &&
                                product.dataset.category !==
                                filter;

                        }
                    );

                    quotes.forEach(
                        quote => {

                            quote.hidden =
                                filter !== "all" &&
                                quote.dataset.category !==
                                filter;

                        }
                    );

                }
            );

        });

    }
);


/* ==========================================================
   COOKIE BANNER
========================================================== */

(function () {
    const CONSENT_KEY = "groteska_cookie_consent";
    const GA_ID = "G-C589S8K7GR";
    const banner = document.getElementById("cookie-banner");
    const panel = document.getElementById("cookie-panel");
    const accept = document.getElementById("cookie-accept");
    const reject = document.getElementById("cookie-reject");
    const configure = document.getElementById("cookie-configure");
    const save = document.getElementById("cookie-save");
    const analyticsCheckbox = document.getElementById("analytics-consent");
    const manage = document.getElementById("cookie-manage");

    function loadAnalytics() {
        if (window.__groteskaAnalyticsLoaded) return;

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag("js", new Date());
        gtag("config", GA_ID);

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        document.head.appendChild(script);

        window.__groteskaAnalyticsLoaded = true;
    }

    function setConsent(value) {
        localStorage.setItem(CONSENT_KEY, value);

        if (value === "accepted") {
            loadAnalytics();
        }

        banner.hidden = true;
        panel.hidden = true;
        manage.classList.add("is-visible");
    }

    function showBanner() {
        banner.hidden = false;
        manage.classList.remove("is-visible");
    }

    function showPanel() {
        panel.hidden = false;
        analyticsCheckbox.checked =
            localStorage.getItem(CONSENT_KEY) === "accepted";
    }

    const storedConsent = localStorage.getItem(CONSENT_KEY);

    if (!storedConsent) {
        showBanner();
    } else {
        manage.classList.add("is-visible");
        if (storedConsent === "accepted") {
            loadAnalytics();
        }
    }

    accept.addEventListener("click", function () {
        setConsent("accepted");
    });

    reject.addEventListener("click", function () {
        setConsent("rejected");
    });

    configure.addEventListener("click", function () {
        showPanel();
    });

    save.addEventListener("click", function () {
        setConsent(analyticsCheckbox.checked ? "accepted" : "rejected");
    });

    manage.addEventListener("click", function () {
        showBanner();
        showPanel();
    });
})();



/* ==========================================================
   SHOP SEARCH — PRODUCT ONLY / SMART TAG SUGGESTIONS
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const collection =
        document.querySelector("#shop.collection");

    const searchInput =
        document.getElementById("shop-search-input");

    const clearButton =
        document.getElementById("shop-search-clear");

    const suggestions =
        document.getElementById("shop-search-suggestions");

    const status =
        document.getElementById("shop-search-status");


    if (!collection || !searchInput) return;


    /* ==========================================================
       PRODUCTS
       ========================================================== */

    const products =
        Array.from(
            collection.querySelectorAll(
                "article[data-category]"
            )
        );


    /* ==========================================================
       CATEGORY BUTTONS
       ========================================================== */

    const categoryButtons =
        Array.from(
            collection.querySelectorAll(
                ".shop-category"
            )
        );


    /* ==========================================================
       EDITORIAL QUOTES
       ========================================================== */

    const editorialQuotes =
        Array.from(
            collection.querySelectorAll(
                ".editorial-quote[data-category]"
            )
        );


    /* ==========================================================
       STATE
       ========================================================== */

    let activeCategory = "all";

    let selectedSuggestionIndex = -1;


    /* ==========================================================
       HELPERS
       ========================================================== */

    const normalize = value =>
        String(value || "")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .replace(
                /[’']/g,
                ""
            )
            .replace(
                /[^a-z0-9]+/g,
                " "
            )
            .trim();


    const unique = values =>
        [
            ...new Set(
                values.filter(Boolean)
            )
        ];


    /* ==========================================================
       STOP WORDS
       ========================================================== */

    const STOP_WORDS =
        new Set([
            "the",
            "and",
            "with",
            "from",
            "for",
            "you",
            "would",
            "graphic",
            "shirt",
            "t",
            "tshirt",
            "camiseta",
            "camisetas",
            "maglietta",
            "editorial",
            "campaign",
            "light",
            "full",
            "color",
            "italian",
            "italiana",
            "italiano"
        ]);


    /* ==========================================================
       CLOSE SUGGESTIONS
       ========================================================== */

    function closeSuggestions() {

        if (!suggestions) return;

        suggestions.innerHTML = "";

        suggestions.hidden = true;

        selectedSuggestionIndex = -1;
    }


    /* ==========================================================
       PRODUCT INDEX
       
       IMPORTANT:
       Only real product cards are indexed.
       Editorial quotes are NEVER search results.
       ========================================================== */

    function buildProductData(product) {

        const title =
            product
                .querySelector(".look-title")
                ?.textContent || "";


        const imageAlt =
            product
                .querySelector("img")
                ?.alt || "";


        const category =
            product.dataset.category || "";


        const url =
            product
                .querySelector(".look-link")
                ?.href || "";


        const sourceText = [

            title,

            imageAlt,

            category.replace(
                /-/g,
                " "
            ),

            url

        ].join(" ");


        const normalized =
            normalize(
                sourceText
            );


        /* ----------------------------------------------------------
           Useful phrases for suggestions
           ---------------------------------------------------------- */

        const phraseTags = [

            title.trim(),

            imageAlt
                .replace(
                    /\bgraphic\b/gi,
                    ""
                )
                .replace(
                    /\bt-?shirt\b/gi,
                    ""
                )
                .replace(
                    /\bwith\b/gi,
                    ""
                )
                .replace(
                    /\beditorial campaign\b/gi,
                    ""
                )
                .trim()

        ];


        /* ----------------------------------------------------------
           Individual searchable words
           ---------------------------------------------------------- */

        const wordTags =
            sourceText

                .split(
                    /[\s,|&/().:?'"“”–—-]+/
                )

                .map(
                    word =>
                        word.trim()
                )

                .filter(word => {

                    const n =
                        normalize(
                            word
                        );

                    return (
                        n.length >= 3 &&
                        !STOP_WORDS.has(n) &&
                        !/^\d+$/.test(n)
                    );

                });


        const tags =
            unique([
                ...phraseTags,
                ...wordTags
            ])

                .map(
                    tag =>
                        tag.trim()
                )

                .filter(
                    tag =>
                        tag.length > 2
                )

                .slice(
                    0,
                    14
                );


        return {

            element: product,

            title:
                title.trim(),

            category,

            url,

            normalized,

            tags

        };
    }


    const productIndex =
        products.map(
            buildProductData
        );


    /* ==========================================================
       SUGGESTION POOL
       
       Suggestions come from ALL products,
       regardless of selected category.
       ========================================================== */

    const suggestionPool =
        unique(
            productIndex.flatMap(
                product =>
                    product.tags
            )
        );


    /* ==========================================================
       SEARCH TOKENS
       ========================================================== */

    function getTokens(value) {

        return normalize(value)

            .split(/\s+/)

            .filter(Boolean);
    }


    /* ==========================================================
       PRODUCT MATCHING
       ========================================================== */

    function productMatches(
        product,
        query
    ) {

        if (!query) return true;


        const tokens =
            getTokens(
                query
            );


        /*
         * Every word typed must match
         * somewhere inside the product.
         */

        return tokens.every(
            token =>
                product.normalized
                    .includes(token)
        );
    }


    /* ==========================================================
       SMART SUGGESTIONS
       ========================================================== */

    function getSuggestions(query) {

        const normalizedQuery =
            normalize(query);


        if (!normalizedQuery) {
            return [];
        }


        const tokens =
            getTokens(
                normalizedQuery
            );


        return suggestionPool

            .map(label => {

                const normalizedLabel =
                    normalize(label);


                let score = 0;


                /* Exact match */

                if (
                    normalizedLabel ===
                    normalizedQuery
                ) {

                    score += 100;
                }


                /* Starts with search */

                if (
                    normalizedLabel.startsWith(
                        normalizedQuery
                    )
                ) {

                    score += 60;
                }


                /* Contains search */

                if (
                    normalizedLabel.includes(
                        normalizedQuery
                    )
                ) {

                    score += 30;
                }


                /* Individual words */

                tokens.forEach(
                    token => {

                        if (
                            normalizedLabel.includes(
                                token
                            )
                        ) {

                            score += 12;
                        }

                    }
                );


                return {
                    label,
                    score
                };

            })

            .filter(
                item =>
                    item.score > 0
            )

            .sort(
                (a, b) =>
                    b.score - a.score ||
                    a.label.localeCompare(
                        b.label
                    )
            )

            .slice(
                0,
                6
            );
    }


    /* ==========================================================
       HIGHLIGHT SEARCH
       ========================================================== */

    function highlightMatch(
        text,
        query
    ) {

        const tokens =
            getTokens(query)
                .sort(
                    (a, b) =>
                        b.length -
                        a.length
                );


        let output =
            String(text);


        tokens.forEach(
            token => {

                const escaped =
                    token.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );


                output =
                    output.replace(
                        new RegExp(
                            `(${escaped})`,
                            "ig"
                        ),
                        "<mark>$1</mark>"
                    );

            }
        );


        return output;
    }


    /* ==========================================================
       RENDER SUGGESTIONS
       ========================================================== */

    function renderSuggestions(
        query
    ) {

        if (!suggestions) return;


        const items =
            getSuggestions(
                query
            );


        /*
         * Nothing typed or no matches:
         * hide suggestions.
         */

        if (
            !query ||
            !items.length
        ) {

            closeSuggestions();

            return;
        }


        suggestions.innerHTML =
            items

                .map(
                    (item, index) => `

                        <button
                            type="button"
                            class="shop-search-suggestion"
                            role="option"
                            aria-selected="${index ===
                        selectedSuggestionIndex
                        }"
                            data-suggestion="${item.label
                            .replace(
                                /"/g,
                                "&quot;"
                            )
                        }"
                        >

                            <span
                                class="shop-search-suggestion-icon"
                            >
                                ⌕
                            </span>

                            <span>
                                ${highlightMatch(
                            item.label,
                            query
                        )}
                            </span>

                        </button>

                    `
                )

                .join("");


        suggestions.hidden = false;


        /*
         * Clicking a suggestion:
         *
         * 1. fills search
         * 2. searches ALL products
         * 3. keeps current category visually selected
         * 4. closes suggestions
         */

        suggestions
            .querySelectorAll(
                ".shop-search-suggestion"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "mousedown",
                        event => {

                            event.preventDefault();


                            searchInput.value =
                                button.dataset
                                    .suggestion ||
                                "";


                            selectedSuggestionIndex =
                                -1;


                            filterProducts(
                                false
                            );


                            closeSuggestions();


                            searchInput.focus();

                        }
                    );

                }
            );
    }


    /* ==========================================================
       RESULT COUNT
       ========================================================== */

    function updateStatus(
        count,
        query
    ) {

        if (!status) return;


        if (!query) {

            status.textContent =
                "";

            return;
        }


        const lang =
            localStorage.getItem(
                "lang"
            ) || "en";


        const messages = {

            en: value =>
                `${value} ${value === 1
                    ? "product"
                    : "products"
                }`,

            es: value =>
                `${value} ${value === 1
                    ? "producto"
                    : "productos"
                }`,

            it: value =>
                `${value} ${value === 1
                    ? "prodotto"
                    : "prodotti"
                }`

        };


        status.textContent =
            (
                messages[lang] ||
                messages.en
            )(count);
    }


    /* ==========================================================
       FILTER PRODUCTS
       
       IMPORTANT BEHAVIOUR:
       
       NO SEARCH:
           category filter works normally.
       
       WITH SEARCH:
           search ALL products.
           Active category is temporarily ignored.
       
       This means:
       
       Cinema + "Pavarotti"
           → searches ALL products
       
       Clear search
           → returns to Cinema
       ========================================================== */

    function filterProducts(
        showSuggestions = true
    ) {

        const query =
            searchInput.value.trim();


        let visibleCount =
            0;


        /* ========================================================
           PRODUCTS
           ======================================================== */

        productIndex.forEach(
            product => {

                /*
                 * Category matching
                 */

                const matchesCategory =
                    activeCategory === "all" ||
                    product.category ===
                    activeCategory;


                /*
                 * Search matching
                 */

                const matchesSearch =
                    productMatches(
                        product,
                        query
                    );


                /*
                 * SEARCH HAS PRIORITY
                 *
                 * If there is text in the search
                 * field, search across ALL products.
                 *
                 * If search is empty, use the
                 * selected category normally.
                 */

                const visible =
                    query
                        ? matchesSearch
                        : matchesCategory;


                product.element.hidden =
                    !visible;


                if (visible) {

                    visibleCount++;
                }

            }
        );


        /* ========================================================
           EDITORIAL QUOTES
           
           Never show quotes while searching.
           ======================================================== */

        editorialQuotes.forEach(
            quote => {

                const quoteCategory =
                    quote.dataset.category ||
                    "";


                quote.hidden =
                    Boolean(query) ||

                    (
                        activeCategory !==
                        "all" &&

                        quoteCategory !==
                        activeCategory
                    );
            }
        );


        /* ========================================================
           CLEAR BUTTON
           ======================================================== */

        if (clearButton) {

            clearButton.hidden =
                !query;
        }


        /* ========================================================
           RESULT COUNT
           ======================================================== */

        updateStatus(
            visibleCount,
            query
        );


        /* ========================================================
           AUTOCOMPLETE
           ======================================================== */

        if (showSuggestions) {

            renderSuggestions(
                query
            );
        }

    }


    /* ==========================================================
       CATEGORY FILTERS
       ========================================================== */

    categoryButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    activeCategory =
                        button.dataset.filter ||
                        "all";


                    /*
                     * Update active button
                     */

                    categoryButtons.forEach(
                        item => {

                            const active =
                                item ===
                                button;


                            item.classList.toggle(
                                "active",
                                active
                            );


                            item.setAttribute(
                                "aria-pressed",
                                active
                                    ? "true"
                                    : "false"
                            );

                        }
                    );


                    /*
                     * Close suggestions
                     */

                    closeSuggestions();


                    /*
                     * IMPORTANT:
                     *
                     * If a search is currently active,
                     * changing the category does NOT
                     * restrict the search.
                     *
                     * The search continues across
                     * ALL products.
                     */

                    filterProducts(
                        false
                    );

                }
            );

        }
    );


    /* ==========================================================
       SEARCH INPUT
       ========================================================== */

    searchInput.addEventListener(
        "input",
        () => {

            selectedSuggestionIndex =
                -1;


            /*
             * Search automatically takes priority
             * over the active category.
             */

            filterProducts(
                true
            );

        }
    );


    /* ==========================================================
       SEARCH FOCUS
       ========================================================== */

    searchInput.addEventListener(
        "focus",
        () => {

            const query =
                searchInput.value.trim();


            if (query) {

                renderSuggestions(
                    query
                );

            } else {

                /*
                 * Empty search =
                 * no suggestions.
                 */

                closeSuggestions();
            }

        }
    );


    /* ==========================================================
       KEYBOARD NAVIGATION
       ========================================================== */

    searchInput.addEventListener(
        "keydown",
        event => {

            const items =
                suggestions?.querySelectorAll(
                    ".shop-search-suggestion"
                ) || [];


            /* ----------------------------------------------------
               ARROW DOWN
               ---------------------------------------------------- */

            if (
                event.key ===
                "ArrowDown" &&
                items.length
            ) {

                event.preventDefault();


                selectedSuggestionIndex =
                    Math.min(
                        selectedSuggestionIndex +
                        1,
                        items.length - 1
                    );


                items.forEach(
                    (item, index) => {

                        const selected =
                            index ===
                            selectedSuggestionIndex;


                        item.classList.toggle(
                            "is-selected",
                            selected
                        );


                        item.setAttribute(
                            "aria-selected",
                            selected
                                ? "true"
                                : "false"
                        );

                    }
                );


                return;
            }


            /* ----------------------------------------------------
               ARROW UP
               ---------------------------------------------------- */

            if (
                event.key ===
                "ArrowUp" &&
                items.length
            ) {

                event.preventDefault();


                selectedSuggestionIndex =
                    Math.max(
                        selectedSuggestionIndex -
                        1,
                        0
                    );


                items.forEach(
                    (item, index) => {

                        const selected =
                            index ===
                            selectedSuggestionIndex;


                        item.classList.toggle(
                            "is-selected",
                            selected
                        );


                        item.setAttribute(
                            "aria-selected",
                            selected
                                ? "true"
                                : "false"
                        );

                    }
                );


                return;
            }


            /* ----------------------------------------------------
               ENTER
               ---------------------------------------------------- */

            if (
                event.key ===
                "Enter" &&

                selectedSuggestionIndex >= 0 &&

                items[
                selectedSuggestionIndex
                ]
            ) {

                event.preventDefault();


                searchInput.value =
                    items[
                        selectedSuggestionIndex
                    ]
                        .dataset
                        .suggestion ||
                    "";


                selectedSuggestionIndex =
                    -1;


                /*
                 * Apply search across ALL products.
                 */

                filterProducts(
                    false
                );


                closeSuggestions();


                return;
            }


            /* ----------------------------------------------------
               ESC
               ---------------------------------------------------- */

            if (
                event.key ===
                "Escape"
            ) {

                /*
                 * First ESC:
                 * close suggestions.
                 */

                if (
                    suggestions &&
                    !suggestions.hidden
                ) {

                    closeSuggestions();

                    return;
                }


                /*
                 * Second ESC:
                 * clear search.
                 *
                 * The selected category is then
                 * automatically restored.
                 */

                if (
                    searchInput.value
                ) {

                    searchInput.value =
                        "";


                    filterProducts(
                        false
                    );

                }

            }

        }
    );


    /* ==========================================================
       CLEAR BUTTON
       ========================================================== */

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                searchInput.value =
                    "";


                selectedSuggestionIndex =
                    -1;


                closeSuggestions();


                /*
                 * Search is empty again,
                 * so the active category
                 * becomes effective.
                 */

                filterProducts(
                    false
                );


                searchInput.focus();

            }
        );

    }


    /* ==========================================================
       CLICK OUTSIDE
       ========================================================== */

    document.addEventListener(
        "mousedown",
        event => {

            if (
                !event.target.closest(
                    ".shop-search"
                )
            ) {

                closeSuggestions();
            }

        }
    );


    /* ==========================================================
       BLUR
       ========================================================== */

    searchInput.addEventListener(
        "blur",
        () => {

            /*
             * Small delay allows clicking
             * a suggestion before closing.
             */

            setTimeout(
                () => {
                    closeSuggestions();
                },
                150
            );

        }
    );


    /* ==========================================================
       INITIAL STATE
       ========================================================== */

    filterProducts(
        false
    );

});