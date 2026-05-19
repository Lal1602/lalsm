(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/WorkflowKinetic.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkflowKinetic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const ANIM = [
    {
        accent: "cyan",
        enter: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].timeline({
                overwrite: "auto"
            }).to(chars, {
                backgroundSize: "100% 110%",
                y: -7,
                duration: 0.5,
                stagger: {
                    each: 0.042,
                    from: "start",
                    ease: "power1.inOut"
                },
                ease: "power2.out"
            }).to(chars, {
                y: 0,
                duration: 0.35,
                stagger: {
                    each: 0.025,
                    from: "start"
                },
                ease: "power2.inOut"
            }, "-=0.28"),
        leave: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                backgroundSize: "100% 0%",
                y: 0,
                duration: 0.28,
                stagger: {
                    each: 0.022,
                    from: "end"
                },
                overwrite: "auto"
            })
    },
    {
        accent: "gold",
        enter: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                backgroundSize: "100% 110%",
                duration: 0.48,
                stagger: {
                    each: 0.05,
                    from: "center"
                },
                ease: "power2.out",
                overwrite: "auto"
            }),
        leave: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                backgroundSize: "100% 0%",
                duration: 0.32,
                stagger: {
                    each: 0.04,
                    from: "center"
                },
                overwrite: "auto"
            })
    },
    {
        accent: "purple",
        enter: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                backgroundSize: "100% 110%",
                scaleY: 1.06,
                duration: 0.32,
                stagger: {
                    each: 0.028,
                    from: "random"
                },
                ease: "power1.out",
                overwrite: "auto",
                onComplete: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                        scaleY: 1,
                        duration: 0.2
                    })
            }),
        leave: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                backgroundSize: "100% 0%",
                scaleY: 1,
                duration: 0.22,
                stagger: {
                    each: 0.02,
                    from: "random"
                },
                overwrite: "auto"
            })
    },
    {
        accent: "orange",
        enter: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].timeline({
                overwrite: "auto"
            }).to(chars, {
                y: -14,
                duration: 0.18,
                stagger: {
                    each: 0.007,
                    from: "start"
                },
                ease: "power3.in"
            }).to(chars, {
                backgroundSize: "100% 110%",
                y: 0,
                duration: 0.28,
                stagger: {
                    each: 0.007,
                    from: "start"
                },
                ease: "power3.out"
            }, "-=0.06"),
        leave: (chars)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(chars, {
                backgroundSize: "100% 0%",
                y: 0,
                duration: 0.2,
                stagger: {
                    each: 0.009,
                    from: "end"
                },
                ease: "power2.in",
                overwrite: "auto"
            })
    }
];
function splitChars(item) {
    const chars = [];
    Array.from(item.childNodes).forEach((node)=>{
        if (node.nodeType !== Node.TEXT_NODE) return;
        const text = node.textContent || "";
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        for (const ch of text){
            if (ch === " ") {
                frag.appendChild(document.createTextNode(" "));
            } else {
                const span = document.createElement("span");
                span.className = "char";
                span.textContent = ch;
                frag.appendChild(span);
                chars.push(span);
            }
        }
        node.replaceWith(frag);
    });
    return chars;
}
function WorkflowKinetic() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WorkflowKinetic.useEffect": ()=>{
            const floatingCard = document.querySelector(".floating-workflow-card");
            const items = document.querySelectorAll(".workflow-text-item");
            if (!floatingCard || !items.length) return;
            const xTo = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].quickTo(floatingCard, "x", {
                duration: 0.45,
                ease: "power3"
            });
            const yTo = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].quickTo(floatingCard, "y", {
                duration: 0.45,
                ease: "power3"
            });
            items.forEach({
                "WorkflowKinetic.useEffect": (item, index)=>{
                    const chars = splitChars(item);
                    const anim = ANIM[index] || ANIM[0];
                    let activeTween = null;
                    item.addEventListener("mouseenter", {
                        "WorkflowKinetic.useEffect": ()=>{
                            if (activeTween) {
                                activeTween.kill();
                                activeTween = null;
                            }
                            activeTween = anim.enter(chars);
                            const iconEl = floatingCard.querySelector(".float-icon");
                            const titleEl = floatingCard.querySelector(".float-title");
                            const descEl = floatingCard.querySelector(".float-desc");
                            if (iconEl) iconEl.setAttribute("name", item.dataset.icon || "");
                            if (titleEl) titleEl.textContent = item.dataset.title || "";
                            if (descEl) descEl.textContent = item.dataset.desc || "";
                            floatingCard.classList.remove("accent-cyan", "accent-gold", "accent-purple", "accent-orange");
                            floatingCard.classList.add(`accent-${anim.accent}`);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(floatingCard, {
                                opacity: 1,
                                scale: 1,
                                duration: 0.32,
                                ease: "back.out(1.4)"
                            });
                        }
                    }["WorkflowKinetic.useEffect"]);
                    item.addEventListener("mousemove", {
                        "WorkflowKinetic.useEffect": (e)=>{
                            xTo(e.clientX + 24);
                            yTo(e.clientY + 24);
                        }
                    }["WorkflowKinetic.useEffect"]);
                    item.addEventListener("mouseleave", {
                        "WorkflowKinetic.useEffect": ()=>{
                            if (activeTween) {
                                activeTween.kill();
                                activeTween = null;
                            }
                            activeTween = anim.leave(chars);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(floatingCard, {
                                opacity: 0,
                                scale: 0.82,
                                duration: 0.2,
                                ease: "power2.in"
                            });
                        }
                    }["WorkflowKinetic.useEffect"]);
                }
            }["WorkflowKinetic.useEffect"]);
        }
    }["WorkflowKinetic.useEffect"], []);
    return null;
}
_s(WorkflowKinetic, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = WorkflowKinetic;
var _c;
__turbopack_context__.k.register(_c, "WorkflowKinetic");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/WorkflowKinetic.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/WorkflowKinetic.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_WorkflowKinetic_tsx_0z9xh4b._.js.map