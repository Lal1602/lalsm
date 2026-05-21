"use client";

export default function AboutSection() {
  return (
    <section className="section" id="about" aria-label="About Section">
      <div className="parallax-text" style={{ top: "50px", left: "-50px" }} data-speed="-0.1">ABOUT</div>
      <div className="container">
        <h2 className="section-title" data-scroll>About Me</h2>

        <div className="about-card-stack" data-cursor-text="DRAG">

          {/* Card 1 - Frontend */}
          <article className="about-layer-card card--cyan is-front" aria-label="Frontend Engineering">
            <div className="card-watermark" aria-hidden="true">01</div>
            <div className="card-ambient-glow glow--cyan" aria-hidden="true"></div>
            <div className="card-content-grid">
              <div className="card-col-info">
                <div className="card-icon-wrap">
                  {/* @ts-ignore */}
                  <ion-icon suppressHydrationWarning name="code-slash-outline" aria-hidden="true"></ion-icon>
                </div>
                <p className="card-eyebrow">// DISCIPLINE_01</p>
                <h3 className="card-title">Frontend<br /><em>Engineering</em></h3>
                <p className="card-desc">Architecting pixel-perfect, immersive web experiences with modern frameworks and WebGL interactions.</p>
              </div>
              <div className="card-col-tech">
                <div className="tech-terminal-box terminal--cyan">
                  <p className="terminal-header">
                    <span className="terminal-dot"></span>
                    <span className="terminal-dot"></span>
                    <span className="terminal-dot"></span> [ SYS.STACK ]
                  </p>
                  <div className="tech-stack-wrapper">
                    {/* @ts-ignore */}
                    {[["logo-javascript","JavaScript"],["logo-react","React.js"],["triangle-outline","Next.js 14"],["code-slash-outline","TypeScript"],["color-wand-outline","Tailwind CSS"],["flash-outline","GSAP"],["cube-outline","Three.js"],["layers-outline","WebGL"]].map(([icon,label])=>(
                      <span key={label} className={`tech-badge-pill${["GSAP","Three.js"].includes(label as string)?" highlight":""}`}>
                        {/* @ts-ignore */}
                        <ion-icon suppressHydrationWarning name={icon} aria-hidden="true"></ion-icon>{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 2 - Backend */}
          <article className="about-layer-card card--purple is-mid" aria-label="Backend and DevOps">
            <div className="card-watermark" aria-hidden="true">02</div>
            <div className="card-ambient-glow glow--purple" aria-hidden="true"></div>
            <div className="card-content-grid">
              <div className="card-col-info">
                <div className="card-icon-wrap">
                  {/* @ts-ignore */}
                  <ion-icon suppressHydrationWarning name="server-outline" aria-hidden="true"></ion-icon>
                </div>
                <p className="card-eyebrow">// DISCIPLINE_02</p>
                <h3 className="card-title">Backend &amp;<br /><em>DevOps</em></h3>
                <p className="card-desc">Building robust server-side logic, scalable APIs, and managing cloud infrastructure end-to-end.</p>
              </div>
              <div className="card-col-tech">
                <div className="tech-terminal-box terminal--purple">
                  <p className="terminal-header">
                    <span className="terminal-dot"></span><span className="terminal-dot"></span><span className="terminal-dot"></span> [ SYS.STACK ]
                  </p>
                  <div className="tech-stack-wrapper">
                    {[["logo-nodejs","Node.js"],["logo-docker","Docker"],["logo-firebase","Firebase"],["server-outline","PHP 8+"],["server-outline","Laravel"],["database-outline","MySQL"],["database-outline","PostgreSQL"],["logo-github","Git"]].map(([icon,label])=>(
                      <span key={label} className="tech-badge-pill">
                        {/* @ts-ignore */}
                        <ion-icon suppressHydrationWarning name={icon} aria-hidden="true"></ion-icon>{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 3 - Mobile & Game */}
          <article className="about-layer-card card--green is-back" aria-label="Mobile and Game Development">
            <div className="card-watermark" aria-hidden="true">03</div>
            <div className="card-ambient-glow glow--green" aria-hidden="true"></div>
            <div className="card-content-grid">
              <div className="card-col-info">
                <div className="card-icon-wrap">
                  {/* @ts-ignore */}
                  <ion-icon suppressHydrationWarning name="layers-outline" aria-hidden="true"></ion-icon>
                </div>
                <p className="card-eyebrow">// DISCIPLINE_03</p>
                <h3 className="card-title">Mobile &amp;<br /><em>Game Dev</em></h3>
                <p className="card-desc">Expanding digital horizons through cross-platform apps and interactive game mechanics.</p>
              </div>
              <div className="card-col-tech">
                <div className="tech-terminal-box terminal--green">
                  <p className="terminal-header">
                    <span className="terminal-dot"></span><span className="terminal-dot"></span><span className="terminal-dot"></span> [ SYS.STACK ]
                  </p>
                  <div className="tech-stack-wrapper">
                    {[["logo-react","React Native"],["logo-android","Android Studio"],["logo-figma","Figma"],["phone-portrait-outline","Flutter"],["game-controller-outline","Phaser.js"],["brush-outline","Canvas API"]].map(([icon,label])=>(
                      <span key={label} className={`tech-badge-pill${label==="Phaser.js"?" highlight":""}`}>
                        {/* @ts-ignore */}
                        <ion-icon suppressHydrationWarning name={icon} aria-hidden="true"></ion-icon>{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Drag hint */}
          <div className="stack-drag-hint" aria-hidden="true">
            {/* @ts-ignore */}
            <ion-icon suppressHydrationWarning name="swap-horizontal-outline"></ion-icon>drag to cycle
          </div>

          {/* Dot Pagination */}
          <div className="stack-pagination" role="tablist" aria-label="About card navigation">
            <button className="stack-dot stack-dot--cyan is-active" data-index="0" role="tab" aria-selected="true" aria-label="Frontend Engineering"></button>
            <button className="stack-dot stack-dot--purple" data-index="1" role="tab" aria-selected="false" aria-label="Backend and DevOps"></button>
            <button className="stack-dot stack-dot--green" data-index="2" role="tab" aria-selected="false" aria-label="Mobile and Game Dev"></button>
          </div>
        </div>
      </div>
    </section>
  );
}
