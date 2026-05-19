"use client";

import { useChatStore } from "@/stores";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export default function AiChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearHistory } = useChatStore();
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages list changes or when chat panel opens
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  // Entrance and exit animations using GSAP
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.8, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();
    setInput("");
    await sendMessage(currentInput);
  };

  return (
    <div className="ai-chat-container">
      {isOpen && (
        <div ref={containerRef} className="ai-chat-panel">
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
                <h3 className="ai-chat-title">Bilal's Assistant</h3>
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
                  {msg.role === "user" ? "You" : "Assistant"}
                </span>

                {/* Message Bubble */}
                <div className={`ai-chat-bubble ${msg.role === "user" ? "user" : "ai"}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="ai-chat-msg-row ai">
                <span className="ai-chat-msg-label">Assistant</span>
                <div className="ai-chat-typing-bubble">
                  <span className="ai-chat-typing-dot"></span>
                  <span className="ai-chat-typing-dot"></span>
                  <span className="ai-chat-typing-dot"></span>
                </div>
              </div>
            )}
          </div>

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
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
        className="ai-chat-toggle-btn"
        onMouseEnter={() => {
          gsap.to(toggleBtnRef.current, { boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)", duration: 0.3 });
        }}
        onMouseLeave={() => {
          gsap.to(toggleBtnRef.current, { boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)", duration: 0.3 });
        }}
      >
        <span className="ai-chat-toggle-btn-glow"></span>
        <span className="ai-chat-toggle-btn-icon">✨</span>
      </button>

      {/* Embedded CSS Self-Contained Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ai-chat-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          pointer-events: none;
          font-family: 'Rajdhani', 'sans-serif';
        }
        .ai-chat-panel {
          margin-bottom: 16px;
          width: 380px;
          height: 480px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 10, 10, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
          color: white;
          pointer-events: auto;
          overflow: hidden;
          position: relative;
        }
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
        .ai-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 12px;
          margin-bottom: 12px;
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
          padding: 10px 16px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-chat-btn-send:hover {
          filter: brightness(1.1);
        }
        .ai-chat-btn-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ai-chat-toggle-btn {
          pointer-events: auto;
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
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }
        .ai-chat-toggle-btn:hover {
          transform: scale(1.05);
        }
        .ai-chat-toggle-btn:active {
          transform: scale(0.95);
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
          font-size: 24px;
          transition: transform 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-chat-toggle-btn:hover .ai-chat-toggle-btn-icon {
          transform: rotate(12deg) scale(1.1);
        }
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
        
        /* Temporal section highlighting triggered by the AI navigation */
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

        /* Mobile Adjustments for Chat Overlay */
        @media (max-width: 480px) {
          .ai-chat-container {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }
          .ai-chat-panel {
            width: 100%;
            height: 65vh;
            max-height: 500px;
            margin-bottom: 12px;
          }
          .ai-chat-bubble {
            font-size: 12px;
            padding: 8px 12px;
          }
          .ai-chat-input {
            font-size: 12px;
            padding: 8px 12px;
          }
          .ai-chat-btn-send {
            font-size: 12px;
            padding: 8px 12px;
          }
        }
      ` }} />
    </div>
  );
}
