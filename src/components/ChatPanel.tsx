import { useState, useRef, useEffect } from "react";
import type { Article, ChatMessage } from "../types";
import { sendChatMessage } from "../lib/gemini";

interface ChatPanelProps {
  article: Article | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ChatPanel({ article, collapsed, onToggleCollapse }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Seed a greeting whenever a new article is selected.
  useEffect(() => {
    if (article) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I've got "${article.headline}" open. Ask me anything about it — key risks, background, or what it might mean for markets.`,
        },
      ]);
    }
  }, [article?.id]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const pendingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Thinking...",
      pending: true,
    };
    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput("");

    const reply = await sendChatMessage(article, messages, text);

    setMessages((prev) =>
      prev.map((m) => (m.id === pendingMsg.id ? { ...m, content: reply, pending: false } : m))
    );
  }

  return (
    <div className="bg-surface-container-high border-t border-outline-variant w-full h-full flex flex-col overflow-hidden">
      <header className="bg-surface-container-highest px-container-margin py-3 border-b border-outline-variant flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indicator-positive animate-pulse"></div>
          <h4 className="font-label-caps text-[14px] text-primary leading-none uppercase tracking-widest">
            Intelligence Assistant
          </h4>
        </div>
        <button
          onClick={onToggleCollapse}
          className="material-symbols-outlined text-on-surface-variant hover:text-on-surface text-[20px]"
        >
          {collapsed ? "keyboard_double_arrow_up" : "keyboard_double_arrow_down"}
        </button>
      </header>

      {!collapsed && (
        <>
          <div className="flex-1 flex overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {messages.length === 0 && (
                <div className="text-on-surface-variant font-body-md">
                  Select an article to start a conversation with the analyst assistant.
                </div>
              )}
              {messages.map((m) =>
                m.role === "assistant" ? (
                  <div key={m.id} className="flex justify-start">
                    <div
                      className={`max-w-[800px] bg-surface-container-low border-l-4 border-secondary text-on-surface p-4 rounded-lg text-body-md shadow-sm ${
                        m.pending ? "italic opacity-80 flex items-center gap-3" : ""
                      }`}
                    >
                      {m.pending && (
                        <span className="material-symbols-outlined animate-spin text-secondary">
                          sync
                        </span>
                      )}
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[600px] bg-primary/10 text-primary p-3 rounded-lg text-body-md border border-primary/20 shadow-sm">
                      {m.content}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="hidden lg:flex w-64 border-l border-outline-variant/30 p-5 flex-col gap-3">
              <h5 className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Contextual Tags
              </h5>
              <div className="flex flex-wrap gap-2">
                {(article?.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-surface-container text-[10px] text-primary border border-primary/20 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {!article && (
                  <span className="text-on-surface-variant text-[10px]">No article selected</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-outline-variant bg-surface-container-low flex-shrink-0">
            <div className="max-w-4xl mx-auto relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="w-full bg-surface-container text-body-md text-on-surface px-5 py-3 rounded border border-outline-variant focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40 pr-12 font-ticker-data"
                placeholder="Command Intelligence Assistant..."
                type="text"
              />
              <button
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-[24px] hover:scale-110 transition-transform"
              >
                send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
