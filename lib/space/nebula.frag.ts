/**
 * Nebula shader for the two page seams: a band of glowing gas lying across the
 * section boundary, with dark star-filled space above and below it.
 *
 * It models gas, not a surface. A nebula is translucent and emits its own light, so
 * the result here is EMISSION (colour that adds to what is behind it, stars shine
 * straight through) rather than an opaque, shaded body. There is deliberately no
 * rim light or relief shading: that is what makes a cloud read as liquid or satin.
 * What makes it read as gas is turbulence at many scales, hue that changes from
 * place to place, and dark dust that dims the light behind it.
 *
 * Layers, back to front (each drifts at its own speed and shifts a little as the
 * page scrolls, which is what gives the depth):
 *   1. a broad, faint blue-violet haze far behind;
 *   2. the body of the gas: 4-5 octaves of warped turbulence, coloured by an
 *      independent hue field, with a few hot cores;
 *   3. dust: soft dark patches that dim layers 1 and 2;
 *   4. wisps: thin, soft, brighter threads of a second hue in front of the dust.
 *
 * Everything is a function of WORLD coordinates (css px, x from the left edge of
 * the page, y relative to the seam line), so the half above a seam and the half
 * below it sample the very same field and meet by construction.
 *
 * Output is premultiplied with alpha = the brightest channel, which composites like
 * additive light over the dark sections around it while remaining a valid
 * premultiplied colour (no read-back clamping surprises).
 */

