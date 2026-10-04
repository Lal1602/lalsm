/**
 * Shaders for the Observatory Plates gallery: one draw call paints every plate.
 *
 * Each plate is an instance of one quad. The vertex shader works out where it is
 * from a single uniform (uScroll, the rail position in plate units), mirroring
 * platePose() in layout.ts, so there is no per-plate JavaScript and nothing to
 * lerp per frame. The fragment shader reads the plate's picture out of a texture
 * atlas and treats it like a photographic plate: far from focus it is a dim, cold,
 * grainy, soft negative; as it comes to the centre it sharpens and develops into
 * the positive.
 */

export const PLATE_VERT = `
precision highp float;

attribute vec2 aCorner;   // (-1,-1) top-left .. (1,1) bottom-right
attribute float aInst;    // 0..SLOTS-1

uniform vec2  uCss;       // stage size, css px
uniform vec2  uPlate;     // plate size at scale 1, css px
uniform float uPitch;     // distance between plate centres, css px
uniform float uScroll;    // rail position, in plates
uniform float uReveal;    // 0..1 arrival animation
uniform float uCount;

varying vec2  vUv;
varying vec2  vSize;
varying float vFocus;
varying float vIdx;
varying float vRv;
varying float vO;

float sm(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float rail = floor(uScroll) - 2.0 + aInst;
  float o = rail - uScroll;
  float a = abs(o);

  // Same curve as platePose() in layout.ts.
  float scale = mix(mix(1.0, 0.78, sm(0.0, 1.0, a)), 0.66, sm(1.0, 2.0, a));
  float tilt = o * 0.045;
  float focus = 1.0 - sm(0.0, 1.0, a);

  // Arrival: each plate slides up out of the dark, the centre one first.
  float rv = sm(0.0, 1.0, clamp(uReveal * 1.7 - a * 0.22, 0.0, 1.0));

  vec2 centre = vec2(uCss.x * 0.5 + o * uPitch,
                     uCss.y * 0.5 + a * a * uPlate.y * 0.07 + (1.0 - rv) * 56.0);
  vec2 local = aCorner * 0.5 * uPlate * scale;
  float cs = cos(tilt);
  float sn = sin(tilt);
  vec2 p = centre + vec2(local.x * cs - local.y * sn, local.x * sn + local.y * cs);

  gl_Position = vec4(p.x / uCss.x * 2.0 - 1.0, 1.0 - p.y / uCss.y * 2.0, 0.0, 1.0);

  vUv = aCorner * 0.5 + 0.5;
  vSize = uPlate * scale;
  vFocus = focus;
  vIdx = mod(rail, uCount);
  vRv = rv;
  vO = o;
}
`;

export const PLATE_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uAtlas;
uniform vec2  uGrid;        // atlas columns, rows
uniform vec2  uAtlasPx;     // atlas size in texels
uniform float uTime;        // seconds; frozen when motion is reduced
uniform float uVel;         // rail velocity, plates per second
uniform float uHover;       // project index under the pointer, or -1
uniform float uFrame;       // frame width, css px

varying vec2  vUv;
varying vec2  vSize;
varying float vFocus;
varying float vIdx;
varying float vRv;
varying float vO;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Rounded-rectangle signed distance, negative inside.
float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// The picture at q (0..1 across the image, y down), taken from this plate's atlas cell.
vec3 pic(vec2 q, float idxRaw) {
  // A varying is interpolated, so an integer can arrive as 0.9999999 or 3.0000002.
  float idx = floor(idxRaw + 0.5);
  vec2 cell = vec2(mod(idx, uGrid.x), floor(idx / uGrid.x));
  vec2 pad = 0.5 / uAtlasPx;
  vec2 lo = cell / uGrid + pad;
  vec2 hi = (cell + 1.0) / uGrid - pad;
  vec2 uv = clamp((cell + clamp(q, 0.0, 1.0)) / uGrid, lo, hi);
  return texture2D(uAtlas, uv).rgb;
}

