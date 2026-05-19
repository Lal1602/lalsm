"use client";

export default function WorkflowSection() {
  const steps = [
    {
      num: "01",
      label: "Discovery",
      icon: "search-outline",
      title: "Discovery",
      desc: "Deep dive into requirements, user research, and strategic planning to map the full picture before a single pixel is drawn.",
    },
    {
      num: "02",
      label: "Design",
      icon: "color-palette-outline",
      title: "Design",
      desc: "Crafting intuitive high-fidelity prototypes and user-centric interfaces that feel inevitable in retrospect.",
    },
    {
      num: "03",
      label: "Development",
      icon: "code-working-outline",
      title: "Development",
      desc: "Writing clean, scalable code with modern tech stacks, enforcing best practices and performance from day one.",
    },
    {
      num: "04",
      label: "Deployment",
      icon: "rocket-outline",
      title: "Deployment",
      desc: "CI/CD pipelines, performance optimization, server configuration, and post-launch monitoring for zero-downtime ships.",
    },
  ];

  return (
    <section className="section" id="workflow" aria-label="Workflow Section">
      <div className="parallax-text" style={{ top: "10%", left: "10%" }} data-speed="0.1">PROCESS</div>
      <div className="container">
        <h2 className="section-title" data-scroll>How I Work</h2>

        <ol className="workflow-typography-list" aria-label="Workflow steps">
          {steps.map((step) => (
            <li
              key={step.num}
              className="workflow-text-item"
              data-icon={step.icon}
              data-title={step.title}
              data-desc={step.desc}
              aria-label={`Step ${step.num} — ${step.label}`}
            >
              <span className="num-prefix" aria-hidden="true">{step.num} —</span>{" "}
              {step.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
