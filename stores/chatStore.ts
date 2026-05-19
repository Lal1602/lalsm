import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  role: 'ai',
  text: 'Halo! Saya asisten virtual Bilal. Ada yang bisa saya bantu untuk menjelaskan proyek, keahlian, atau pengalaman kerja Bilal?',
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [DEFAULT_WELCOME_MESSAGE],
      isLoading: false,

      sendMessage: async (text: string) => {
        if (!text.trim() || get().isLoading) return;

        const userMessage: Message = { role: 'user', text: text.trim() };
        const currentMessages = get().messages;
        
        // Optimistically update messages with user's input
        set({
          messages: [...currentMessages, userMessage],
          isLoading: true,
        });

        try {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userMessage.text,
              history: currentMessages,
            }),
          });

          if (!response.ok) {
            throw new Error('API request failed');
          }

          const data = await response.json();
          let rawReply = data.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.';
          
          // Parse action command tags from the AI response
          
          // 1. SCROLL_AND_HIGHLIGHT Action
          const scrollRegex = /\[ACTION:SCROLL_AND_HIGHLIGHT:([a-zA-Z0-9_-]+)\]/i;
          const scrollMatch = rawReply.match(scrollRegex);
          if (scrollMatch) {
            const sectionId = scrollMatch[1].toLowerCase();
            rawReply = rawReply.replace(scrollRegex, '').trim();
            
            setTimeout(() => {
              const element = document.getElementById(sectionId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ai-highlight-active');
                setTimeout(() => {
                  element.classList.remove('ai-highlight-active');
                }, 3000);
              }
            }, 300);
          }

          // 2. OPEN_PROJECT Action (Scrolls, slides Swiper, and clicks detail button)
          const projectRegex = /\[ACTION:OPEN_PROJECT:([^\]]+)\]/i;
          const projectMatch = rawReply.match(projectRegex);
          if (projectMatch) {
            const projectTitle = projectMatch[1].trim();
            rawReply = rawReply.replace(projectRegex, '').trim();
            
            setTimeout(() => {
              const section = document.getElementById('projects');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                section.classList.add('ai-highlight-active');
                setTimeout(() => {
                  section.classList.remove('ai-highlight-active');
                }, 3000);
              }

              const cards = Array.from(document.querySelectorAll('.project-card'));
              const targetIndex = cards.findIndex(card => {
                const title = card.getAttribute('data-title') || '';
                return title.toLowerCase().includes(projectTitle.toLowerCase());
              });

              if (targetIndex !== -1) {
                const swiperEl = document.getElementById('project-swiper') as any;
                if (swiperEl && swiperEl.swiper) {
                  swiperEl.swiper.slideTo(targetIndex);
                }
                
                setTimeout(() => {
                  const targetCard = cards[targetIndex];
                  const viewBtn = targetCard.querySelector('.btn-quick-view') || targetCard.querySelector('.btn');
                  if (viewBtn) {
                    (viewBtn as HTMLElement).click();
                  }
                }, 600);
              }
            }, 300);
          }

          // 3. OPEN_ACHIEVEMENT Action (Scrolls and opens achievement cert modal)
          const achRegex = /\[ACTION:OPEN_ACHIEVEMENT:([^\]]+)\]/i;
          const achMatch = rawReply.match(achRegex);
          if (achMatch) {
            const achTitle = achMatch[1].trim();
            rawReply = rawReply.replace(achRegex, '').trim();
            
            setTimeout(() => {
              const section = document.getElementById('achievements');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                section.classList.add('ai-highlight-active');
                setTimeout(() => {
                  section.classList.remove('ai-highlight-active');
                }, 3000);
              }

              const cards = Array.from(document.querySelectorAll('.marquee-card'));
              const targetCard = cards.find(card => {
                const title = card.getAttribute('data-title') || '';
                return title.toLowerCase().includes(achTitle.toLowerCase());
              });

              if (targetCard) {
                targetCard.classList.add('ai-highlight-active');
                setTimeout(() => {
                  targetCard.classList.remove('ai-highlight-active');
                }, 3000);
                
                const viewBtn = targetCard.querySelector('.btn-quick-view') || targetCard;
                if (viewBtn) {
                  (viewBtn as HTMLElement).click();
                }
              }
            }, 300);
          }

          const aiMessage: Message = {
            role: 'ai',
            text: rawReply,
          };

          set((state) => ({
            messages: [...state.messages, aiMessage],
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error sending chat message:', error);
          
          // Polite fallback response when API fails
          const fallbackMessage: Message = {
            role: 'ai',
            text: 'Maaf, saya sedang kesulitan menghubungi server otak utama saya. Tapi jangan ragu untuk menanyakan hal seputar portofolio Bilal, keahliannya di bidang React/Three.js/GSAP, atau menjelajahi kartu-kartu proyek interaktif di halaman ini!',
          };

          set((state) => ({
            messages: [...state.messages, fallbackMessage],
            isLoading: false,
          }));
        }
      },

      clearHistory: () => {
        set({ messages: [DEFAULT_WELCOME_MESSAGE] });
      },
    }),
    {
      name: 'bilal-chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
