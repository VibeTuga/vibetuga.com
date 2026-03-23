"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Send, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

interface Conversation {
  partnerId: string;
  partnerDisplayName: string | null;
  partnerDiscordUsername: string;
  partnerImage: string | null;
  partnerIsVerified: boolean;
  content: string;
  senderId: string;
  createdAt: string;
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: string | null;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderDisplayName: string | null;
  senderImage: string | null;
  senderDiscordUsername: string;
}

// ─── Helpers ────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
  });
}

function shouldShowTimestamp(current: string, previous: string | null): boolean {
  if (!previous) return true;
  const diff = Math.abs(new Date(current).getTime() - new Date(previous).getTime());
  return diff > 5 * 60_000; // 5 minutes
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-PT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Page Component ─────────────────────────────────────────

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const toUserId = searchParams.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(toUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(!!toUserId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // silent
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (partnerId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${partnerId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Determine current user ID from session
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) currentUserIdRef.current = data.id;
      })
      .catch(() => {});
  }, []);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when active partner changes
  useEffect(() => {
    if (activePartnerId) {
      fetchMessages(activePartnerId);
    }
  }, [activePartnerId, fetchMessages]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchConversations();
      if (activePartnerId) {
        fetchMessages(activePartnerId);
      }
    }, 10_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activePartnerId, fetchConversations, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Send message
  const handleSend = async () => {
    if (!activePartnerId || !newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Optimistic update
    const optimisticMsg: Message = {
      id: Date.now(),
      senderId: currentUserIdRef.current,
      recipientId: activePartnerId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      senderDisplayName: null,
      senderImage: null,
      senderDiscordUsername: "",
    };
    setMessages((prev) => [optimisticMsg, ...prev]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: activePartnerId, content }),
      });

      if (res.ok) {
        // Refresh conversations to update last message
        fetchConversations();
        // Also refresh messages to get the real server message
        fetchMessages(activePartnerId);
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectConversation = (partnerId: string) => {
    setActivePartnerId(partnerId);
    setShowMobileChat(true);
  };

  const activePartner = conversations.find((c) => c.partnerId === activePartnerId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <h1 className="font-headline text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
        <MessageCircle size={24} className="text-primary" />
        Mensagens
      </h1>

      <div className="flex-1 flex border border-white/5 bg-surface-container-low overflow-hidden rounded-lg min-h-0">
        {/* ── Conversation List (left panel) ── */}
        <div
          className={`w-full md:w-[340px] md:border-r border-white/5 flex flex-col ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {loadingConvos ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-white/30" size={24} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <MessageCircle size={40} className="text-white/10" />
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                Sem conversas
              </p>
              <p className="text-sm text-white/30">
                Visita o perfil de um utilizador para enviar uma mensagem.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((convo) => (
                <button
                  key={convo.partnerId}
                  onClick={() => selectConversation(convo.partnerId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    activePartnerId === convo.partnerId
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {convo.partnerImage ? (
                      <Image
                        src={convo.partnerImage}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">
                          {(convo.partnerDisplayName ??
                            convo.partnerDiscordUsername)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {convo.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-on-primary">
                        {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline text-sm font-bold truncate">
                        {convo.partnerDisplayName ?? convo.partnerDiscordUsername}
                      </span>
                      {convo.partnerIsVerified && (
                        <CheckCircle2 size={12} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">
                      {convo.content?.slice(0, 50)}
                      {(convo.content?.length ?? 0) > 50 ? "..." : ""}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="font-mono text-[10px] text-white/30 flex-shrink-0">
                    {relativeTime(convo.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Chat View (right panel) ── */}
        <div className={`flex-1 flex flex-col ${!showMobileChat ? "hidden md:flex" : "flex"}`}>
          {activePartnerId ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-surface-container">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden text-white/50 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                {activePartner && (
                  <Link
                    href={`/profile/${activePartnerId}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {activePartner.partnerImage ? (
                      <Image
                        src={activePartner.partnerImage}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-xs">
                          {(activePartner.partnerDisplayName ??
                            activePartner.partnerDiscordUsername)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-headline text-sm font-bold flex items-center gap-1.5">
                        {activePartner.partnerDisplayName ?? activePartner.partnerDiscordUsername}
                        {activePartner.partnerIsVerified && (
                          <CheckCircle2 size={12} className="text-primary" />
                        )}
                      </span>
                    </div>
                  </Link>
                )}
                {!activePartner && (
                  <span className="font-headline text-sm font-bold text-white/60">Conversa</span>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse gap-1">
                <div ref={messagesEndRef} />
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-white/30" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <MessageCircle size={32} className="text-white/10" />
                    <p className="text-sm text-white/30">Envia a primeira mensagem!</p>
                  </div>
                ) : (
                  // Messages are in DESC order (newest first) but we display with flex-col-reverse
                  messages.map((msg, i) => {
                    const isOwn = msg.senderId === currentUserIdRef.current;
                    const prevMsg = i < messages.length - 1 ? messages[i + 1] : null;
                    const showTime = shouldShowTimestamp(msg.createdAt, prevMsg?.createdAt ?? null);

                    return (
                      <div key={msg.id}>
                        {showTime && (
                          <div className="text-center py-2">
                            <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                              isOwn
                                ? "bg-primary/20 text-white rounded-br-md"
                                : "bg-white/5 text-white/80 rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input bar */}
              <div className="border-t border-white/5 p-3 bg-surface-container">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onInput={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreve uma mensagem..."
                    maxLength={2000}
                    rows={1}
                    className="flex-1 bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-primary text-on-primary rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="font-mono text-[10px] text-white/20">
                    {newMessage.length}/2000
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <MessageCircle size={48} className="text-white/10" />
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                Seleciona uma conversa
              </p>
              <p className="text-sm text-white/30 max-w-xs">
                Escolhe uma conversa à esquerda ou visita o perfil de um utilizador para começar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
