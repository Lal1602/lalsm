/**
 * Second pass of the seam renderer, run at FULL resolution (the nebula pass
 * underneath runs at a fraction of it).
 *
 * It samples the low-resolution nebula and lays everything that has to stay
 * crisp on top of it: two layers of drifting star dust, hand-placed
 * constellations, and one rare comet. Doing this in the same GL pass, instead of
 * as separately animated page layers, is deliberate: a CSS animation over a big
 * translucent layer makes the browser composite that whole area on every display
 * refresh, which on an integrated GPU cost far more than the shader itself. Here
 * the seam updates at its own slow tick and sits still in between.
 */

export const STARS_FRAG = `
precision highp float;

uniform sampler2D uNeb;
uniform vec2  uRes;
uniform vec2  uCss;
uniform vec2  uOrigin;
uniform float uWidth;
uniform float uTime;
uniform float uPalette;   // 0 = cool white / pink / violet, 1 = warm gold / mint / sky
uniform float uDust;      // 0..1 density of the fine dust
uniform float uMotes;     // 0 or 1: the larger glowing motes
uniform sampler2D uConst; // constellations, painted once on a 2D canvas (premultiplied)
uniform vec2  uNebMap;    // scale and offset into the (taller) nebula texture, see SpaceRenderer
uniform vec4  uComet;     // start x, start y, direction x, direction y (world css px)
uniform float uPaper;     // 1 on the light theme: stars are specks of ink, not points of light

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 tone(float pick, float xN) {
  if (uPalette < 0.5) {
    return pick < 0.34 ? vec3(0.78, 0.88, 1.0)
         : pick < 0.62 ? vec3(1.0, 0.80, 0.95)
         : pick < 0.82 ? vec3(0.77, 0.69, 1.0)
         : vec3(1.0, 0.93, 0.78);
  }
  return xN < 0.4 ? vec3(1.0, 0.91, 0.62) : xN < 0.65 ? vec3(0.73, 1.0, 0.89) : vec3(0.69, 0.87, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec4 neb = texture2D(uNeb, vec2(uv.x, uv.y * uNebMap.x + uNebMap.y));

  vec2 css = vec2(uv.x, 1.0 - uv.y) * uCss;
  vec2 w = vec2(css.x, css.y + uOrigin.y);
  float xN = clamp(w.x / uWidth, 0.0, 1.0);

  vec3 glow = vec3(0.0);
  float cover = 0.0;

  // ── Fine dust: a grid of cells, one grain in some of them, drifting sideways ──
  {
    vec2 g = (w + vec2(uTime * 3.2, uTime * 0.7)) / 21.0;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash21(id);
    if (h > 1.0 - 0.20 * uDust) {
      vec2 off = (vec2(hash21(id + 3.1), hash21(id + 8.7)) - 0.5) * 0.7;
      float d = length(f - off) * 21.0;
      float r = 0.5 + hash21(id + 1.3) * 0.55;
      float tw = 0.55 + 0.45 * sin(uTime * (0.8 + h * 3.0) + h * 50.0);
      float s = smoothstep(r + 0.55, r - 0.15, d) * tw * (0.3 + 0.7 * hash21(id + 5.0));
      glow += tone(hash21(id + 9.0), xN) * s;
      cover = max(cover, s);
    }
  }

  // ── Motes: fewer, larger, with a soft halo; they drift the other way, slower ──
  if (uMotes > 0.5) {
    vec2 g = (w + vec2(uTime * 1.5, -uTime * 0.45) + 400.0) / 63.0;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash21(id + 17.0);
    if (h > 0.78) {
      vec2 off = (vec2(hash21(id + 2.3), hash21(id + 6.1)) - 0.5) * 0.55;
      float d = length(f - off) * 63.0;
      float r = 0.9 + hash21(id + 4.4) * 1.3;
      float tw = 0.5 + 0.5 * sin(uTime * (0.35 + h * 1.2) + h * 30.0);
      float core = smoothstep(r + 0.6, r - 0.2, d);
      float halo = exp(-d * d / (r * r * 14.0)) * 0.42;
      float s = (core + halo) * tw;
      glow += tone(hash21(id + 12.0), xN) * s;
      cover = max(cover, min(1.0, s));
    }
  }

  // ── Constellations: one texture read, pulsed ──
  float pulse = 0.86 + 0.14 * sin(uTime * 0.62);
  vec4 cs = texture2D(uConst, vec2(uv.x, 1.0 - uv.y));
  glow += cs.rgb * pulse * 1.35;
  cover = max(cover, cs.a * pulse);

  // ── Comet: crosses once every ~41s along a straight path, then is gone ──
  {
    float period = 41.0;
    float phase = fract(uTime / period);
    float span = 0.046;
    if (phase < span) {
      float k = phase / span;
      vec2 dir = normalize(uComet.zw);
      vec2 head = uComet.xy + dir * k * 760.0;
      vec2 pa = w - head;
      float along = dot(pa, -dir);          // distance behind the head
      float across = length(pa + dir * along);
      float tail = 150.0;
      if (along > 0.0 && along < tail) {
        float taper = 1.0 - along / tail;
        float c = smoothstep(1.4 * taper + 0.3, 0.0, across) * taper * taper * sin(k * 3.14159);
        glow += vec3(1.0) * c;
        cover = max(cover, c);
      }
    }
  }

  cover = clamp(cover, 0.0, 1.0);
  if (uPaper > 0.5) {
    // A printed atlas: whatever was a point of light is a mark in ink, dense where the light was bright.
    vec3 inkC = vec3(0.106, 0.114, 0.20);
    float k = cover * 0.9;
    vec3 prgb = neb.rgb * (1.0 - k) + inkC * k;
    float pa = neb.a * (1.0 - k) + k;
    gl_FragColor = vec4(min(prgb, vec3(pa)), pa);
    return;
  }
  glow = min(glow, vec3(1.0));
  // Premultiplied "over": the crisp layer sits on top of the nebula.
  vec3 rgb = neb.rgb * (1.0 - cover) + glow;
  float a = neb.a * (1.0 - cover) + cover;
  gl_FragColor = vec4(min(rgb, vec3(a)), a);
}
`;
