export type OrbState = "idle" | "listening" | "thinking" | "speaking" | "still";

/**
 * The assistant's face: an orb that shows what it is doing. Breathing when idle, ripples while it listens, a ring
 * that quickens while it thinks, bars that move while it answers; "still" is the same orb without any motion (the
 * little one beside each message). All of it is transform and opacity, in CSS (97-ai-chat.css).
 */
export default function Orb({ state = "idle", size = "md" }: { state?: OrbState; size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <span className="ai-orb" data-state={state} data-size={size} aria-hidden="true">
      <span className="ai-orb-halo" />
      <span className="ai-orb-ring" />
      <span className="ai-orb-ripple" />
      <span className="ai-orb-core" />
      <span className="ai-orb-bars">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
