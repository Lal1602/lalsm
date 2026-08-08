"use client";

import { useChatStore } from "@/stores";
import { useEffect, useRef, useState } from "react";

const TypingBubble = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      i += 1;
      setDisplayedText(text.slice(0, i));
      
      if (spanRef.current) {
        const scrollContainer = spanRef.current.closest('.ai-chat-messages');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval); 
  }, [text]);

  return (
    <span ref={spanRef}>
      {displayedText}
      {displayedText.length < text.length && <span className="ai-chat-typing-cursor" />}
    </span>
  );
};

export default function AiChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearHistory } = useChatStore();
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages list changes or when chat panel opens
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("ai-chat-sidebar-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("ai-chat-sidebar-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("ai-chat-sidebar-open");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();
    setInput("");
    await sendMessage(currentInput);
  };

  return (
    <>
      {/* Docked Sidebar Panel — always rendered, visibility via CSS transform */}
      <div className={`ai-chat-sidebar ${isOpen ? "open" : ""}`}>
        {/* ── CREATIVE BACKGROUND LAYERS (ENHANCED & INTRICATE) ── */}
        <div className="ai-chat-bg-pattern"></div>
        
        {/* Abstract Assymetric SVG Overlay */}
        <div className="ai-chat-bg-shapes">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.08)" />
                <stop offset="50%" stopColor="rgba(0, 243, 255, 0.03)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.08)" />
              </linearGradient>
              <pattern id="tech-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" className="ai-chat-svg-stroke" opacity="0.15" />
                <circle cx="10" cy="10" r="0.8" fill="currentColor" className="ai-chat-svg-fill" opacity="0.3" />
              </pattern>
              <pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.5" fill="currentColor" className="ai-chat-svg-fill" opacity="0.15" />
              </pattern>
            </defs>

            {/* Base gradients and grids */}
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#bg-grad-1)" opacity="0.8" />
            <rect width="100" height="100" fill="url(#tech-grid)" />
            
            {/* Absurd & Complex Geometric Shapes */}
            {/* Massive asymmetric curve */}
            <path d="M-20,30 Q 40,-10 120,40 T 120,110" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="0.8" />
            <path d="M-20,32 Q 40,-8 120,42 T 120,112" fill="none" stroke="rgba(0, 243, 255, 0.1)" strokeWidth="0.3" />
            
            {/* Wavy DNA-like helix crossing the screen */}
            <path d="M10,-10 C 30,20 -10,50 40,80 S 10,120 50,150" fill="none" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.6" strokeDasharray="2, 1" />
            <path d="M15,-10 C 35,20 -5,50 45,80 S 15,120 55,150" fill="none" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="0.4" />

            {/* Geometric Nodes & Data Points */}
            <g opacity="0.6">
              <circle cx="85" cy="25" r="4" fill="rgba(139, 92, 246, 0.1)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="0.3" />
              <circle cx="85" cy="25" r="1.5" fill="rgba(139, 92, 246, 0.6)" />
              <line x1="85" y1="25" x2="65" y2="15" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.4" />
              
              <circle cx="20" cy="75" r="6" fill="rgba(0, 243, 255, 0.05)" stroke="rgba(0, 243, 255, 0.3)" strokeWidth="0.2" strokeDasharray="1,1" />
              <circle cx="20" cy="75" r="2" fill="rgba(0, 243, 255, 0.5)" />
              <line x1="20" y1="75" x2="40" y2="85" stroke="rgba(0, 243, 255, 0.3)" strokeWidth="0.4" />
              <line x1="40" y1="85" x2="50" y2="70" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="0.3" />
              <circle cx="50" cy="70" r="1" fill="rgba(0, 243, 255, 0.4)" />
              
              {/* Floating Polygons */}
              <polygon points="10,40 18,35 22,45 15,50" fill="rgba(139, 92, 246, 0.15)" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.2" />
              <polygon points="70,70 85,60 95,75 80,85" fill="url(#dots)" stroke="rgba(37, 99, 235, 0.3)" strokeWidth="0.4" />
              <polygon points="40,15 45,10 50,18" fill="rgba(0, 243, 255, 0.2)" />
            </g>

            {/* Tech UI Elements (Crosshairs, brackets) */}
            <path d="M 5,5 L 15,5 M 5,5 L 5,15" fill="none" stroke="currentColor" className="ai-chat-svg-stroke" strokeWidth="0.5" opacity="0.3" />
            <path d="M 95,5 L 85,5 M 95,5 L 95,15" fill="none" stroke="currentColor" className="ai-chat-svg-stroke" strokeWidth="0.5" opacity="0.3" />
            <path d="M 5,95 L 15,95 M 5,95 L 5,85" fill="none" stroke="currentColor" className="ai-chat-svg-stroke" strokeWidth="0.5" opacity="0.3" />
            <path d="M 95,95 L 85,95 M 95,95 L 95,85" fill="none" stroke="currentColor" className="ai-chat-svg-stroke" strokeWidth="0.5" opacity="0.3" />
            
            {/* Circuit traces */}
            <path d="M 30,100 L 30,90 L 45,75 L 45,65" fill="none" stroke="currentColor" className="ai-chat-svg-stroke" strokeWidth="0.3" opacity="0.2" />
            <circle cx="45" cy="65" r="0.8" fill="currentColor" className="ai-chat-svg-fill" opacity="0.4" />
            
            <path d="M 100,50 L 90,50 L 80,40 L 70,40" fill="none" stroke="currentColor" className="ai-chat-svg-stroke" strokeWidth="0.3" opacity="0.2" />
            <circle cx="70" cy="40" r="0.8" fill="currentColor" className="ai-chat-svg-fill" opacity="0.4" />
          </svg>
        </div>

        {/* Holographic background gradient elements */}
        <div className="ai-chat-glow-1"></div>
        <div className="ai-chat-glow-2"></div>

        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-status-dot">
              <span className="ai-chat-status-ping"></span>
            </div>
            <div>
              <h3 className="ai-chat-title">
                B.I.L.A.L. <span style={{ fontSize: '0.65em', opacity: 0.7, fontWeight: 'normal', fontFamily: 'var(--font-code)' }}>(Model: BIL-01)</span>
              </h3>
              <p className="ai-chat-eyebrow">// ONLINE • AI POWERED</p>
            </div>
          </div>
          
          <div className="ai-chat-header-actions">
            <button 
              onClick={clearHistory}
              title="Reset Chat"
              className="ai-chat-btn-reset"
            >
              Reset
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="ai-chat-btn-close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={messagesContainerRef} className="ai-chat-messages custom-scrollbar" data-lenis-prevent>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`ai-chat-msg-row ${msg.role === "user" ? "user" : "ai"}`}
            >
              {/* Avatar / Eyebrow label */}
              <span className="ai-chat-msg-label">
                {msg.role === "user" ? "You" : "B.I.L.A.L."}
              </span>

              {/* Message Bubble */}
              <div className={`ai-chat-bubble ${msg.role === "user" ? "user" : "ai"}`}>
                {msg.role === "ai" && idx === messages.length - 1 ? (
                  <TypingBubble text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="ai-chat-msg-row ai">
              <span className="ai-chat-msg-label">B.I.L.A.L.</span>
              <div className="ai-chat-typing-bubble">
                <span className="ai-chat-typing-dot"></span>
                <span className="ai-chat-typing-dot"></span>
                <span className="ai-chat-typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Area */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === "ai" && messages[messages.length - 1].suggestions && messages[messages.length - 1].suggestions!.length > 0 && (
          <div className="ai-chat-suggestions">
            {messages[messages.length - 1].suggestions!.map((sug, i) => (
              <button
                key={i}
                onClick={async () => {
                  setInput("");
                  await sendMessage(sug);
                }}
                className="ai-chat-suggestion-pill"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="ai-chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me something about Bilal..."
            disabled={isLoading}
            className="ai-chat-input"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="ai-chat-btn-send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Toggle Button — Custom "AI" SVG Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
        className={`ai-chat-toggle-btn ${isOpen ? "active" : ""}`}
      >
        <span className="ai-chat-toggle-btn-glow"></span>
        <span className="ai-chat-toggle-btn-icon">
          {/* Neural chat icon — circuit-inspired chat bubble */}
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chat bubble outline */}
            <path d="M6 8C6 6.34315 7.34315 5 9 5H23C24.6569 5 26 6.34315 26 8V18C26 19.6569 24.6569 21 23 21H18L13 26V21H9C7.34315 21 6 19.6569 6 18V8Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
            {/* Neural circuit nodes inside bubble */}
            <circle cx="12" cy="13" r="1.5" fill="rgba(139, 92, 246, 1)"/>
            <circle cx="16" cy="10" r="1.5" fill="rgba(99, 102, 241, 1)"/>
            <circle cx="20" cy="13" r="1.5" fill="rgba(139, 92, 246, 1)"/>
            <circle cx="16" cy="16" r="1.5" fill="rgba(99, 102, 241, 1)"/>
            {/* Neural connections */}
            <line x1="12" y1="13" x2="16" y2="10" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1"/>
            <line x1="16" y1="10" x2="20" y2="13" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="1"/>
            <line x1="12" y1="13" x2="16" y2="16" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="1"/>
            <line x1="20" y1="13" x2="16" y2="16" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1"/>
            {/* Animated pulse ring */}
            <circle cx="16" cy="13" r="6" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="0.8" fill="none" className="ai-toggle-pulse-ring"/>
          </svg>
        </span>
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="ai-chat-backdrop" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Self-Contained Embedded Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══════════════════════════════════════
           SIDEBAR PANEL — Docked Vertical Layout
           ═══════════════════════════════════════ */
        .ai-chat-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 380px;
          height: 100vh;
          height: 100dvh;
          z-index: 9998;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          padding: 20px;
          display: flex;
          flex-direction: column;
          color: white;
          pointer-events: auto;
          overflow: hidden;
          font-family: 'Rajdhani', sans-serif;

          /* Slide animation — hardware accelerated */
          transform: translateX(100%);
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
        .ai-chat-sidebar.open {
          transform: translateX(0);
        }

        /* ── Creative Background Layers ── */
        .ai-chat-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          background-position: center;
          opacity: 0.25; /* Reduced from 0.5 to be extremely subtle */
          z-index: -2;
          pointer-events: none;
        }

        .ai-chat-bg-shapes {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
        }

        .ai-chat-bg-shapes svg {
          width: 100%;
          height: 100%;
          opacity: 0.35; /* Reduced from 1 to make it subtle and less distracting */
          /* Slowly drift the SVG to make it feel alive */
          animation: shape-drift 40s infinite alternate ease-in-out;
        }
        
        .ai-chat-svg-stroke {
          color: rgba(255, 255, 255, 0.3); /* dimmed */
        }
        .ai-chat-svg-fill {
          color: rgba(255, 255, 255, 0.2); /* dimmed */
        }

        /* ── Light Mode SVG Overrides ── */
        [data-theme="light"] .ai-chat-svg-stroke {
          color: rgba(0, 0, 0, 0.3);
        }
        [data-theme="light"] .ai-chat-svg-fill {
          color: rgba(0, 0, 0, 0.25);
        }

        @keyframes shape-drift {
          0% { transform: scale(1.05) translate(0, 0) rotate(0deg); }
          50% { transform: scale(1.1) translate(-2%, 2%) rotate(0.5deg); }
          100% { transform: scale(1.08) translate(2%, -1%) rotate(-0.5deg); }
        }

        /* ── Holographic glow accents ── */
        .ai-chat-glow-1 {
          position: absolute;
          top: -96px;
          left: -96px;
          width: 192px;
          height: 192px;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 50%;
          filter: blur(64px);
          pointer-events: none;
          z-index: 0;
        }
        .ai-chat-glow-2 {
          position: absolute;
          bottom: -96px;
          right: -96px;
          width: 192px;
          height: 192px;
          background: rgba(37, 99, 235, 0.15);
          border-radius: 50%;
          filter: blur(64px);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Header ── */
        .ai-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 14px;
          margin-bottom: 14px;
          z-index: 10;
          position: relative;
          flex-shrink: 0;
        }
        .ai-chat-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-chat-status-dot {
          position: relative;
          width: 10px;
          height: 10px;
          background-color: #10b981;
          border-radius: 50%;
        }
        .ai-chat-status-ping {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #34d399;
          border-radius: 50%;
          opacity: 0.75;
          animation: ai-chat-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ai-chat-ping {
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .ai-chat-title {
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.2;
          margin: 0;
        }
        .ai-chat-eyebrow {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'Roboto Mono', monospace;
          letter-spacing: 0.02em;
          margin: 2px 0 0 0;
        }
        .ai-chat-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-chat-btn-reset {
          color: rgba(255, 255, 255, 0.35);
          background: transparent;
          border: none;
          font-family: 'Roboto Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .ai-chat-btn-reset:hover {
          color: #f43f5e;
          background: rgba(255, 255, 255, 0.05);
        }
        .ai-chat-btn-close {
          color: rgba(255, 255, 255, 0.4);
          background: transparent;
          border: none;
          font-size: 22px;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 6px;
          line-height: 1;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-chat-btn-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        /* ── Messages ── */
        .ai-chat-messages {
          flex: 1;
          min-height: 0;
          flex-shrink: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 6px;
          z-index: 10;
          position: relative;
        }
        .ai-chat-msg-row {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }
        .ai-chat-msg-row.user {
          align-self: flex-end;
          align-items: flex-end;
        }
        .ai-chat-msg-row.ai {
          align-self: flex-start;
          align-items: flex-start;
        }
        .ai-chat-msg-label {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.3);
          font-family: 'Roboto Mono', monospace;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ai-chat-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          line-height: 1.5;
          font-size: 13px;
          white-space: pre-wrap;
        }
        .ai-chat-typing-cursor {
          display: inline-block;
          width: 6px;
          height: 13px;
          background-color: rgba(255,255,255,0.7);
          margin-left: 2px;
          vertical-align: middle;
          animation: ai-blink 1s step-end infinite;
        }
        @keyframes ai-blink {
          50% { opacity: 0; }
        }
        .ai-chat-bubble.user {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: white;
          border-top-right-radius: 0;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .ai-chat-bubble.ai {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
          border-top-left-radius: 0;
        }

        /* ── Typing indicator ── */
        .ai-chat-typing-bubble {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-radius: 16px;
          border-top-left-radius: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ai-chat-typing-dot {
          width: 6px;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: ai-chat-bounce 1.4s infinite ease-in-out both;
        }
        .ai-chat-typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .ai-chat-typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes ai-chat-bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }

        /* ── Input area ── */
        .ai-chat-input-area {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 10;
          position: relative;
          flex-shrink: 0;
        }
        .ai-chat-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 14px;
          outline: none;
          color: white;
          font-size: 13px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .ai-chat-input:focus {
          border-color: rgba(37, 99, 235, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }
        .ai-chat-input:disabled {
          opacity: 0.5;
        }
        .ai-chat-btn-send {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .ai-chat-btn-send:hover {
          filter: brightness(1.1);
        }
        .ai-chat-btn-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ═══════════════════════════════════
           TOGGLE BUTTON — Custom "AI" SVG
           ═══════════════════════════════════ */
        .ai-chat-toggle-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(13, 13, 23, 0.85), rgba(30, 27, 75, 0.95));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: fixed;
          overflow: hidden;
          padding: 0;
          margin: 0;
          pointer-events: auto;
        }
        .ai-chat-toggle-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
        }
        .ai-chat-toggle-btn:active {
          transform: scale(0.95);
        }
        .ai-chat-toggle-btn.active {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.6);
        }
        .ai-chat-toggle-btn-glow {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ai-chat-toggle-btn:hover .ai-chat-toggle-btn-glow {
          opacity: 1;
        }
        .ai-chat-toggle-btn-icon {
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          position: relative;
        }
        .ai-chat-toggle-btn:hover .ai-chat-toggle-btn-icon {
          transform: scale(1.05);
        }

        /* Pulse ring animation on toggle icon */
        .ai-toggle-pulse-ring {
          animation: ai-toggle-pulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes ai-toggle-pulse {
          0%, 100% { r: 6; opacity: 0.3; }
          50% { r: 8; opacity: 0.6; }
        }

        /* ── Mobile backdrop ── */
        .ai-chat-backdrop {
          display: none;
        }

        /* ── Scrollbar ── */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* ── AI Section highlight (navigation) ── */
        @keyframes ai-section-pulse {
          0% {
            box-shadow: 0 0 0 0px rgba(99, 102, 241, 0);
            outline: 2px dashed rgba(99, 102, 241, 0);
            outline-offset: 4px;
          }
          25% {
            box-shadow: 0 0 35px 12px rgba(99, 102, 241, 0.45);
            outline: 2px dashed rgba(99, 102, 241, 0.95);
            outline-offset: 4px;
          }
          75% {
            box-shadow: 0 0 35px 12px rgba(99, 102, 241, 0.45);
            outline: 2px dashed rgba(99, 102, 241, 0.95);
            outline-offset: 4px;
          }
          100% {
            box-shadow: 0 0 0 0px rgba(99, 102, 241, 0);
            outline: 2px dashed rgba(99, 102, 241, 0);
            outline-offset: 4px;
          }
        }
        .ai-highlight-active {
          animation: ai-section-pulse 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
          z-index: 50;
        }

        /* ═══════════════════════════════════
           LAYOUT SHIFTING — Desktop
           ═══════════════════════════════════ */
        #main-content-wrapper {
          transition: margin-right 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: margin-right;
          min-height: 100vh;
        }
        body.ai-chat-sidebar-open #main-content-wrapper {
          margin-right: 380px;
        }

        /* ═══════════════════════════════
           SUGGESTIONS SYSTEM
           ═══════════════════════════════ */
        .ai-chat-suggestions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          padding: 4px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: auto;
          pointer-events: auto;
          z-index: 10;
        }
        .ai-chat-suggestion-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 4px 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.72rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          line-height: 1.2;
          pointer-events: auto;
        }
        .ai-chat-suggestion-pill:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.35);
          color: white;
          transform: translateY(-1px);
        }

        /* ═════════════════════════════════════
           MOBILE FULL-SCREEN — ≤768px
           ═════════════════════════════════════ */
        @media (max-width: 768px) {
          .ai-chat-sidebar {
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            border-left: none;
            padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
          }

          /* No layout shifting on mobile — overlay covers all */
          body.ai-chat-sidebar-open #main-content-wrapper {
            margin-right: 0;
          }

          /* Backdrop for mobile */
          .ai-chat-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9997;
            animation: ai-backdrop-in 0.3s ease forwards;
          }
          @keyframes ai-backdrop-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .ai-chat-toggle-btn {
            bottom: 16px;
            right: 16px;
            width: 50px;
            height: 50px;
          }

          .ai-chat-bubble {
            font-size: 13px;
          }
        }

        /* ═══════════════════════════════════════
           LIGHT MODE OVERRIDES
           ═══════════════════════════════════════ */
        html[data-theme="light"] .ai-chat-sidebar {
          border-left: 1px solid rgba(0, 0, 0, 0.08) !important;
          background: rgba(255, 255, 255, 0.92) !important;
          color: #2c2c2c !important;
        }
        html[data-theme="light"] .ai-chat-title {
          color: #2c2c2c !important;
        }
        html[data-theme="light"] .ai-chat-eyebrow {
          color: rgba(0, 0, 0, 0.5) !important;
        }
        html[data-theme="light"] .ai-chat-btn-reset {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        html[data-theme="light"] .ai-chat-btn-reset:hover {
          background: rgba(0, 0, 0, 0.03) !important;
        }
        html[data-theme="light"] .ai-chat-btn-close {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        html[data-theme="light"] .ai-chat-btn-close:hover {
          color: #000 !important;
          background: rgba(0, 0, 0, 0.03) !important;
        }
        html[data-theme="light"] .ai-chat-msg-label {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        html[data-theme="light"] .ai-chat-bubble.ai {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
          color: #2c2c2c !important;
        }
        html[data-theme="light"] .ai-chat-typing-cursor {
          background-color: rgba(0, 0, 0, 0.5) !important;
        }
        html[data-theme="light"] .ai-chat-typing-bubble {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
        }
        html[data-theme="light"] .ai-chat-typing-dot {
          background-color: rgba(0, 0, 0, 0.4) !important;
        }
        html[data-theme="light"] .ai-chat-input-area {
          border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        html[data-theme="light"] .ai-chat-input {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          color: #2c2c2c !important;
        }
        html[data-theme="light"] .ai-chat-input:focus {
          border-color: rgba(138, 106, 176, 0.4) !important;
          background: rgba(0, 0, 0, 0.05) !important;
        }
        html[data-theme="light"] .ai-chat-toggle-btn {
          background: linear-gradient(135deg, #eaeae5, #eaeaea) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), inset 0 0 10px rgba(138, 106, 176, 0.1) !important;
        }
        html[data-theme="light"] .ai-chat-toggle-btn-icon {
          color: #4a3a4a !important;
        }
        html[data-theme="light"] .ai-chat-toggle-btn.active {
          background: linear-gradient(135deg, #e0dce8, #d5d0e3) !important;
        }
        html[data-theme="light"] .ai-chat-suggestions {
          border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        html[data-theme="light"] .ai-chat-suggestion-pill {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          color: #2c2c2c !important;
        }
        html[data-theme="light"] .ai-chat-suggestion-pill:hover {
          background: rgba(138, 106, 176, 0.1) !important;
          border-color: rgba(138, 106, 176, 0.3) !important;
          color: #8a6ab0 !important;
        }
        html[data-theme="light"] .ai-chat-backdrop {
          background: rgba(0, 0, 0, 0.25) !important;
        }
      ` }} />
    </>
  );
}
