"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const SUGGESTED_QUESTIONS = [
  "What skills should I learn for web development?",
  "How do I negotiate a job offer?",
  "What career path fits my profile?",
  "How do I prepare for a technical interview?",
];

export default function CareerGuidancePage() {
  const chatHistory = useQuery(api.career_chat.getChatHistory);
  const clearChat = useMutation(api.career_chat.clearChat);
  const sendMessage = useAction(api.career_chat_send.sendMessage);

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory) setMessages(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");

    try {
      const response = await sendMessage({ content });
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    }
    setSending(false);
  };

  const handleClear = async () => {
    await clearChat({});
    setMessages([]);
  };

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Career Guidance</h1>
        <button
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-red-600"
        >
          Clear chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white border border-gray-200 rounded-xl p-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Ask me anything about your career!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-500">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask a career question..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={sending || !input.trim()}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
