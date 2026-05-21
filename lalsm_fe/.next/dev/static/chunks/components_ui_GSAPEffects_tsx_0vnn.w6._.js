(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/GSAPEffects.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GSAPEffects
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"]);
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
function runHackerEffect(target) {
    let iterations = 0;
    if (!target.dataset.value) target.dataset.value = target.innerText;
    const orig = target.dataset.value;
    const interval = setInterval(()=>{
        target.innerText = target.innerText.split("").map((_, index)=>{
            if (index < iterations) return orig[index];
            return LETTERS[Math.floor(Math.random() * 26)];
        }).join("");
        if (iterations >= orig.length) clearInterval(interval);
        iterations += 1 / 3;
    }, 30);
}
function GSAPEffects() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GSAPEffects.useEffect": ()=>{
            // Scroll progress
            function updateProgress() {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const pct = scrollTop / scrollHeight * 100;
                const bar = document.querySelector(".scroll-progress-bar");
                if (bar) bar.style.width = pct + "%";
            }
            window.addEventListener("scroll", updateProgress);
            // Parallax
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(".parallax-text", {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(".image-blob", {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(".stats-badge", {
                y: -80,
                x: -20,
                rotate: -5,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
            // Section title glow
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].utils.toArray(".section-title").forEach({
                "GSAPEffects.useEffect": (title)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(title, {
                        textShadow: "0 0 20px var(--accent-cyan), 0 0 40px var(--accent-cyan)",
                        color: "#fff",
                        duration: 1,
                        scrollTrigger: {
                            trigger: title,
                            start: "top 80%",
                            end: "top 20%",
                            toggleActions: "play reverse play reverse"
                        }
                    });
                }
            }["GSAPEffects.useEffect"]);
            // Detect mobile via CSS media query — reliable cross-browser, no UA sniffing
            const isMobileDevice = ("TURBOPACK compile-time value", "object") !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
            if (!isMobileDevice) {
                // Desktop: staggered fade-in driven by scroll position
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].utils.toArray("[data-scroll]").forEach({
                    "GSAPEffects.useEffect": (elem)=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].fromTo(elem, {
                            y: 50,
                            opacity: 0
                        }, {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: elem,
                                start: "top 90%",
                                toggleActions: "play none none none"
                            }
                        });
                    }
                }["GSAPEffects.useEffect"]);
            } else {
                // Mobile: show everything immediately — no scroll-trigger dependency
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set("[data-scroll]", {
                    y: 0,
                    opacity: 1,
                    clearProps: "transform"
                });
            }
            // Recalculate all ScrollTrigger positions after CSS layout settles
            // This is critical after any layout-affecting CSS hot-reload or page load
            const refreshTimer = setTimeout({
                "GSAPEffects.useEffect.refreshTimer": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].refresh(true);
                }
            }["GSAPEffects.useEffect.refreshTimer"], 350);
            // Marquee
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(".marquee-wrapper", {
                xPercent: -50,
                repeat: -1,
                duration: 15,
                ease: "linear"
            });
            let marqueeProxy = {
                skew: 0
            };
            const marqueeSkewSetter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].quickSetter(".marquee-text", "skewX", "deg");
            const marqueeClamp = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].utils.clamp(-20, 20);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
                onUpdate: {
                    "GSAPEffects.useEffect": (self)=>{
                        let skew = marqueeClamp(self.getVelocity() / -300);
                        if (Math.abs(skew) > Math.abs(marqueeProxy.skew)) {
                            marqueeProxy.skew = skew;
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(marqueeProxy, {
                                skew: 0,
                                duration: 0.8,
                                ease: "power3",
                                overwrite: true,
                                onUpdate: {
                                    "GSAPEffects.useEffect": ()=>marqueeSkewSetter(marqueeProxy.skew)
                                }["GSAPEffects.useEffect"]
                            });
                        }
                    }
                }["GSAPEffects.useEffect"]
            });
            if (!isMobileDevice) {
                // Achievements reveal
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].fromTo(".achievements-marquee-wrapper", {
                    scale: 0.4,
                    y: 200,
                    rotationX: 45,
                    opacity: 0,
                    transformPerspective: 1000,
                    transformOrigin: "center center"
                }, {
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".ach-marquee-section",
                        start: "top 90%",
                        end: "top 40%",
                        scrub: 1
                    }
                });
            } else {
                // Direct instant display on mobile
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(".achievements-marquee-wrapper", {
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    opacity: 1
                });
            }
            // Footer auto-glow
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
                trigger: ".mega-link",
                start: "top 65%",
                toggleClass: "active"
            });
            // Hacker text on scroll
            document.querySelectorAll("h2.section-title, h1.glitch-text").forEach({
                "GSAPEffects.useEffect": (title)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
                        trigger: title,
                        start: "top 80%",
                        onEnter: {
                            "GSAPEffects.useEffect": ()=>runHackerEffect(title)
                        }["GSAPEffects.useEffect"]
                    });
                }
            }["GSAPEffects.useEffect"]);
            // Hacker text on hover
            document.querySelectorAll(".hacker-text, .nav-link").forEach({
                "GSAPEffects.useEffect": (el)=>{
                    el.addEventListener("mouseover", {
                        "GSAPEffects.useEffect": ()=>runHackerEffect(el)
                    }["GSAPEffects.useEffect"]);
                }
            }["GSAPEffects.useEffect"]);
            // Magnetic buttons
            document.querySelectorAll(".btn, .social-icon, .nav-link, .btn-quick-view").forEach({
                "GSAPEffects.useEffect": (magnet)=>{
                    magnet.addEventListener("mousemove", {
                        "GSAPEffects.useEffect": (e)=>{
                            const bounding = magnet.getBoundingClientRect();
                            const newX = (e.clientX - bounding.left) / magnet.offsetWidth - 0.5;
                            const newY = (e.clientY - bounding.top) / magnet.offsetHeight - 0.5;
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(magnet, {
                                duration: 0.3,
                                x: newX * 20,
                                y: newY * 20,
                                ease: "power2.out"
                            });
                        }
                    }["GSAPEffects.useEffect"]);
                    magnet.addEventListener("mouseleave", {
                        "GSAPEffects.useEffect": ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(magnet, {
                                duration: 1,
                                x: 0,
                                y: 0,
                                ease: "elastic.out(1.2, 0.4)"
                            });
                        }
                    }["GSAPEffects.useEffect"]);
                }
            }["GSAPEffects.useEffect"]);
            return ({
                "GSAPEffects.useEffect": ()=>{
                    clearTimeout(refreshTimer);
                    window.removeEventListener("scroll", updateProgress);
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].getAll().forEach({
                        "GSAPEffects.useEffect": (t)=>t.kill()
                    }["GSAPEffects.useEffect"]);
                }
            })["GSAPEffects.useEffect"];
        }
    }["GSAPEffects.useEffect"], []);
    return null;
}
_s(GSAPEffects, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = GSAPEffects;
var _c;
__turbopack_context__.k.register(_c, "GSAPEffects");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/GSAPEffects.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/GSAPEffects.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_GSAPEffects_tsx_0vnn.w6._.js.map