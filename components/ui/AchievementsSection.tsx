"use client";
import Image from "next/image";
import {
  achievementsTrack1 as track1,
  achievementsTrack2 as track2,
  type Achievement,
} from "@/data/achievements";

type CertCard = Achievement;

function MarqueeCard({ c, hidden }: { c: CertCard; hidden?: boolean }) {
  return (
    <article
      className="marquee-card"
      aria-hidden={hidden ? "true" : undefined}
      data-image={c.image}
      data-title={c.title}
      data-desc={c.desc}
      data-link={c.link}
    >
      <div className="marquee-card-img-wrap">
        <Image
          src={c.image}
          alt={hidden ? "" : c.title}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
        />
      </div>
      <div className="marquee-card-body">
        <span className="marquee-card-tag">{c.tag}</span>
        <h3 className="marquee-card-title">{c.heading} <em>{c.em}</em></h3>
        <p className="marquee-card-meta">{c.meta}</p>
        <button className="btn-quick-view marquee-card-btn" tabIndex={hidden ? -1 : 0} aria-label={`View ${c.heading} Certificate`}>
          <ion-icon suppressHydrationWarning name="eye-outline" aria-hidden="true"></ion-icon>
        </button>
      </div>
    </article>
  );
}

export default function AchievementsSection() {
  return (
    <section className="section ach-marquee-section" id="achievements" aria-label="Achievements Section">
      <div className="container">
        <div className="ach-list-header" data-scroll>
          <h2 className="section-title" style={{ borderBottomColor: "var(--accent-gold)" }}>Achievements</h2>
        </div>
      </div>

      <div className="achievements-marquee-wrapper">
        {/* Track 1: scrolls LEFT */}
        <div className="marquee-track track-left">
          {track1.map((c, i) => <MarqueeCard key={i} c={c} />)}
          {track1.map((c, i) => <MarqueeCard key={`d${i}`} c={c} hidden />)}
        </div>

        {/* Track 2: scrolls RIGHT */}
        <div className="marquee-track track-right">
          {track2.map((c, i) => <MarqueeCard key={i} c={c} />)}
          {track2.map((c, i) => <MarqueeCard key={`d${i}`} c={c} hidden />)}
        </div>
      </div>
    </section>
  );
}
