/* ==========================================================
   GROTESKA — interaction layer
   v3: consolidated search/filter logic, stable clear button,
   accessibility and language metadata updates.
========================================================== */

(function () {
    "use strict";

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const LANGS = ["en", "es", "it"];
    const getLanguage = () => {
        const stored = localStorage.getItem("lang");
        return LANGS.includes(stored) ? stored : "en";
    };

    const prefersReducedMotion = () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function updateLocalizedContent(lang) {
        document.documentElement.lang = lang;
        localStorage.setItem("lang", lang);

        $$(".lang").forEach((button) => {
            const active = button.dataset.lang === lang;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        $$(`[data-${lang}]`).forEach((element) => {
            /* Don't overwrite metadata/content through arbitrary HTML when the
               value is absent. Existing data-* values remain the source of truth. */
            const value = element.getAttribute(`data-${lang}`);
            if (value !== null) element.innerHTML = value;
        });

        $$(`[data-placeholder-${lang}]`).forEach((element) => {
            const value = element.getAttribute(`data-placeholder-${lang}`);
            if (value !== null) element.setAttribute("placeholder", value);
        });

        $$(`[data-alt-${lang}]`).forEach((element) => {
            const value = element.getAttribute(`data-alt-${lang}`);
            if (value !== null) element.alt = value;
        });

        $$(`[data-title-${lang}]`).forEach((element) => {
            const value = element.getAttribute(`data-title-${lang}`);
            if (value !== null) element.title = value;
        });

        $$(`[data-aria-${lang}]`).forEach((element) => {
            const value = element.getAttribute(`data-aria-${lang}`);
            if (value !== null) element.setAttribute("aria-label", value);
        });

        const title = $("title");
        const description = $("meta[name='description']");
        const ogTitle = $("meta[property='og:title']");
        const ogDescription = $("meta[property='og:description']");
        const twitterTitle = $("meta[name='twitter:title']");
        const twitterDescription = $("meta[name='twitter:description']");
        const ogLocale = $("meta[property='og:locale']");

        if (title) {
            const value = title.getAttribute(`data-${lang}`);
            if (value) document.title = value;
        }

        if (description) {
            const value = description.getAttribute(`data-${lang}`);
            if (value) description.content = value;
        }

        if (ogTitle) ogTitle.content = document.title;
        if (ogDescription && description) ogDescription.content = description.content;
        if (twitterTitle) twitterTitle.content = document.title;
        if (twitterDescription && description) twitterDescription.content = description.content;
        if (ogLocale) {
            ogLocale.content = {
                en: "en_GB",
                es: "es_ES",
                it: "it_IT"
            }[lang] || "en_GB";
        }
    }

    function initLanguage() {
        const lang = getLanguage();
        updateLocalizedContent(lang);

        $$(".lang").forEach((button) => {
            button.addEventListener("click", () => {
                updateLocalizedContent(button.dataset.lang || "en");
            });
        });
    }

    function initScrollUI() {
        const header = $(".header");
        const progress = $(".progress");
        const backToTop = $("#backToTop");
        let lastScroll = window.scrollY;
        let ticking = false;

        const update = () => {
            const current = window.scrollY;
            const doc = document.documentElement;
            const scrollable = Math.max(doc.scrollHeight - doc.clientHeight, 1);
            const percent = Math.min(100, Math.max(0, current / scrollable * 100));

            if (progress) progress.style.width = `${percent}%`;

            if (header) {
                header.style.transform = current > lastScroll && current > 120
                    ? "translateY(-100%)"
                    : "translateY(0)";
            }

            if (backToTop) backToTop.classList.toggle("show", current > 500);

            lastScroll = current;
            ticking = false;
        };

        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        window.addEventListener("scroll", requestUpdate, { passive: true });
        update();

        if (backToTop) {
            backToTop.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion() ? "auto" : "smooth"
                });
            });
        }
    }

    function initReveal() {
        const items = $$(".reveal");
        if (!items.length) return;

        if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
            items.forEach((item) => item.classList.add("show"));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("show");
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        items.forEach((item) => observer.observe(item));
    }

    function initImages() {
        $$("img").forEach((img) => {
            const markLoaded = () => img.classList.add("loaded");
            if (img.complete) markLoaded();
            else {
                img.addEventListener("load", markLoaded, { once: true });
                img.addEventListener("error", markLoaded, { once: true });
            }
        });
    }

    function initCursor() {
        const cursor = $(".cursor");
        if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

        let x = 0;
        let y = 0;
        let ticking = false;

        const paint = () => {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            ticking = false;
        };

        window.addEventListener("mousemove", (event) => {
            x = event.clientX;
            y = event.clientY;
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(paint);
        }, { passive: true });

        $$(".look img, .button, .look-link").forEach((element) => {
            element.addEventListener("mouseenter", () => cursor.classList.add("active"));
            element.addEventListener("mouseleave", () => cursor.classList.remove("active"));
        });
    }

    function initMobileMenu() {
        const menu = $(".menu-overlay");
        const menuButton = $(".menu");
        const menuClose = $(".menu-close");
        if (!menu || !menuButton) return;

        let lastFocused = null;

        const focusable = () => $$(`a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])`, menu);

        const close = (restoreFocus = false) => {
            menu.classList.remove("active");
            document.body.classList.remove("menu-open");
            menuButton.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");

            if (restoreFocus && lastFocused && typeof lastFocused.focus === "function") {
                requestAnimationFrame(() => lastFocused.focus());
            }
        };

        const open = () => {
            lastFocused = document.activeElement;
            menu.classList.add("active");
            document.body.classList.add("menu-open");
            menuButton.setAttribute("aria-expanded", "true");
            menu.setAttribute("aria-hidden", "false");
            requestAnimationFrame(() => menuClose?.focus());
        };

        menuButton.addEventListener("click", () => {
            menu.classList.contains("active") ? close(true) : open();
        });

        menuClose?.addEventListener("click", () => close(true));

        $$("a", menu).forEach((link) => {
            link.addEventListener("click", () => close(true));
        });

        document.addEventListener("keydown", (event) => {
            if (!menu.classList.contains("active")) return;

            if (event.key === "Escape") {
                event.preventDefault();
                close(true);
                return;
            }

            if (event.key !== "Tab") return;

            const elements = focusable();
            if (!elements.length) return;

            const first = elements[0];
            const last = elements[elements.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    function initForms() {
        const forms = [
            {
                id: "newsletter-form",
                messageId: "newsletter-message",
                success: {
                    en: "✓ You're in. Welcome to Groteska.",
                    es: "✓ Ya formas parte del Club.",
                    it: "✓ Benvenuto nel Club."
                },
                error: {
                    en: "Something went wrong. Please try again.",
                    es: "Ha ocurrido un error. Inténtalo de nuevo.",
                    it: "Si è verificato un errore. Riprova."
                }
            },
            {
                id: "contact-form",
                messageId: "contact-message",
                success: {
                    en: "✓ Message sent. We'll be in touch soon.",
                    es: "✓ Mensaje enviado. Te responderemos pronto.",
                    it: "✓ Messaggio inviato. Ti risponderemo al più presto."
                },
                error: {
                    en: "Something went wrong. Please try again.",
                    es: "Ha ocurrido un error. Inténtalo de nuevo.",
                    it: "Si è verificato un errore. Riprova."
                }
            }
        ];

        forms.forEach((config) => {
            const form = $(`#${config.id}`);
            const message = $(`#${config.messageId}`);
            if (!form) return;

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const submit = $("button[type='submit']", form);
                if (submit) submit.disabled = true;

                try {
                    const response = await fetch(form.action, {
                        method: "POST",
                        body: new FormData(form),
                        headers: { Accept: "application/json" }
                    });

                    const lang = getLanguage();
                    if (!response.ok) throw new Error("Request failed");

                    if (message) {
                        message.textContent = config.success[lang] || config.success.en;
                        message.className = "form-message success";
                    }
                    form.reset();
                } catch (error) {
                    const lang = getLanguage();
                    if (message) {
                        message.textContent = config.error[lang] || config.error.en;
                        message.className = "form-message error";
                    }
                } finally {
                    if (submit) submit.disabled = false;
                }
            });
        });
    }

    function initCookies() {
        const CONSENT_KEY = "groteska_cookie_consent";
        const GA_ID = "G-C589S8K7GR";
        const banner = $("#cookie-banner");
        const panel = $("#cookie-panel");
        const accept = $("#cookie-accept");
        const reject = $("#cookie-reject");
        const configure = $("#cookie-configure");
        const save = $("#cookie-save");
        const analytics = $("#analytics-consent");
        const manage = $("#cookie-manage");

        if (!banner) return;

        const loadAnalytics = () => {
            if (window.__groteskaAnalyticsLoaded) return;

            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag("js", new Date());
            window.gtag("config", GA_ID);

            const script = document.createElement("script");
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
            document.head.appendChild(script);
            window.__groteskaAnalyticsLoaded = true;
        };

        const setConsent = (value) => {
            localStorage.setItem(CONSENT_KEY, value);
            if (value === "accepted") loadAnalytics();
            banner.hidden = true;
            if (panel) panel.hidden = true;
            manage?.classList.add("is-visible");
        };

        const showBanner = () => {
            banner.hidden = false;
            if (manage) manage.classList.remove("is-visible");
        };

        const showPanel = () => {
            if (!panel) return;
            panel.hidden = false;
            if (analytics) analytics.checked = localStorage.getItem(CONSENT_KEY) === "accepted";
        };

        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) showBanner();
        else {
            manage?.classList.add("is-visible");
            if (stored === "accepted") loadAnalytics();
        }

        accept?.addEventListener("click", () => setConsent("accepted"));
        reject?.addEventListener("click", () => setConsent("rejected"));
        configure?.addEventListener("click", showPanel);
        save?.addEventListener("click", () => setConsent(analytics?.checked ? "accepted" : "rejected"));
        manage?.addEventListener("click", () => {
            showBanner();
            showPanel();
        });
    }

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[’']/g, "")
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    }

    function initShop() {
        const collection = $("#collection");
        const input = $("#shop-search-input");
        const clear = $("#shop-search-clear");
        const suggestions = $("#shop-search-suggestions");
        const status = $("#shop-search-status");
        if (!collection || !input) return;

        const products = $$(`article[data-category]`, collection).map((element) => {
            const title = $(".look-title", element)?.textContent.trim() || "";
            const alt = $("img", element)?.alt || "";
            const category = element.dataset.category || "";
            const source = normalize(`${title} ${alt} ${category.replace(/-/g, " ")}`);

            return {
                element,
                title,
                alt,
                category,
                source
            };
        });

        const quotes = $$(`.editorial-quote[data-category]`, collection);
        const buttons = $$(".shop-category", collection);
        let activeCategory = "all";
        let selectedSuggestion = -1;

        const stopWords = new Set([
            "the", "and", "with", "from", "for", "you", "would",
            "graphic", "shirt", "tshirt", "camiseta", "camisetas",
            "maglietta", "editorial", "campaign", "light", "full",
            "color", "italian", "italiano", "italiana"
        ]);

        const tokens = (value) => normalize(value).split(/\s+/).filter(Boolean);
        const suggestionLabels = Array.from(new Set(
            products.flatMap((product) => [product.title, product.alt])
                .map((value) => value.trim())
                .filter(Boolean)
        ));

        const matchingSuggestions = (query) => {
            const q = normalize(query);
            if (!q) return [];

            return suggestionLabels
                .map((label) => {
                    const n = normalize(label);
                    let score = 0;
                    if (n === q) score += 100;
                    if (n.startsWith(q)) score += 60;
                    if (n.includes(q)) score += 30;
                    tokens(q).forEach((token) => {
                        if (n.includes(token)) score += 10;
                    });
                    return { label, score };
                })
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
                .slice(0, 6);
        };

        const closeSuggestions = () => {
            if (!suggestions) return;
            suggestions.replaceChildren();
            suggestions.hidden = true;
            input.setAttribute("aria-expanded", "false");
            selectedSuggestion = -1;
        };

        const createSuggestion = (label, index, query) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "shop-search-suggestion";
            button.setAttribute("role", "option");
            button.setAttribute("aria-selected", index === selectedSuggestion ? "true" : "false");
            button.dataset.suggestion = label;

            const icon = document.createElement("span");
            icon.className = "shop-search-suggestion-icon";
            icon.textContent = "⌕";

            const text = document.createElement("span");
            const pattern = tokens(query)
                .sort((a, b) => b.length - a.length)
                .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                .join("|");

            if (!pattern) {
                text.textContent = label;
            } else {
                const regex = new RegExp(`(${pattern})`, "ig");
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(label)) !== null) {
                    if (match.index > lastIndex) {
                        text.appendChild(document.createTextNode(label.slice(lastIndex, match.index)));
                    }
                    const mark = document.createElement("mark");
                    mark.textContent = match[0];
                    text.appendChild(mark);
                    lastIndex = match.index + match[0].length;
                }
                if (lastIndex < label.length) {
                    text.appendChild(document.createTextNode(label.slice(lastIndex)));
                }
                if (!text.childNodes.length) text.textContent = label;
            }

            button.append(icon, text);
            return button;
        };

        const renderSuggestions = () => {
            if (!suggestions) return;
            const q = input.value.trim();
            const items = matchingSuggestions(q);
            if (!q || !items.length) {
                closeSuggestions();
                return;
            }

            const fragment = document.createDocumentFragment();
            items.forEach((item, index) => {
                const button = createSuggestion(item.label, index, q);
                button.addEventListener("pointerdown", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    input.value = item.label;
                    closeSuggestions();
                    filterProducts();
                    input.focus({ preventScroll: true });
                });
                fragment.appendChild(button);
            });

            suggestions.replaceChildren(fragment);
            suggestions.hidden = false;
            input.setAttribute("aria-expanded", "true");
        };

        const updateStatus = (count, hasQuery) => {
            if (!status) return;
            if (!hasQuery) {
                status.textContent = "";
                return;
            }

            const lang = getLanguage();
            const messages = {
                en: count ? `${count} ${count === 1 ? "product" : "products"}` : "No products found",
                es: count ? `${count} ${count === 1 ? "producto" : "productos"}` : "No se encontraron productos",
                it: count ? `${count} ${count === 1 ? "prodotto" : "prodotti"}` : "Nessun prodotto trovato"
            };
            status.textContent = messages[lang] || messages.en;
        };

        function filterProducts(renderAuto = true) {
            const query = input.value.trim();
            const queryTokens = tokens(query);
            let visible = 0;

            products.forEach((product) => {
                const inCategory = activeCategory === "all" || product.category === activeCategory;
                const matchesQuery = !query || queryTokens.every((token) => product.source.includes(token));
                const show = inCategory && matchesQuery;
                product.element.hidden = !show;
                if (show) visible += 1;
            });

            quotes.forEach((quote) => {
                const inCategory = activeCategory === "all" || quote.dataset.category === activeCategory;
                quote.hidden = Boolean(query) || !inCategory;
            });

            if (clear) clear.hidden = !query;
            updateStatus(visible, Boolean(query));

            if (renderAuto) renderSuggestions();
            else closeSuggestions();
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                activeCategory = button.dataset.filter || "all";
                buttons.forEach((item) => {
                    const active = item === button;
                    item.classList.toggle("active", active);
                    item.setAttribute("aria-pressed", active ? "true" : "false");
                });
                filterProducts(false);
            });
        });

        input.addEventListener("input", () => {
            selectedSuggestion = -1;
            filterProducts(true);
        });

        input.addEventListener("focus", () => {
            if (input.value.trim()) renderSuggestions();
        });

        input.addEventListener("keydown", (event) => {
            const items = $$(".shop-search-suggestion", suggestions);

            if (event.key === "ArrowDown" && items.length) {
                event.preventDefault();
                selectedSuggestion = Math.min(selectedSuggestion + 1, items.length - 1);
            } else if (event.key === "ArrowUp" && items.length) {
                event.preventDefault();
                selectedSuggestion = Math.max(selectedSuggestion - 1, 0);
            } else if (event.key === "Enter") {
                if (selectedSuggestion >= 0 && items[selectedSuggestion]) {
                    event.preventDefault();
                    input.value = items[selectedSuggestion].dataset.suggestion || "";
                    closeSuggestions();
                    filterProducts(false);
                } else {
                    closeSuggestions();
                }
            } else if (event.key === "Escape") {
                if (suggestions && !suggestions.hidden) {
                    closeSuggestions();
                } else if (input.value) {
                    input.value = "";
                    filterProducts(false);
                }
                return;
            } else {
                return;
            }

            items.forEach((item, index) => {
                const active = index === selectedSuggestion;
                item.classList.toggle("is-selected", active);
                item.setAttribute("aria-selected", active ? "true" : "false");
            });
        });

        if (clear) {
            /* pointerdown prevents blur from firing before the click can clear the field. */
            clear.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                event.stopPropagation();
                input.value = "";
                closeSuggestions();
                filterProducts(false);
                input.focus({ preventScroll: true });
            });

            clear.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                input.value = "";
                closeSuggestions();
                filterProducts(false);
                input.focus({ preventScroll: true });
            });
        }

        document.addEventListener("pointerdown", (event) => {
            if (!event.target.closest(".shop-search")) closeSuggestions();
        });

        input.addEventListener("blur", () => {
            window.setTimeout(closeSuggestions, 120);
        });

        filterProducts(false);
    }

    function init() {
        initLanguage();
        initScrollUI();
        initReveal();
        initImages();
        initCursor();
        initMobileMenu();
        initForms();
        initCookies();
        initShop();

        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        motionQuery.addEventListener?.("change", (event) => {
            if (event.matches) $$(".reveal").forEach((item) => item.classList.add("show"));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
