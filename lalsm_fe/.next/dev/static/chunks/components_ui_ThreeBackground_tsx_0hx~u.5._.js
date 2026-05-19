(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/ThreeBackground.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThreeBackground
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ThreeBackground() {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThreeBackground.useEffect": ()=>{
            let animId;
            let renderer = null;
            async function init() {
                const THREE = await __turbopack_context__.A("[project]/node_modules/three/build/three.module.js [app-client] (ecmascript, async loader)");
                if (!containerRef.current) return;
                const scene = new THREE.Scene();
                scene.fog = new THREE.FogExp2(0x050505, 0.002);
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                renderer = new THREE.WebGLRenderer({
                    alpha: true,
                    antialias: true
                });
                renderer.setSize(window.innerWidth, window.innerHeight);
                containerRef.current.appendChild(renderer.domElement);
                // Starfield
                const particlesCount = 6000;
                const posArray = new Float32Array(particlesCount * 3);
                for(let i = 0; i < particlesCount * 3; i++){
                    posArray[i] = (Math.random() - 0.5) * 20;
                }
                const particlesGeometry = new THREE.BufferGeometry();
                particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
                const particlesMesh = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({
                    size: 0.04,
                    color: 0x00f3ff,
                    transparent: true,
                    opacity: 0.5,
                    blending: THREE.AdditiveBlending
                }));
                scene.add(particlesMesh);
                // Floating shapes
                const geometry = new THREE.IcosahedronGeometry(0.5, 0);
                const shapeMaterial = new THREE.MeshBasicMaterial({
                    color: 0xbc13fe,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.06,
                    blending: THREE.AdditiveBlending
                });
                const shapesCount = 50;
                const shapesMesh = new THREE.InstancedMesh(geometry, shapeMaterial, shapesCount);
                const dummy = new THREE.Object3D();
                const shapeData = [];
                for(let i = 0; i < shapesCount; i++){
                    dummy.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 15 - 5);
                    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    const scale = Math.random() * 0.8 + 0.2;
                    dummy.scale.set(scale, scale, scale);
                    dummy.updateMatrix();
                    shapesMesh.setMatrixAt(i, dummy.matrix);
                    shapeData.push({
                        x: dummy.position.x,
                        y: dummy.position.y,
                        z: dummy.position.z,
                        rotSpeedX: (Math.random() - 0.5) * 0.005,
                        rotSpeedY: (Math.random() - 0.5) * 0.005,
                        floatSpeed: Math.random() * 0.003 + 0.001,
                        timeOffset: Math.random() * 100
                    });
                }
                scene.add(shapesMesh);
                camera.position.z = 4;
                let mouseX = 0, mouseY = 0;
                const onMouseMove = {
                    "ThreeBackground.useEffect.init.onMouseMove": (e)=>{
                        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
                        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
                    }
                }["ThreeBackground.useEffect.init.onMouseMove"];
                document.addEventListener("mousemove", onMouseMove);
                const clock = new THREE.Clock();
                function animate() {
                    animId = requestAnimationFrame(animate);
                    const elapsedTime = clock.getElapsedTime();
                    camera.position.z = 4 - window.scrollY * 0.0025;
                    particlesMesh.rotation.y = elapsedTime * 0.05;
                    particlesMesh.rotation.z = window.scrollY * 0.0002;
                    for(let i = 0; i < shapesCount; i++){
                        const data = shapeData[i];
                        dummy.position.set(data.x + mouseX * 1.5, data.y + Math.sin(elapsedTime * data.floatSpeed + data.timeOffset) + mouseY * 1.5, data.z);
                        dummy.rotation.set(elapsedTime * data.rotSpeedX, elapsedTime * data.rotSpeedY, 0);
                        dummy.updateMatrix();
                        shapesMesh.setMatrixAt(i, dummy.matrix);
                    }
                    shapesMesh.instanceMatrix.needsUpdate = true;
                    renderer.render(scene, camera);
                }
                animate();
                const onResize = {
                    "ThreeBackground.useEffect.init.onResize": ()=>{
                        camera.aspect = window.innerWidth / window.innerHeight;
                        camera.updateProjectionMatrix();
                        renderer.setSize(window.innerWidth, window.innerHeight);
                    }
                }["ThreeBackground.useEffect.init.onResize"];
                window.addEventListener("resize", onResize);
                return ({
                    "ThreeBackground.useEffect.init": ()=>{
                        cancelAnimationFrame(animId);
                        document.removeEventListener("mousemove", onMouseMove);
                        window.removeEventListener("resize", onResize);
                        if (renderer && containerRef.current) {
                            try {
                                containerRef.current.removeChild(renderer.domElement);
                            } catch (e) {}
                            renderer.dispose();
                        }
                    }
                })["ThreeBackground.useEffect.init"];
            }
            const cleanup = init();
            return ({
                "ThreeBackground.useEffect": ()=>{
                    cleanup.then({
                        "ThreeBackground.useEffect": (fn)=>fn && fn()
                    }["ThreeBackground.useEffect"]);
                }
            })["ThreeBackground.useEffect"];
        }
    }["ThreeBackground.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "canvas-container",
        ref: containerRef
    }, void 0, false, {
        fileName: "[project]/components/ui/ThreeBackground.tsx",
        lineNumber: 149,
        columnNumber: 10
    }, this);
}
_s(ThreeBackground, "8puyVO4ts1RhCfXUmci3vLI3Njw=");
_c = ThreeBackground;
var _c;
__turbopack_context__.k.register(_c, "ThreeBackground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ThreeBackground.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/ThreeBackground.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_ThreeBackground_tsx_0hx~u.5._.js.map