export const NEBULA_VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const NEBULA_FRAG = `
precision highp float;

uniform vec2  uRes;      // render target size in pixels
uniform vec2  uCss;      // slot size in css px
uniform vec2  uOrigin;   // world position (css px) of the slot's top-left corner
uniform float uWidth;    // full page width in css px (for horizontal palette runs)
uniform float uTime;
uniform float uScroll;   // window.scrollY in css px (0 for the still frame)
uniform vec2  uPointer;  // pointer in world css px
uniform float uPointerAmt;
uniform float uOct;      // base octave count (the gas body uses this + 2)
uniform float uPalette;  // 0 = blue / violet / magenta, 1 = amber / gold / mint / cyan
uniform float uBand;     // half-height of the bright core of the band, css px
uniform float uExtent;   // distance from the seam at which everything has dissolved
uniform float uPx;       // css px covered by one render pixel (unused, kept for the host)

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Slightly rough (gain 0.55): fine grain keeps its weight, which is the difference
// between smoke and a smooth blob.
float fbm(vec2 p, float oct) {
  float s = 0.0;
  float a = 0.5;
  float norm = 0.0;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    if (float(i) >= oct) break;
    s += a * vnoise(p);
    norm += a;
    p = m * p + 3.7;
    a *= 0.55;
  }
  return s / norm;
}

// Colour runs: take a position along the hue field, return the gas colour there.
vec3 runViolet(float x) {
  vec3 blue    = vec3(0.16, 0.34, 0.98);
  vec3 violet  = vec3(0.52, 0.28, 1.00);
  vec3 magenta = vec3(0.96, 0.24, 0.68);
  vec3 c = mix(blue, violet, smoothstep(0.0, 0.45, x));
  return mix(c, magenta, smoothstep(0.45, 0.95, x));
}

vec3 runAmber(float x) {
  vec3 amber = vec3(0.98, 0.50, 0.08);
  vec3 gold  = vec3(1.00, 0.76, 0.20);
  vec3 mint  = vec3(0.18, 0.86, 0.66);
  vec3 cyan  = vec3(0.12, 0.62, 0.98);
  vec3 run = mix(amber, gold, smoothstep(0.0, 0.32, x));
  run = mix(run, mint, smoothstep(0.38, 0.58, x));
  return mix(run, cyan, smoothstep(0.62, 0.88, x));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 css = vec2(uv.x, 1.0 - uv.y) * uCss;
  vec2 w = vec2(css.x, css.y + uOrigin.y);
  float yRel = w.y;
  float t = uTime;

  float xN = clamp(w.x / uWidth + 0.03 * sin(t * 0.05 + yRel * 0.004), 0.0, 1.0);

  // On a narrow screen the same gas would be a smear wider than the page, so the
  // field is scaled up as the page gets narrower (both halves share uWidth).
  float k = clamp(1440.0 / uWidth, 1.0, 2.4);
  vec2 p = vec2(w.x * 0.0022 * k, yRel * 0.0034 * k);

  // A soft push away from the pointer.
  vec2 dp = w - uPointer;
  float dl = length(dp) + 0.001;
  p += (dp / dl) * exp(-dl * dl / 32000.0) * 0.07 * uPointerAmt;

  float env  = exp(-pow(yRel / uBand, 2.0));                 // bright core
  float envW = exp(-pow(yRel / (uExtent * 0.58), 2.0));      // wide skirt
  float edge = 1.0 - smoothstep(0.40, 1.0, abs(yRel) / uExtent);

  // Each layer slides by a different amount as the page scrolls.
  vec2 pF = p * 0.5 + vec2(31.7 - t * 0.007 + uScroll * 0.00002, 7.3 + t * 0.004);
  vec2 pM = p + vec2(uScroll * 0.00005, 0.0);
  vec2 pN = p * 1.35 + vec2(11.1 + uScroll * 0.00009, 3.7 + uScroll * 0.00003);

  vec2 q = vec2(fbm(pM + t * 0.020, 3.0),
                fbm(pM + vec2(5.2, 1.3) - t * 0.016, 3.0));
  float f    = fbm(pM + 2.2 * q + vec2(1.7, 9.2) + t * 0.014, min(5.0, uOct + 2.0)); // body
  float hue  = fbm(pM * 0.55 + 1.2 * q + vec2(3.3, 8.1) - t * 0.010, 2.0);
  float far  = fbm(pF + 1.4 * q.yx, 3.0);
  float dust = fbm(pM * 0.8 + 2.6 * q.yx + vec2(9.1, 4.4), 3.0);
  float wv   = fbm(pN + 1.6 * q + t * 0.012, 4.0);

  // Where along the colour run this bit of gas sits: mostly its place on the page,
  // pushed around by an independent noise so neighbouring clouds differ in hue.
  float hs = clamp(xN * 0.7 + (hue - 0.5) * 1.4 + 0.15, 0.0, 1.0);
  vec3 gas, hot, wispCol, haze;
  if (uPalette < 0.5) {
    gas = runViolet(hs);
    hot = vec3(1.0, 0.86, 0.96);
    wispCol = vec3(0.30, 0.74, 1.00);
    haze = vec3(0.14, 0.18, 0.62);
  } else {
    gas = runAmber(hs);
    hot = vec3(1.0, 0.92, 0.72);
    wispCol = runAmber(1.0 - hs);
    haze = vec3(0.10, 0.20, 0.55);
  }

  // 1. Far haze
  float dFar = smoothstep(0.30, 0.78, far + envW * 0.20) * envW;
  vec3 e = haze * dFar * 0.55;

  // 2. Gas body: squared so the thin places fall away quickly and the thick ones glow
  float body = smoothstep(0.30, 0.80, f + env * 0.30 - 0.06);
  body *= body * (0.25 + 0.75 * envW);
  e += gas * body * 1.15;
  float core = smoothstep(0.62, 0.86, f) * env;
  e += hot * core * core * 0.55;

  // 3. Dust dims everything behind it
  float dk = smoothstep(0.52, 0.80, dust);
  e *= 1.0 - 0.78 * dk * (0.4 + 0.6 * envW);

  // 4. Wisps: soft bright threads in front of the dust, only where there is gas
  float ridge = 1.0 - abs(2.0 * wv - 1.0);
  float wisp = pow(smoothstep(0.66, 0.97, ridge), 1.5) * smoothstep(0.28, 0.60, f) * envW;
  e += wispCol * wisp * 0.50;

  e *= edge;

  // A faint glow right on the seam line, in the section colours, so the line is
  // covered even where the gas happens to be thin.
  e += mix(haze, gas, 0.5) * exp(-pow(yRel / (uBand * 1.4), 2.0)) * 0.20 * edge;

  e = min(e, vec3(1.0));

  // Dither: a long, dark gradient is exactly where 8-bit banding shows.
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 255.0;
  float lum = max(max(e.r, e.g), e.b);
  e += n * lum;
  float a = clamp(max(max(e.r, e.g), e.b), 0.0, 1.0);
  gl_FragColor = vec4(min(e, vec3(a)), a);
}
`;
