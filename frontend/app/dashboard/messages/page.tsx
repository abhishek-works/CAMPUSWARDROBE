"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { messageApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Send,
  Building2,
  ShieldCheck,
  Search,
} from "lucide-react";

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser?.id) {
      fetchThread(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const res = await messageApi.getConversations();
      const list = res.data.conversations || [];
      setConversations(list);

      if (targetUserId) {
        const found = list.find((c: any) => c.user.id === targetUserId);
        if (found) {
          setSelectedUser(found.user);
        } else {
          // New conversation placeholder
          setSelectedUser({ id: targetUserId, name: "Campus Peer", college: user?.college || "KIET" });
        }
      } else if (list.length > 0 && !selectedUser) {
        setSelectedUser(list[0].user);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (otherId: string) => {
    try {
      const res = await messageApi.getWithUser(otherId);
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch {
      // ignore
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser?.id || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await messageApi.send({
        receiverId: selectedUser.id,
        content: text,
      });
      setMessages((prev) => [...prev, res.data.message]);
      scrollToBottom();
      fetchConversations();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Campus Messages
            </h1>
            <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Chat directly with student lenders &amp; borrowers in <strong>{user?.college || "KIET"}</strong></span>
          </p>
        </div>

        {/* Chat Layout Container */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
          {/* Left Column: Conversations List (4 Cols) */}
          <div className="md:col-span-4 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No chat conversations yet. You can message owners directly from any outfit page!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = selectedUser?.id === conv.user?.id;
                  return (
                    <button
                      key={conv.user?.id}
                      onClick={() => setSelectedUser(conv.user)}
                      className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <Avatar className="w-10 h-10 rounded-xl shrink-0">
                        <AvatarImage src={conv.user?.avatarUrl} />
                        <AvatarFallback className="text-xs font-bold bg-indigo-600 text-white">
                          {conv.user?.name?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                            {conv.user?.name}
                          </p>
                          <span className="text-[10px] text-zinc-400">
                            {formatDate(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {conv.lastMessage?.content || "Tap to chat"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window (8 Cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-zinc-900">
            {selectedUser ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-3.5 px-6 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 rounded-xl">
                      <AvatarImage src={selectedUser.avatarUrl} />
                      <AvatarFallback className="text-xs font-bold bg-indigo-600 text-white">
                        {selectedUser.name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-zinc-900 dark:text-white">
                          {selectedUser.name}
                        </p>
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {selectedUser.collegeId ? `ID: ${selectedUser.collegeId}` : selectedUser.college || "KIET"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none"
                          }`}
                        >
                          <p>{m.content}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isMe ? "text-indigo-200" : "text-zinc-400"
                            }`}
                          >
                            {formatDate(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-zinc-200/80 dark:border-zinc-800 flex gap-2"
                >
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${selectedUser.name}...`}
                    className="text-xs h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 text-xs">
                <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-indigo-500" />
                <p>Select a student conversation to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
