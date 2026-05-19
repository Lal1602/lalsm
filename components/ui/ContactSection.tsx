"use client";

export default function ContactSection() {
  return (
    <section className="section" id="contact" aria-label="Contact Section">
      <div className="container">
        <h2 className="section-title" data-scroll>Contact Me</h2>

        <div className="contact-wrapper">
          {/* Left: Info card */}
          <article className="glass-card contact-glass-card" data-scroll>
            <div className="uplink-status" aria-label="Connection status: Secure uplink established">
              <span className="live-dot" aria-hidden="true"></span>
              SECURE UPLINK ESTABLISHED
            </div>

            <h3>Let&apos;s collaborate</h3>
            <p className="contact-subtext">
              I bring rapid solutions to make the life of my clients easier. Have any questions? Reach out!
            </p>

            <div className="hud-divider" aria-hidden="true">
              <span></span><span className="hud-divider-diamond">◆</span><span></span>
            </div>

            <div className="contact-info-list">
              <a href="mailto:bilal.lalsm@gmail.com" className="contact-info-row" aria-label="Email Bilal">
                <span className="contact-info-icon">
                  {/* @ts-ignore */}
                  <ion-icon suppressHydrationWarning name="mail-outline" aria-hidden="true"></ion-icon>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-label">// EMAIL</span>
                  bilal.lalsm@gmail.com
                </span>
              </a>
              <a href="tel:+62895340180343" className="contact-info-row" aria-label="Call Bilal">
                <span className="contact-info-icon">
                  {/* @ts-ignore */}
                  <ion-icon suppressHydrationWarning name="call-outline" aria-hidden="true"></ion-icon>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-label">// PHONE</span>
                  +62 895-3401-80343
                </span>
              </a>
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  {/* @ts-ignore */}
                  <ion-icon suppressHydrationWarning name="location-outline" aria-hidden="true"></ion-icon>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-label">// NODE</span>
                  Surabaya, East Java, ID
                </span>
              </div>
            </div>

            <span className="hud-corner hud-tl" aria-hidden="true"></span>
            <span className="hud-corner hud-tr" aria-hidden="true"></span>
            <span className="hud-corner hud-bl" aria-hidden="true"></span>
            <span className="hud-corner hud-br" aria-hidden="true"></span>
          </article>

          {/* Right: Form */}
          <form
            action="https://api.web3forms.com/submit"
            method="POST"
            className="contact-form hud-form"
            data-scroll
            aria-label="Contact form"
          >
            <input type="hidden" name="access_key" value="25ba6941-8e69-4b9f-b267-15d2cd90f679" />

            <div className="hud-form-header" aria-hidden="true">
              <span className="hud-form-tag">UPLINK_FORM.exe</span>
              <span className="hud-form-tag-right">ENCRYPTION: AES-256</span>
            </div>

            <div className="hud-input-group">
              <input type="text" name="name" id="contact-name" required autoComplete="name" aria-label="Your Name" placeholder=" " />
              <label htmlFor="contact-name">ID / Name</label>
              <span className="focus-border" aria-hidden="true"></span>
            </div>

            <div className="hud-input-group">
              <input type="email" name="email" id="contact-email" required autoComplete="email" aria-label="Your Email" placeholder=" " />
              <label htmlFor="contact-email">Signal / Email</label>
              <span className="focus-border" aria-hidden="true"></span>
            </div>

            <div className="hud-input-group hud-input-group--textarea">
              <textarea name="message" id="contact-message" rows={5} required aria-label="Your Message" placeholder=" "></textarea>
              <label htmlFor="contact-message">Transmission / Message</label>
              <span className="focus-border" aria-hidden="true"></span>
            </div>

            <button type="submit" className="btn hud-submit-btn">
              {/* @ts-ignore */}
              <ion-icon suppressHydrationWarning name="send-outline" aria-hidden="true"></ion-icon>
              Transmit Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
