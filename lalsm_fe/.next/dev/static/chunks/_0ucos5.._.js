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
"[project]/components/models/Stars.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/stores/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/themeStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Stars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Stars.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const StarsContainer = ()=>{
    _s();
    const isDarkTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useThemeStore"])({
        "StarsContainer.useThemeStore[isDarkTheme]": (state)=>state.theme.type === 'dark'
    }["StarsContainer.useThemeStore[isDarkTheme]"]);
    if (!isDarkTheme) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Stars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stars"], {
        radius: 200,
        depth: 100,
        count: 5000,
        factor: 10,
        saturation: 10,
        fade: true,
        speed: 1
    }, void 0, false, {
        fileName: "[project]/components/models/Stars.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(StarsContainer, "qj/lKBiyY7V3bKbLfQiCK+npQFo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useThemeStore"]
    ];
});
_c = StarsContainer;
const __TURBOPACK__default__export__ = StarsContainer;
var _c;
__turbopack_context__.k.register(_c, "StarsContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/models/Cloud.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Cloud.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
;
;
const CloudContainer = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Clouds"], {
        material: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshBasicMaterial"],
        position: [
            0,
            -5,
            0
        ],
        frustumCulled: false,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cloud"], {
                seed: 1,
                segments: 1,
                concentrate: "inside",
                bounds: [
                    10,
                    10,
                    10
                ],
                growth: 3,
                position: [
                    -1,
                    0,
                    0
                ],
                smallestVolume: 2,
                scale: 1.9,
                volume: 2,
                speed: 0.2,
                fade: 5
            }, void 0, false, {
                fileName: "[project]/components/models/Cloud.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cloud"], {
                seed: 3,
                segments: 1,
                concentrate: "outside",
                bounds: [
                    10,
                    10,
                    10
                ],
                growth: 2,
                position: [
                    2,
                    0,
                    2
                ],
                smallestVolume: 2,
                scale: 1,
                volume: 2,
                fade: 3,
                speed: 0.1
            }, void 0, false, {
                fileName: "[project]/components/models/Cloud.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cloud"], {
                seed: 4,
                segments: 1,
                concentrate: "outside",
                bounds: [
                    10,
                    20,
                    15
                ],
                growth: 4,
                position: [
                    -10,
                    -10,
                    4
                ],
                smallestVolume: 2,
                scale: 2,
                speed: 0.2,
                volume: 3
            }, void 0, false, {
                fileName: "[project]/components/models/Cloud.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cloud"], {
                seed: 5,
                segments: 1,
                concentrate: "outside",
                bounds: [
                    5,
                    5,
                    5
                ],
                growth: 2,
                position: [
                    6,
                    -3,
                    8
                ],
                smallestVolume: 2,
                scale: 2,
                volume: 2,
                fade: 0.1,
                speed: 0.1
            }, void 0, false, {
                fileName: "[project]/components/models/Cloud.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cloud"], {
                seed: 6,
                segments: 1,
                concentrate: "outside",
                bounds: [
                    5,
                    5,
                    5
                ],
                growth: 2,
                position: [
                    0,
                    -20,
                    20
                ],
                smallestVolume: 2,
                scale: 4,
                volume: 3,
                fade: 0.1,
                speed: 0.1
            }, void 0, false, {
                fileName: "[project]/components/models/Cloud.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Cloud$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cloud"], {
                seed: 7,
                segments: 1,
                concentrate: "outside",
                bounds: [
                    5,
                    5,
                    5
                ],
                growth: 2,
                position: [
                    10,
                    -15,
                    -5
                ],
                smallestVolume: 2,
                scale: 3,
                volume: 3,
                fade: 0.1,
                speed: 0.1
            }, void 0, false, {
                fileName: "[project]/components/models/Cloud.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/models/Cloud.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = CloudContainer;
const __TURBOPACK__default__export__ = CloudContainer;
var _c;
__turbopack_context__.k.register(_c, "CloudContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/models/Wanderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 wanderer_above_the_sea_of_fog.glb --resolution 4096 --keepmaterials --types
Author: betocarrillo (https://sketchfab.com/betocarrillo)
License: CC-BY-SA-4.0 (http://creativecommons.org/licenses/by-sa/4.0/)
Source: https://sketchfab.com/3d-models/wanderer-above-the-sea-of-fog-518e605e9b734c86aab5bc22f9797f77
Title: Wanderer above the sea of fog
*/ __turbopack_context__.s([
    "Wanderer",
    ()=>Wanderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function Wanderer(props) {
    _s();
    const { nodes, materials } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])('models/wanderer_above_the_sea_of_fog.glb');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ...props,
        dispose: null,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            rotation: [
                -Math.PI / 2,
                0,
                0
            ],
            scale: 0.676,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                rotation: [
                    Math.PI / 2,
                    0,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            -11.413,
                            3.033,
                            16.793
                        ],
                        rotation: [
                            0.082,
                            -0.72,
                            0.054
                        ],
                        scale: 53.755,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            geometry: nodes.Object_14.geometry,
                            material: materials['media_image_Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog'],
                            scale: 0.05
                        }, void 0, false, {
                            fileName: "[project]/components/models/Wanderer.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/models/Wanderer.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        geometry: nodes.Object_4.geometry,
                        material: materials.brush_Ink,
                        position: [
                            -1.085,
                            -5.504,
                            -1.053
                        ],
                        scale: 15.005
                    }, void 0, false, {
                        fileName: "[project]/components/models/Wanderer.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        geometry: nodes.Object_6.geometry,
                        material: materials.brush_Ink,
                        position: [
                            -67.987,
                            12.094,
                            0.873
                        ],
                        scale: 301.917
                    }, void 0, false, {
                        fileName: "[project]/components/models/Wanderer.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        geometry: nodes.Object_8.geometry,
                        material: materials.brush_Ink,
                        position: [
                            -76.965,
                            320.305,
                            42.352
                        ],
                        scale: 436.942
                    }, void 0, false, {
                        fileName: "[project]/components/models/Wanderer.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        geometry: nodes.Object_10.geometry,
                        material: materials.brush_ThickPaint,
                        position: [
                            -22.074,
                            -11.378,
                            36.479
                        ],
                        scale: 159.654
                    }, void 0, false, {
                        fileName: "[project]/components/models/Wanderer.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        geometry: nodes.Object_12.geometry,
                        material: materials.brush_Marker,
                        position: [
                            -2.158,
                            -3.686,
                            -0.914
                        ],
                        scale: 0.259
                    }, void 0, false, {
                        fileName: "[project]/components/models/Wanderer.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/models/Wanderer.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/models/Wanderer.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/models/Wanderer.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(Wanderer, "3EbVibAGuOW6XeBFAk0EenvHzHI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"]
    ];
});
_c = Wanderer;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"].preload('models/wanderer_above_the_sea_of_fog.glb');
var _c;
__turbopack_context__.k.register(_c, "Wanderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/models/Memory.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 dalithe_persistence_of_memory.glb --transform --shadows --resolution 512 --keepmeshes --instance --types
Files: dalithe_persistence_of_memory.glb [451.54KB] > /Users/mohitvirli/Desktop/mohitvirli.github.io/public/dalithe_persistence_of_memory-transformed.glb [293.1KB] (35%)
Author: arloopa (https://sketchfab.com/arloopa)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/dalithe-persistence-of-memory-ab3e99facbdb4d9d8661d3f07815638e
Title: Dali,The Persistence of Memory
*/ __turbopack_context__.s([
    "Memory",
    ()=>Memory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function Memory(props) {
    _s();
    const { nodes, materials } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])('models/dalithe_persistence_of_memory.glb');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ...props,
        dispose: null,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes['Extract2_04_-_Default_0'].geometry,
                material: materials['04_-_Default'],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes.Cylinder006_Ceramic_0.geometry,
                material: materials.Ceramic,
                position: [
                    0.541,
                    0,
                    2.543
                ],
                rotation: [
                    -Math.PI / 2,
                    0,
                    0
                ],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes['Box001_05_-_Default_0'].geometry,
                material: materials['05_-_Default'],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes['Line005_02_-_Default_0'].geometry,
                material: materials['02_-_Default'],
                position: [
                    0,
                    0.005,
                    0
                ],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes['Cylinder003_01_-_Default_0'].geometry,
                material: materials['01_-_Default'],
                position: [
                    -0.584,
                    0.659,
                    -1.595
                ],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes['Sphere003_03_-_Default_0'].geometry,
                material: materials['03_-_Default'],
                position: [
                    -0.901,
                    0.331,
                    -1.311
                ],
                rotation: [
                    -Math.PI / 2,
                    0,
                    0
                ],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes['Line004_16_-_Matte_Plastic_0'].geometry,
                material: materials['16_-_Matte_Plastic'],
                rotation: [
                    -Math.PI / 2,
                    0,
                    0
                ],
                scale: 0.021
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                castShadow: true,
                receiveShadow: true,
                geometry: nodes.Cylinder007_Ceramic1_0.geometry,
                material: materials.Ceramic1,
                position: [
                    0.541,
                    0,
                    2.543
                ],
                rotation: [
                    -Math.PI / 2,
                    0,
                    0
                ],
                scale: 0.022
            }, void 0, false, {
                fileName: "[project]/components/models/Memory.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/models/Memory.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(Memory, "3EbVibAGuOW6XeBFAk0EenvHzHI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"]
    ];
});
_c = Memory;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"].preload('models/dalithe_persistence_of_memory.glb');
var _c;
__turbopack_context__.k.register(_c, "Memory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/models/WindowModel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/stores/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/scrollStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 window.glb --transform --shadows --resolution 512 --keepmeshes --instance --types
Files: window.glb [236.23KB] > /Users/mohitvirli/Desktop/mohitvirli.github.io/public/window-transformed.glb [38.44KB] (84%)
Author: AleixoAlonso (https://sketchfab.com/AleixoAlonso)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/residential-window-ae11104237314463a61251fd46ded4b4
Title: Residential Window
*/ 'use client';
;
;
;
;
const WindowModel = (props)=>{
    _s();
    const handleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const windowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { nodes, materials } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])('models/window.glb', true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "WindowModel.useFrame": ()=>{
            const scrollProgress = __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollStore"].getState().scrollProgress;
            // Map window opening and handle rotation to dynamic scroll progress ranges
            const b = Math.max(0, Math.min(1, (scrollProgress - 0.1) / 0.15));
            const c = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.15));
            if (handleRef.current) {
                handleRef.current.rotation.y = -0.5 * Math.PI * b;
            }
            if (windowRef.current) {
                windowRef.current.rotation.z = 0.5 * Math.PI * c;
            }
        }
    }["WindowModel.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ...props,
        dispose: null,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            rotation: [
                0,
                Math.PI,
                Math.PI
            ],
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    castShadow: true,
                    receiveShadow: true,
                    geometry: nodes['#WIN0003_Frame_#WIN0003_Textures_0'].geometry,
                    material: materials.WIN0003_Textures
                }, void 0, false, {
                    fileName: "[project]/components/models/WindowModel.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                    position: [
                        0.441,
                        -0.039,
                        0.082
                    ],
                    ref: windowRef,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            castShadow: true,
                            receiveShadow: true,
                            geometry: nodes['#WIN0003_Window_#WIN0003_Textures_0'].geometry,
                            material: materials.WIN0003_Textures
                        }, void 0, false, {
                            fileName: "[project]/components/models/WindowModel.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            ref: handleRef,
                            castShadow: true,
                            receiveShadow: true,
                            geometry: nodes['#WIN0003_Handle_#WIN0003_Textures_0'].geometry,
                            material: materials.WIN0003_Textures,
                            position: [
                                -0.84,
                                -0.018,
                                0.55
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/models/WindowModel.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/models/WindowModel.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/models/WindowModel.tsx",
            lineNumber: 52,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/models/WindowModel.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(WindowModel, "xV2LdKTHvzUpg0EbmqylSTzejTU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = WindowModel;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"].preload('models/window.glb');
const __TURBOPACK__default__export__ = WindowModel;
var _c;
__turbopack_context__.k.register(_c, "WindowModel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ThreeBackground.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Preload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Preload.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/stores/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/scrollStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/stores/themeStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Stars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/models/Stars.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Cloud$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/models/Cloud.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Wanderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/models/Wanderer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Memory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/models/Memory.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$WindowModel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/models/WindowModel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
// Sub-component to drive real-time camera movements and model animations
const BackgroundSceneContent = ()=>{
    _s();
    const scrollProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollStore"])({
        "BackgroundSceneContent.useScrollStore[scrollProgress]": (state)=>state.scrollProgress
    }["BackgroundSceneContent.useScrollStore[scrollProgress]"]);
    const isDarkTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useThemeStore"])({
        "BackgroundSceneContent.useThemeStore[isDarkTheme]": (state)=>state.theme.type === "dark"
    }["BackgroundSceneContent.useThemeStore[isDarkTheme]"]);
    const windowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const memoryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wandererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "BackgroundSceneContent.useFrame": (state, delta)=>{
            // 1. Interactive 3D cursor panning parallax (dampen camera shift on mouse pointer movement)
            const targetX = state.pointer.x * 2.5;
            const targetY = state.pointer.y * 1.5;
            state.camera.position.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(state.camera.position.x, targetX, 2.5, delta);
            state.camera.position.y = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(state.camera.position.y, targetY + 2, 2.5, delta);
            // 2. Immersive scroll depth progression (plunge camera on scroll)
            const targetZ = 6 + scrollProgress * 18;
            state.camera.position.z = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(state.camera.position.z, targetZ, 2.5, delta);
            // 3. Subtle floating rotation and wave animations for 3D elements
            const elapsed = state.clock.getElapsedTime();
            if (windowRef.current) {
                windowRef.current.rotation.y = elapsed * 0.04;
                windowRef.current.position.y = -26.5 + Math.sin(elapsed * 0.4) * 0.15;
            }
            if (memoryRef.current) {
                memoryRef.current.rotation.y = -elapsed * 0.06;
                memoryRef.current.position.y = -4 + Math.cos(elapsed * 0.3) * 0.2;
            }
            if (wandererRef.current) {
                wandererRef.current.rotation.y = elapsed * 0.05;
                wandererRef.current.position.y = -10 + Math.sin(elapsed * 0.35) * 0.15;
            }
        }
    }["BackgroundSceneContent.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: isDarkTheme ? 0.35 : 0.75
            }, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    10,
                    10,
                    10
                ],
                intensity: 1.5
            }, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    -5,
                    8,
                    -5
                ],
                intensity: 1.2
            }, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Stars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Cloud$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: windowRef,
                position: [
                    0,
                    -26.5,
                    5.69
                ],
                scale: 0.75,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                        castShadow: true,
                        position: [
                            1,
                            1,
                            -2.5
                        ],
                        intensity: 60,
                        distance: 10
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ThreeBackground.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$WindowModel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/components/ui/ThreeBackground.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: memoryRef,
                position: [
                    -3.5,
                    -4,
                    -6
                ],
                scale: 1.2,
                rotation: [
                    0.2,
                    0.4,
                    0.1
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Memory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Memory"], {}, void 0, false, {
                    fileName: "[project]/components/ui/ThreeBackground.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: wandererRef,
                position: [
                    3.8,
                    -10,
                    -8
                ],
                scale: 0.05,
                rotation: [
                    0.1,
                    -0.4,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$models$2f$Wanderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Wanderer"], {}, void 0, false, {
                    fileName: "[project]/components/ui/ThreeBackground.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s(BackgroundSceneContent, "D232cvhoYfEw8bWBZZmxi4pv1Bc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$scrollStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$stores$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useThemeStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = BackgroundSceneContent;
// React.memo protects the canvas from re-rendering during state updates elsewhere in the DOM
const ThreeBackground = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].memo(_c1 = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "canvas-container",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
            camera: {
                position: [
                    0,
                    2,
                    6
                ],
                fov: 75
            },
            gl: {
                antialias: true,
                alpha: true
            },
            dpr: [
                1,
                2
            ],
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: null,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackgroundSceneContent, {}, void 0, false, {
                        fileName: "[project]/components/ui/ThreeBackground.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Preload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Preload"], {
                        all: true
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ThreeBackground.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/ThreeBackground.tsx",
                lineNumber: 93,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/ui/ThreeBackground.tsx",
            lineNumber: 88,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/ThreeBackground.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c2 = ThreeBackground;
ThreeBackground.displayName = "ThreeBackground";
const __TURBOPACK__default__export__ = ThreeBackground;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "BackgroundSceneContent");
__turbopack_context__.k.register(_c1, "ThreeBackground$React.memo");
__turbopack_context__.k.register(_c2, "ThreeBackground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ThreeBackground.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/ThreeBackground.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_0ucos5.._.js.map