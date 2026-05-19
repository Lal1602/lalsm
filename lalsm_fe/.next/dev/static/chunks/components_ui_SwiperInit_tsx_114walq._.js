(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/SwiperInit.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SwiperInit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function SwiperInit() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SwiperInit.useEffect": ()=>{
            let swiperInstance = null;
            async function init() {
                const { default: Swiper } = await __turbopack_context__.A("[project]/node_modules/swiper/swiper.mjs [app-client] (ecmascript, async loader)");
                const { FreeMode, Pagination } = await __turbopack_context__.A("[project]/node_modules/swiper/modules/index.mjs [app-client] (ecmascript, async loader)");
                await __turbopack_context__.A("[project]/node_modules/swiper/swiper.css [app-client] (css, async loader)");
                await __turbopack_context__.A("[project]/node_modules/swiper/modules/free-mode.css [app-client] (css, async loader)");
                swiperInstance = new Swiper(".project-slider", {
                    modules: [
                        FreeMode,
                        Pagination
                    ],
                    slidesPerView: "auto",
                    spaceBetween: 40,
                    freeMode: true,
                    loop: true,
                    grabCursor: true,
                    allowTouchMove: true,
                    speed: 800,
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true
                    }
                });
            }
            init();
            return ({
                "SwiperInit.useEffect": ()=>{
                    swiperInstance?.destroy(true, true);
                }
            })["SwiperInit.useEffect"];
        }
    }["SwiperInit.useEffect"], []);
    return null;
}
_s(SwiperInit, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = SwiperInit;
var _c;
__turbopack_context__.k.register(_c, "SwiperInit");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/SwiperInit.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/SwiperInit.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_SwiperInit_tsx_114walq._.js.map