void main() {
  vec2 p = (vUv - 0.5) * vSize;                    // css px from the plate centre, y down
  float sd = sdRound(p, vSize * 0.5, 7.0);
  float cover = 1.0 - smoothstep(-0.6, 0.6, sd);
  if (cover < 0.003) discard;

  float f = vFocus;
  // Development: 0 = latent negative, 1 = finished positive. It follows focus, and
  // on arrival it lags behind the plate sliding in, so the picture "comes up".
  float dev = smoothstep(0.0, 1.0, f) * smoothstep(0.55, 1.0, vRv);

  float fr = uFrame;
  vec2 imgSize = vSize - 2.0 * fr;
  vec2 ip = abs(p) - imgSize * 0.5;
  float inImg = 1.0 - smoothstep(-0.6, 0.6, max(ip.x, ip.y));
  vec2 q = p / imgSize + 0.5;

  // ── The picture: out of focus and aberrated until it arrives ──
  float soft = (1.0 - f) * 7.0 / imgSize.x;        // blur radius, in image widths
  float ab = (1.0 - f) * 0.007;
  vec3 col = vec3(pic(q + vec2(ab, 0.0), vIdx).r, pic(q, vIdx).g, pic(q - vec2(ab, 0.0), vIdx).b);
  if (soft > 0.0006) {
    vec2 ar = vec2(1.0, imgSize.x / imgSize.y);
    vec3 acc = col;
    acc += pic(q + vec2( 1.0,  0.0) * soft * ar, vIdx);
    acc += pic(q + vec2(-1.0,  0.0) * soft * ar, vIdx);
    acc += pic(q + vec2( 0.0,  1.0) * soft * ar, vIdx);
    acc += pic(q + vec2( 0.0, -1.0) * soft * ar, vIdx);
    acc += pic(q + vec2( 0.7,  0.7) * soft * ar, vIdx);
    acc += pic(q + vec2(-0.7,  0.7) * soft * ar, vIdx);
    acc += pic(q + vec2( 0.7, -0.7) * soft * ar, vIdx);
    acc += pic(q + vec2(-0.7, -0.7) * soft * ar, vIdx);
    col = acc / 9.0;
  }

  // Latent image: before it is developed a plate is a cold blue-grey print, lifted
  // and low in contrast, with a trace of inversion; it gives way to the positive.
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 latent = mix(vec3(l) * vec3(0.55, 0.80, 1.00), vec3(1.0 - l) * vec3(0.45, 0.70, 0.95), 0.10);
  latent = (latent - 0.5) * 1.18 + 0.5 - 0.04;
  col = mix(latent, col, dev);

  // Exposure, and a little vignette inside the glass.
  col *= mix(0.74, 1.0, f) * mix(0.86, 1.0, dev);
  col *= 1.0 - 0.45 * dot(q - 0.5, q - 0.5);

  // Film grain: heavy on a latent plate, almost gone on a finished one.
  // Keep the hash arguments small: sin() of a large number is coarse and turns to patterned noise.
  float g = hash(floor(gl_FragCoord.xy) + vec2(mod(floor(uTime * 9.0), 61.0) * 17.0, 0.0)) - 0.5;
  col += g * ((1.0 - f) * 0.05 + (1.0 - dev) * 0.04 + 0.012);

  // A slow sheen across the glass, shifting as the rail moves.
  float sheen = smoothstep(0.07, 0.0, abs(fract(q.x + q.y * 0.55 - vO * 0.35) - 0.5) - 0.40);
  col += vec3(0.8, 0.9, 1.0) * sheen * 0.05 * f;

  // Light leak on the leading edge while the rail is moving.
  float leak = clamp(abs(uVel) * 0.45, 0.0, 1.0);
  float edgeX = uVel > 0.0 ? q.x : 1.0 - q.x;
  col += mix(vec3(0.20, 0.70, 1.00), vec3(1.00, 0.62, 0.22), step(0.0, uVel))
         * leak * smoothstep(0.55, 1.0, edgeX) * 0.35 * (0.4 + 0.6 * f);

  // ── The glass frame ──
  vec3 frame = vec3(0.032, 0.042, 0.068);
  frame += vec3(0.05, 0.06, 0.09) * smoothstep(-fr, 0.0, sd) * 0.5;
  // Registration ticks along the bottom edge, like the scale on a plate.
  float tickZone = step(vSize.y * 0.5 - fr, p.y) * step(p.y, vSize.y * 0.5 - fr * 0.4);
  frame += vec3(0.70, 0.80, 0.95) * step(0.86, fract(p.x / 9.0)) * tickZone * 0.20 * f;
  // Corner brackets on the plate in focus.
  vec2 cc = vSize * 0.5 - abs(p) - 4.0;
  float br = step(abs(cc.x), 0.6) * step(0.0, cc.y) * step(cc.y, 13.0)
           + step(abs(cc.y), 0.6) * step(0.0, cc.x) * step(cc.x, 13.0);
  frame += vec3(0.85, 0.95, 1.0) * clamp(br, 0.0, 1.0) * 0.6 * f;
  // Hairline edge, warmer where the plate is in focus.
  float rim = exp(-pow(sd + 0.9, 2.0) * 0.9);
  frame += mix(vec3(0.20, 0.26, 0.36), vec3(0.95, 0.80, 0.55), f) * rim * 0.55;
  // Hover.
  float hov = 1.0 - step(0.5, abs(floor(vIdx + 0.5) - uHover));
  frame += vec3(0.30, 0.80, 1.0) * hov * exp(-max(-sd, 0.0) * 0.35) * 0.30;

  vec3 outc = mix(frame, col, inImg);
  float alpha = cover * smoothstep(0.0, 0.45, vRv);
  gl_FragColor = vec4(clamp(outc, 0.0, 1.0) * alpha, alpha);
}
`;
