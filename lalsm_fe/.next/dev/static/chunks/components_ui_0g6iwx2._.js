(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/ProjectModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ProjectModal({ data, cardRect, onClose }) {
    _s();
    const overlayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const contentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectModal.useEffect": ()=>{
            if (!data || !overlayRef.current || !contentRef.current) return;
            const overlay = overlayRef.current;
            const content = contentRef.current;
            overlay.style.display = "flex";
            document.body.style.overflow = "hidden";
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(overlay, {
                opacity: 0
            });
            if (cardRect) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(content, {
                    position: "fixed",
                    left: cardRect.left,
                    top: cardRect.top,
                    width: cardRect.width,
                    height: cardRect.height,
                    xPercent: 0,
                    yPercent: 0,
                    margin: 0,
                    scale: 1,
                    opacity: 1,
                    borderRadius: "15px"
                });
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(content, {
                    scale: 0.85,
                    opacity: 0
                });
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(overlay, {
                opacity: 1,
                duration: 0.35,
                ease: "power2.out"
            });
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const w = vw > 768 ? 600 : vw * 0.9;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(content, {
                left: vw / 2,
                top: vh / 2,
                xPercent: -50,
                yPercent: -50,
                width: w,
                height: "auto",
                borderRadius: "20px",
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power3.inOut"
            });
            overlay.classList.add("active");
        }
    }["ProjectModal.useEffect"], [
        data,
        cardRect
    ]);
    function handleClose() {
        if (!overlayRef.current || !contentRef.current) return;
        const overlay = overlayRef.current;
        const content = contentRef.current;
        if (cardRect) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(content, {
                left: cardRect.left,
                top: cardRect.top,
                xPercent: 0,
                yPercent: 0,
                width: cardRect.width,
                height: cardRect.height,
                borderRadius: "15px",
                duration: 0.4,
                ease: "power3.inOut",
                onComplete: ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(content, {
                        opacity: 0,
                        duration: 0.15,
                        onComplete: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(content, {
                                clearProps: "all"
                            });
                            overlay.style.display = "none";
                            overlay.classList.remove("active");
                            document.body.style.overflow = "auto";
                            onClose();
                        }
                    });
                }
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(overlay, {
                opacity: 0,
                duration: 0.38,
                ease: "power2.in"
            });
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(overlay, {
                opacity: 0,
                duration: 0.3
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(content, {
                opacity: 0,
                scale: 0.85,
                duration: 0.3,
                onComplete: ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(content, {
                        clearProps: "all"
                    });
                    overlay.style.display = "none";
                    overlay.classList.remove("active");
                    document.body.style.overflow = "auto";
                    onClose();
                }
            });
        }
    }
    if (!data) return null;
    const techItems = data.tech ? data.tech.split(",").map((t)=>t.trim()) : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-overlay",
        id: "projectModal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "modalTitle",
        ref: overlayRef,
        style: {
            display: "none"
        },
        onClick: (e)=>{
            if (e.target === overlayRef.current) handleClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "modal-content",
            "data-lenis-prevent": true,
            ref: contentRef,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "close-modal",
                    id: "closeModalBtn",
                    "aria-label": "Close Modal",
                    onClick: handleClose,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ion-icon", {
                        suppressHydrationWarning: true,
                        name: "close-outline",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ProjectModal.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/ProjectModal.tsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this),
                data.image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    id: "modalImg",
                    src: data.image,
                    alt: "Project or Certificate Preview",
                    className: "modal-img"
                }, void 0, false, {
                    fileName: "[project]/components/ui/ProjectModal.tsx",
                    lineNumber: 143,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-body",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            id: "modalTitle",
                            className: "modal-title",
                            children: data.title
                        }, void 0, false, {
                            fileName: "[project]/components/ui/ProjectModal.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this),
                        techItems.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "modalTechContainer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "modalTech",
                                className: "modal-tech",
                                children: techItems.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "tech-badge",
                                        children: t
                                    }, t, false, {
                                        fileName: "[project]/components/ui/ProjectModal.tsx",
                                        lineNumber: 151,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/ui/ProjectModal.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ui/ProjectModal.tsx",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            id: "modalDesc",
                            className: "modal-desc",
                            children: data.desc
                        }, void 0, false, {
                            fileName: "[project]/components/ui/ProjectModal.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            id: "modalLink",
                            href: data.link,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "btn",
                            style: {
                                marginTop: "15px"
                            },
                            children: "View Full Certificate / Project"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/ProjectModal.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/ProjectModal.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/ProjectModal.tsx",
            lineNumber: 137,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/ProjectModal.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(ProjectModal, "RW3scTvL+DcvzmJrhhLSd/xPtUY=");
_c = ProjectModal;
var _c;
__turbopack_context__.k.register(_c, "ProjectModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/GlobalInteractions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GlobalInteractions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ProjectModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/ProjectModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function createBurst(x, y) {
    const colors = [
        "#00f3ff",
        "#bc13fe",
        "#ffd700"
    ];
    for(let i = 0; i < 12; i++){
        const p = document.createElement("div");
        p.className = "burst-particle";
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(p);
        const angle = Math.random() * Math.PI * 2;
        const velocity = 30 + Math.random() * 50;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(p, {
            x,
            y,
            opacity: 1,
            scale: 1
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(p, {
            x: x + Math.cos(angle) * velocity,
            y: y + Math.sin(angle) * velocity,
            opacity: 0,
            scale: 0,
            duration: 0.6 + Math.random() * 0.4,
            ease: "power2.out",
            onComplete: ()=>p.remove()
        });
    }
}
function GlobalInteractions() {
    _s();
    const [modalData, setModalData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [cardRect, setCardRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GlobalInteractions.useEffect": ()=>{
            // Particle burst on button clicks
            function onBurstClick(e) {
                const target = e.target;
                if (target.closest(".btn") || target.closest("button")) {
                    createBurst(e.clientX, e.clientY);
                }
            }
            // Modal delegation
            function onCardClick(e) {
                const target = e.target;
                const marqueeCard = target.closest(".marquee-card");
                const projectBtn = target.closest(".btn-quick-view") || target.closest(".project-card a");
                const projectCard = target.closest(".project-card") || target.closest(".achievement-card");
                const card = marqueeCard || (projectBtn ? projectCard : null);
                if (!card) return;
                e.preventDefault();
                const rect = card.getBoundingClientRect();
                const data = {
                    title: card.dataset.title || "",
                    desc: card.dataset.desc || "",
                    tech: card.dataset.tech || "",
                    image: card.dataset.image || "",
                    link: card.dataset.link || "#"
                };
                setCardRect(rect);
                setModalData(data);
            }
            // Tilt cards
            function onTiltMove(e) {
                const card = e.target.closest(".tilt-card");
                if (card) {
                    const { left, top, width, height } = card.getBoundingClientRect();
                    const x = (e.clientX - left - width / 2) / 20;
                    const y = (e.clientY - top - height / 2) / 20;
                    card.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`;
                }
            }
            function onTiltOut(e) {
                const card = e.target.closest(".tilt-card");
                if (card) card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
            }
            // Spotlight card hover border glow
            function onSpotlightMove(e) {
                const card = e.target.closest(".glass-card, .project-card, .achievement-card, .about-layer-card, .workflow-step-card");
                if (card) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty("--mouse-x", `${x}px`);
                    card.style.setProperty("--mouse-y", `${y}px`);
                }
            }
            document.addEventListener("click", onBurstClick);
            document.addEventListener("click", onCardClick);
            document.addEventListener("mousemove", onTiltMove);
            document.addEventListener("mouseout", onTiltOut);
            document.addEventListener("mousemove", onSpotlightMove);
            return ({
                "GlobalInteractions.useEffect": ()=>{
                    document.removeEventListener("click", onBurstClick);
                    document.removeEventListener("click", onCardClick);
                    document.removeEventListener("mousemove", onTiltMove);
                    document.removeEventListener("mouseout", onTiltOut);
                    document.removeEventListener("mousemove", onSpotlightMove);
                }
            })["GlobalInteractions.useEffect"];
        }
    }["GlobalInteractions.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: modalData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ProjectModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            data: modalData,
            cardRect: cardRect,
            onClose: ()=>{
                setModalData(null);
                setCardRect(null);
            }
        }, void 0, false, {
            fileName: "[project]/components/ui/GlobalInteractions.tsx",
            lineNumber: 116,
            columnNumber: 9
        }, this)
    }, void 0, false);
}
_s(GlobalInteractions, "/29Xuwfg8vzvG89YnA4H2f3o6MQ=");
_c = GlobalInteractions;
var _c;
__turbopack_context__.k.register(_c, "GlobalInteractions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/GlobalInteractions.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/GlobalInteractions.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_0g6iwx2._.js.map