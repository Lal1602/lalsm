import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = "Bilal Sanayu Majid — Creative Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#f4f4f5",
          background:
            "radial-gradient(circle at 78% 18%, rgba(188,19,254,0.42), transparent 46%), radial-gradient(circle at 12% 88%, rgba(0,243,255,0.30), transparent 42%), #050505",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#00f3ff" }}>
          PORTFOLIO — SURABAYA, ID
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>
            BILAL
          </div>
          <div style={{ display: "flex", fontSize: 54, marginTop: 18, color: "#d4d4d8" }}>
            Creative Developer
          </div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 14, color: "#a1a1aa" }}>
            Immersive WebGL · GSAP motion · Full-stack products
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#a1a1aa" }}>
          <div style={{ display: "flex" }}>Next.js · Three.js · TypeScript</div>
          <div style={{ display: "flex" }}>{profile.name}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
