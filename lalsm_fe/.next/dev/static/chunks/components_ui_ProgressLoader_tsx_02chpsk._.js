(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/ProgressLoader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Progress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Progress.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const ProgressLoader = ()=>{
    _s();
    const { progress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Progress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProgress"])();
    const strokeWidth = 3;
    const [windowSize, setWindowSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Effect to update dimensions on window resize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProgressLoader.useEffect": ()=>{
            // Handler to call on window resize
            function handleResize() {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
                setIsMobile(window.innerWidth <= 768);
            }
            // Add event listener
            window.addEventListener('resize', handleResize);
            // Call handler right away so state gets updated with initial window size
            handleResize();
            // Remove event listener on cleanup
            return ({
                "ProgressLoader.useEffect": ()=>window.removeEventListener('resize', handleResize)
            })["ProgressLoader.useEffect"];
        }
    }["ProgressLoader.useEffect"], []); // Empty array ensures effect is only run on mount and unmount
    // Clamp progress value between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress));
    // Calculate the size of the loader SVG based on window dimensions minus 1rem total
    // We use the pixel equivalent for calculation here.
    const svgWidth = Math.max(0, windowSize.width - 16);
    const svgHeight = Math.max(0, windowSize.height - 16);
    // Calculate the dimensions and path length for the rectangle SVG element
    const halfStroke = 1;
    // Adjust the actual drawing size of the rectangle within the SVG
    const rectWidth = Math.max(0, svgWidth - strokeWidth); // Ensure size is not negative
    const rectHeight = Math.max(0, svgHeight - strokeWidth); // Ensure size is not negative
    // Calculate the total length of the rectangle's perimeter
    const perimeter = rectWidth > 0 && rectHeight > 0 ? rectWidth * 2 + rectHeight * 2 : 0;
    // Calculate the stroke dash offset based on progress
    const strokeDashoffset = perimeter - perimeter * clampedProgress / 100;
    // If size is too small (e.g., window resized very small), don't render the SVG
    if (svgWidth <= strokeWidth || svgHeight <= strokeWidth) {
        return null; // Or return a minimal placeholder
    }
    if (isMobile) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-[100px] transition-all duration-500 font-sans font-bold",
                style: {
                    opacity: progress === 100 ? 0 : 0.7,
                    fontSize: '0.6rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute w-[100px] bg-black opacity-30 h-[2px]"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ProgressLoader.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute transition-all duration-500 ease-in-out ",
                        style: {
                            height: '2px',
                            width: `${progress}%`,
                            backgroundColor: 'white'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ProgressLoader.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 text-white",
                        children: `${progress.toFixed(2)}%`
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ProgressLoader.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/ProgressLoader.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/ui/ProgressLoader.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return(// Use fixed positioning to overlay the loader
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none",
        style: {
            padding: '1rem'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: svgWidth,
            height: svgHeight,
            viewBox: `0 0 ${svgWidth} ${svgHeight}`,
            style: {
                display: svgWidth > 0 && svgHeight > 0 ? 'block' : 'none'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: halfStroke,
                    y: halfStroke,
                    width: rectWidth,
                    height: rectHeight,
                    fill: "none",
                    strokeWidth: strokeWidth,
                    stroke: "rgba(0, 0, 0, 0.2)"
                }, void 0, false, {
                    fileName: "[project]/components/ui/ProgressLoader.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: halfStroke,
                    y: halfStroke,
                    width: rectWidth,
                    height: rectHeight,
                    fill: "none",
                    strokeWidth: strokeWidth,
                    stroke: "rgba(255, 255, 255, 0.7)",
                    style: {
                        strokeDasharray: perimeter,
                        strokeDashoffset: strokeDashoffset,
                        transition: 'stroke-dashoffset 1s ease-in-out'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/ui/ProgressLoader.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/ProgressLoader.tsx",
            lineNumber: 86,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/ProgressLoader.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)));
};
_s(ProgressLoader, "zZ5+wPAElmZc8fuadCGdyT9jkN4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Progress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProgress"]
    ];
});
_c = ProgressLoader;
const __TURBOPACK__default__export__ = _c2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(_c1 = ()=>Promise.resolve(ProgressLoader), {
    ssr: false
});
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ProgressLoader");
__turbopack_context__.k.register(_c1, "%default%$dynamic");
__turbopack_context__.k.register(_c2, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ProgressLoader.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/ProgressLoader.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_ProgressLoader_tsx_02chpsk._.js.map