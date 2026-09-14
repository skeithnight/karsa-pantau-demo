'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, User, ChevronDown, RotateCcw, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { getApiBase, getAuthToken } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatWidgetProps {
  projectId: string;
  projectName?: string;
}

export function AiChatWidget({ projectId, projectName = 'Proyek Ini' }: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Halo! Saya Asisten AI Karsa Pantau. Saya siap membantu Anda menganalisis anggaran, progres Kurva S, indeks EVM (CPI/SPI), dan deteksi anomali biaya untuk ${projectName}. Ada yang bisa saya bantu?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Bagaimana kesehatan biaya & jadwal (CPI/SPI) proyek ini?',
    'Apakah ada paket pekerjaan yang mengalami overbudget?',
    'Berapa estimasi biaya akhir (EAC) jika tren berlanjut?',
    'Berikan rekomendasi mitigasi deviasi anggaran',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || streaming) return;

    setInput('');
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const newHistory = [...messages, { id: userMsgId, role: 'user' as const, content: query }];
    setMessages([...newHistory, { id: assistantMsgId, role: 'assistant' as const, content: '' }]);
    setStreaming(true);

    try {
      const apiBase = getApiBase();
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId,
          message: query,
          history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        const lines = textChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                accumulated += parsed.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg,
                  ),
                );
              } else if (parsed.error) {
                accumulated += `\n\n⚠️ *Perhatian*: ${parsed.error}`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg,
                  ),
                );
              }
            } catch {
              // Ignore non-json chunks
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  'Maaf, terjadi gangguan saat menghubungi server AI. Mohon pastikan koneksi internet stabil atau coba beberapa saat lagi.',
              }
            : msg,
        ),
      );
    } finally {
      setStreaming(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'init-reset',
        role: 'assistant',
        content: `Sesi baru dimulai. Apa yang ingin Anda diskusikan mengenai ${projectName}?`,
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 text-white font-bold text-xs shadow-2xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </div>
          <span className="hidden sm:inline">AI Copilot Proyek</span>
        </button>
      </div>

      {/* Slide-in / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[80vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">AI Project Assistant</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{projectName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Mulai Sesi Baru"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                disabled={streaming}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[10px] text-slate-300 border border-slate-700/60 hover:border-sky-500/60 transition-all cursor-pointer disabled:opacity-50"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-800 flex-shrink-0 flex items-center justify-center text-sky-400 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-sky-600 text-white font-medium rounded-tr-sm'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm whitespace-pre-wrap'
                  }`}
                >
                  {m.content || (streaming && m.id === messages[messages.length - 1].id ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse delay-100"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse delay-200"></span>
                      <span className="text-[10px] font-mono ml-1">Menganalisis data proyek...</span>
                    </span>
                  ) : null)}
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 flex-shrink-0 flex items-center justify-center text-indigo-400 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Tanyakan status anggaran, CPI, atau mitigasi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={streaming}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 px-1">
              <span>Didukung Kecerdasan Buatan (AI)</span>
              <span>Kalkulasi finansial terverifikasi deterministik</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
