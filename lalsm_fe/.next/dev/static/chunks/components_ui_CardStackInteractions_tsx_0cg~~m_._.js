(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/CardStackInteractions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardStackInteractions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function CardStackInteractions() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CardStackInteractions.useEffect": ()=>{
            const stack = document.querySelector(".about-card-stack");
            if (!stack) return;
            const cards = Array.from(stack.querySelectorAll(".about-layer-card"));
            const dots = Array.from(stack.querySelectorAll(".stack-dot"));
            const THROW_THRESHOLD = 80;
            const TILT_FACTOR = 0.06;
            let order = [
                0,
                1,
                2
            ];
            let busy = false;
            function front() {
                return cards[order[0]];
            }
            function mid() {
                return cards[order[1]];
            }
            function back() {
                return cards[order[2]];
            }
            function updateDots() {
                dots.forEach({
                    "CardStackInteractions.useEffect.updateDots": (dot)=>{
                        const active = parseInt(dot.dataset.index) === order[0];
                        dot.classList.toggle("is-active", active);
                        dot.setAttribute("aria-selected", String(active));
                    }
                }["CardStackInteractions.useEffect.updateDots"]);
            }
            dots.forEach({
                "CardStackInteractions.useEffect": (dot)=>{
                    dot.addEventListener("click", {
                        "CardStackInteractions.useEffect": ()=>{
                            if (busy) return;
                            const target = parseInt(dot.dataset.index);
                            const steps = order.indexOf(target);
                            if (steps === 0) return;
                            let thrown = 0;
                            function doThrow() {
                                throwCard("left");
                                thrown++;
                                if (thrown < steps) setTimeout(doThrow, 460);
                            }
                            doThrow();
                        }
                    }["CardStackInteractions.useEffect"]);
                }
            }["CardStackInteractions.useEffect"]);
            function applyDrag(dx) {
                const tilt = dx * TILT_FACTOR;
                const prog = Math.min(Math.abs(dx) / THROW_THRESHOLD, 1);
                const ease = prog * prog;
                front().style.transform = `translateX(${dx}px) rotateY(${tilt}deg)`;
                mid().style.transform = `translateX(0px) translateY(${8 - ease * 8}px) translateZ(${-50 + ease * 50}px) rotateY(-2.5deg) scale(${0.97 + ease * 0.03})`;
                back().style.transform = `translateX(0px) translateY(${16 - ease * 8}px) translateZ(${-100 + ease * 50}px) rotateY(-5deg) scale(${0.94 + ease * 0.03})`;
            }
            function clearDragStyles() {
                cards.forEach({
                    "CardStackInteractions.useEffect.clearDragStyles": (c)=>c.style.transform = ""
                }["CardStackInteractions.useEffect.clearDragStyles"]);
            }
            function throwCard(direction) {
                if (busy) return;
                busy = true;
                stack.classList.add("interacted");
                const f = front();
                clearDragStyles();
                f.classList.remove("is-front");
                f.classList.add(direction === "right" ? "is-flying-right" : "is-flying-left");
                mid().classList.replace("is-mid", "is-front");
                back().classList.replace("is-back", "is-mid");
                setTimeout({
                    "CardStackInteractions.useEffect.throwCard": ()=>{
                        f.classList.remove("is-flying-left", "is-flying-right");
                        f.classList.add("is-back");
                        order = [
                            order[1],
                            order[2],
                            order[0]
                        ];
                        updateDots();
                        busy = false;
                    }
                }["CardStackInteractions.useEffect.throwCard"], 450);
            }
            stack.addEventListener("pointerdown", {
                "CardStackInteractions.useEffect": (e)=>{
                    if (busy || e.pointerType === "touch") return;
                    const startX = e.clientX;
                    let moved = false;
                    function onMove(e) {
                        const dx = e.clientX - startX;
                        if (Math.abs(dx) > 4) {
                            if (!moved) {
                                moved = true;
                                front().classList.add("is-dragging");
                            }
                            applyDrag(dx);
                        }
                    }
                    function onUp(e) {
                        document.removeEventListener("pointermove", onMove);
                        document.removeEventListener("pointerup", onUp);
                        front().classList.remove("is-dragging");
                        const dx = e.clientX - startX;
                        if (Math.abs(dx) >= THROW_THRESHOLD) throwCard(dx > 0 ? "right" : "left");
                        else clearDragStyles();
                    }
                    document.addEventListener("pointermove", onMove);
                    document.addEventListener("pointerup", onUp);
                }
            }["CardStackInteractions.useEffect"]);
            let t0 = 0;
            stack.addEventListener("touchstart", {
                "CardStackInteractions.useEffect": (e)=>{
                    t0 = e.touches[0].clientX;
                }
            }["CardStackInteractions.useEffect"], {
                passive: true
            });
            stack.addEventListener("touchend", {
                "CardStackInteractions.useEffect": (e)=>{
                    if (busy) return;
                    const dx = e.changedTouches[0].clientX - t0;
                    if (Math.abs(dx) >= THROW_THRESHOLD) throwCard(dx > 0 ? "right" : "left");
                }
            }["CardStackInteractions.useEffect"], {
                passive: true
            });
        }
    }["CardStackInteractions.useEffect"], []);
    return null;
}
_s(CardStackInteractions, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = CardStackInteractions;
var _c;
__turbopack_context__.k.register(_c, "CardStackInteractions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/CardStackInteractions.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/CardStackInteractions.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_CardStackInteractions_tsx_0cg~~m_._.js.map