(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/stores/portalStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePortalStore",
    ()=>usePortalStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const usePortalStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        activePortalId: null,
        setActivePortal: (activePortalId)=>set(()=>({
                    activePortalId
                }))
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/stores/scrollStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useScrollStore",
    ()=>useScrollStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useScrollStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        scrollProgress: 0,
        setScrollProgress: (progress)=>set(()=>({
                    scrollProgress: progress
                }))
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/stores/themeStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useThemeStore",
    ()=>useThemeStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const AvailableThemes = [
    {
        type: 'light',
        color: '#0690d4'
    },
    {
        type: 'dark',
        color: '#111'
    }
];
const useThemeStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        themes: [
            ...AvailableThemes
        ],
        theme: AvailableThemes[0],
        nextTheme: ()=>{
            const themes = get().themes;
            const activeThemeIndex = themes.findIndex((theme)=>theme.type === get().theme.type);
            const nextThemeIndex = (activeThemeIndex + 1) % themes.length;
            set(()=>({
                    theme: themes[nextThemeIndex]
                }));
        }
    }), {
    name: "theme-storage",
    partialize: (state)=>({
            theme: state.theme
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/stores/chatStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useChatStore",
    ()=>useChatStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const DEFAULT_WELCOME_MESSAGE = {
    role: 'ai',
    text: 'Halo! Saya asisten virtual Bilal. Ada yang bisa saya bantu untuk menjelaskan proyek, keahlian, atau pengalaman kerja Bilal?'
};
const useChatStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        messages: [
            DEFAULT_WELCOME_MESSAGE
        ],
        isLoading: false,
        sendMessage: async (text)=>{
            if (!text.trim() || get().isLoading) return;
            const userMessage = {
                role: 'user',
                text: text.trim()
            };
            const currentMessages = get().messages;
            // Optimistically update messages with user's input
            set({
                messages: [
                    ...currentMessages,
                    userMessage
                ],
                isLoading: true
            });
            try {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: userMessage.text,
                        history: currentMessages
                    })
                });
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                const data = await response.json();
                let rawReply = data.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.';
                // Parse action command tags from the AI response
                // 1. SCROLL_AND_HIGHLIGHT Action
                const scrollRegex = /\[ACTION:SCROLL_AND_HIGHLIGHT:([a-zA-Z0-9_-]+)\]/i;
                const scrollMatch = rawReply.match(scrollRegex);
                if (scrollMatch) {
                    const sectionId = scrollMatch[1].toLowerCase();
                    rawReply = rawReply.replace(scrollRegex, '').trim();
                    setTimeout(()=>{
                        const element = document.getElementById(sectionId);
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            element.classList.add('ai-highlight-active');
                            setTimeout(()=>{
                                element.classList.remove('ai-highlight-active');
                            }, 3000);
                        }
                    }, 300);
                }
                // 2. OPEN_PROJECT Action (Scrolls, slides Swiper, and clicks detail button)
                const projectRegex = /\[ACTION:OPEN_PROJECT:([^\]]+)\]/i;
                const projectMatch = rawReply.match(projectRegex);
                if (projectMatch) {
                    const projectTitle = projectMatch[1].trim();
                    rawReply = rawReply.replace(projectRegex, '').trim();
                    setTimeout(()=>{
                        const section = document.getElementById('projects');
                        if (section) {
                            section.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            section.classList.add('ai-highlight-active');
                            setTimeout(()=>{
                                section.classList.remove('ai-highlight-active');
                            }, 3000);
                        }
                        const cards = Array.from(document.querySelectorAll('.project-card'));
                        const targetIndex = cards.findIndex((card)=>{
                            const title = card.getAttribute('data-title') || '';
                            return title.toLowerCase().includes(projectTitle.toLowerCase());
                        });
                        if (targetIndex !== -1) {
                            const swiperEl = document.getElementById('project-swiper');
                            if (swiperEl && swiperEl.swiper) {
                                swiperEl.swiper.slideTo(targetIndex);
                            }
                            setTimeout(()=>{
                                const targetCard = cards[targetIndex];
                                const viewBtn = targetCard.querySelector('.btn-quick-view') || targetCard.querySelector('.btn');
                                if (viewBtn) {
                                    viewBtn.click();
                                }
                            }, 600);
                        }
                    }, 300);
                }
                // 3. OPEN_ACHIEVEMENT Action (Scrolls and opens achievement cert modal)
                const achRegex = /\[ACTION:OPEN_ACHIEVEMENT:([^\]]+)\]/i;
                const achMatch = rawReply.match(achRegex);
                if (achMatch) {
                    const achTitle = achMatch[1].trim();
                    rawReply = rawReply.replace(achRegex, '').trim();
                    setTimeout(()=>{
                        const section = document.getElementById('achievements');
                        if (section) {
                            section.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            section.classList.add('ai-highlight-active');
                            setTimeout(()=>{
                                section.classList.remove('ai-highlight-active');
                            }, 3000);
                        }
                        const cards = Array.from(document.querySelectorAll('.marquee-card'));
                        const targetCard = cards.find((card)=>{
                            const title = card.getAttribute('data-title') || '';
                            return title.toLowerCase().includes(achTitle.toLowerCase());
                        });
                        if (targetCard) {
                            targetCard.classList.add('ai-highlight-active');
                            setTimeout(()=>{
                                targetCard.classList.remove('ai-highlight-active');
                            }, 3000);
                            const viewBtn = targetCard.querySelector('.btn-quick-view') || targetCard;
                            if (viewBtn) {
                                viewBtn.click();
                            }
                        }
                    }, 300);
                }
                const aiMessage = {
                    role: 'ai',
                    text: rawReply
                };
                set((state)=>({
                        messages: [
                            ...state.messages,
                            aiMessage
                        ],
                        isLoading: false
                    }));
            } catch (error) {
                console.error('Error sending chat message:', error);
                // Polite fallback response when API fails
                const fallbackMessage = {
                    role: 'ai',
                    text: 'Maaf, saya sedang kesulitan menghubungi server otak utama saya. Tapi jangan ragu untuk menanyakan hal seputar portofolio Bilal, keahliannya di bidang React/Three.js/GSAP, atau menjelajahi kartu-kartu proyek interaktif di halaman ini!'
                };
                set((state)=>({
                        messages: [
                            ...state.messages,
                            fallbackMessage
                        ],
                        isLoading: false
                    }));
            }
        },
        clearHistory: ()=>{
            set({
                messages: [
                    DEFAULT_WELCOME_MESSAGE
                ]
            });
        }
    }), {
    name: 'bilal-chat-storage',
    partialize: (state)=>({
            messages: state.messages
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/stores/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$portalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/portalStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/scrollStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/themeStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/chatStore.ts [app-client] (ecmascript)");
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ScrollHint.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollHint",
    ()=>ScrollHint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/stores/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$portalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/portalStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/scrollStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const ScrollHint = ()=>{
    _s();
    const [hintText, setHintText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showScrollHint, setShowScrollHint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const portal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$portalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePortalStore"])({
        "ScrollHint.usePortalStore[portal]": (state)=>state.activePortalId
    }["ScrollHint.usePortalStore[portal]"]);
    const scrollProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollStore"])({
        "ScrollHint.useScrollStore[scrollProgress]": (state)=>state.scrollProgress
    }["ScrollHint.useScrollStore[scrollProgress]"]);
    // Show 'Scroll' for Hero and work portals, 'Pan' for Projects portal.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrollHint.useEffect": ()=>{
            if (!portal) {
                if (scrollProgress === 0) {
                    setHintText('SCROLL');
                    setShowScrollHint(true);
                } else {
                    setShowScrollHint(false);
                }
            } else {
                if (portal === 'work') {
                    setHintText('SCROLL');
                    setShowScrollHint(scrollProgress === 0);
                } else {
                    setHintText('PAN');
                    setShowScrollHint(true);
                }
            }
        }
    }["ScrollHint.useEffect"], [
        portal,
        scrollProgress
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrollHint.useEffect": ()=>{
            if (showScrollHint) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to('.scroll-hint', {
                    opacity: 1,
                    duration: 1.5,
                    delay: 1.5
                });
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].killTweensOf('.scroll-hint');
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to('.scroll-hint', {
                    opacity: 0,
                    duration: 0.5
                });
            }
        }
    }["ScrollHint.useEffect"], [
        showScrollHint
    ]);
    const svgSrc = hintText === 'PAN' ? 'icons/chevrons-left-right.svg' : 'icons/chevrons-up-down.svg';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed w-full bottom-5 scroll-hint",
        style: {
            opacity: 0
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center animate-pulse",
            children: [
                showScrollHint,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    src: svgSrc,
                    width: 18,
                    height: 18,
                    alt: "night mode",
                    loading: "lazy"
                }, void 0, false, {
                    fileName: "[project]/components/ui/ScrollHint.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-white",
                    children: hintText
                }, void 0, false, {
                    fileName: "[project]/components/ui/ScrollHint.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/ScrollHint.tsx",
            lineNumber: 53,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/ScrollHint.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ScrollHint, "Xq8nTITIX9IYCk5wKceoC+AqdRU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$portalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePortalStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollStore"]
    ];
});
_c = ScrollHint;
var _c;
__turbopack_context__.k.register(_c, "ScrollHint");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ScrollHint.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/ScrollHint.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_0w0sxmi._.js.map