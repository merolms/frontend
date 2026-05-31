import { ChevronDown, Hash, Paperclip, Send, Smile, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { chatStore, getUserById, getUsers } from "@/app/store/chatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";

const EMOJI_LIST = ["👍", "❤️", "🔥", "🎉", "😂", "🚀", "👀", "💯", "✅", "🙌"];

const SlackChat = () => {
  const user = useSelector((s) => s.auth.user);
  const [storeState, setStoreState] = useState(chatStore.getState());
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatStore.init(user);
    const unsub = chatStore.subscribe(setStoreState);
    return unsub;
  }, [user]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storeState.messages, storeState.activeChannel, storeState.activeDM]);

  const { channels, messages, activeChannel, activeDM, currentUser } = storeState;
  const activeChatId = activeDM ? `dm_${activeDM}` : activeChannel;
  const activeMessages = messages[activeChatId] || [];
  const activeChannelData = channels.find((c) => c.id === activeChannel);
  const activeDMUser = activeDM ? getUserById(activeDM) : null;
  const typingUsers = chatStore.getTypingUsers(activeDM || activeChannel, !!activeDM);

  const handleSend = () => {
    if (!input.trim()) return;
    chatStore.sendMessage(input, activeDM || activeChannel, !!activeDM);
    setInput("");
    inputRef.current?.focus();
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleReaction = (messageId, emoji) => {
    chatStore.toggleReaction(messageId, emoji, activeDM || activeChannel, !!activeDM);
    setShowEmojiPicker(null);
  };
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const groupedMessages = [];
  let lastDate = "";
  activeMessages.forEach((msg) => {
    const dateStr = new Date(msg.timestamp).toDateString();
    if (dateStr !== lastDate) {
      lastDate = dateStr;
      groupedMessages.push({
        type: "header",
        text: new Date(msg.timestamp).toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        id: `date_${dateStr}`,
      });
    }
    groupedMessages.push({ type: "message", ...msg });
  });

  const users = getUsers();

  return (
    <DashboardLayout title="Slack Chat" subtitle="Team communication">
      <div className="flex flex-1 overflow-hidden">
        {/* Channels sidebar */}
        <aside
          className="border-border flex w-56 shrink-0 flex-col overflow-hidden border-r"
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="border-border flex items-center gap-1 border-b px-4 py-3">
            <h3 className="text-text-primary text-sm font-semibold">MeroEdu</h3>
            <ChevronDown size={12} className="text-text-muted" />
          </div>
          <div className="px-3 py-2">
            <p className="text-text-muted mb-1 text-[10px] font-bold tracking-wider uppercase">
              Channels
            </p>
            {channels.map((ch) => (
              <div
                key={ch.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs ${activeChannel === ch.id ? "bg-bg-surface-active text-text-primary font-medium" : "text-text-secondary hover:bg-bg-surface-hover"}`}
                onClick={() => chatStore.setActiveChannel(ch.id)}
              >
                <Hash size={12} />
                <span>{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="bg-error ml-auto rounded-full px-1.5 py-0.5 text-[10px] text-white">
                    {ch.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="px-3 py-2">
            <p className="text-text-muted mb-1 text-[10px] font-bold tracking-wider uppercase">
              Direct Messages
            </p>
            {users
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <div
                  key={u.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs ${activeDM === u.id ? "bg-bg-surface-active text-text-primary font-medium" : "text-text-secondary hover:bg-bg-surface-hover"}`}
                  onClick={() => chatStore.setActiveDM(u.id)}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${u.status === "online" ? "bg-success" : "bg-text-muted"}`}
                  />
                  <span>{u.name}</span>
                </div>
              ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Chat header */}
          <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-2.5">
            <div className="flex items-center gap-2">
              {activeDMUser ? (
                <>
                  <span
                    className={`h-2 w-2 rounded-full ${activeDMUser.status === "online" ? "bg-success" : "bg-text-muted"}`}
                  />
                  <h3 className="text-text-primary text-sm font-semibold">{activeDMUser.name}</h3>
                  <span className="text-text-muted text-xs">{activeDMUser.role}</span>
                </>
              ) : (
                <>
                  <Hash size={14} className="text-text-muted" />
                  <h3 className="text-text-primary text-sm font-semibold">
                    {activeChannelData?.name}
                  </h3>
                  <span className="text-text-muted text-xs">{activeChannelData?.description}</span>
                </>
              )}
            </div>
            <Button variant="default" size="icon" onClick={() => setShowUserPanel(!showUserPanel)}>
              <Users size={14} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {groupedMessages.map((item) => {
              if (item.type === "header")
                return (
                  <div key={item.id} className="text-text-muted my-4 text-center text-xs">
                    {item.text}
                  </div>
                );
              const msgUser = getUserById(item.userId);
              const isOwn = item.userId === user?.id;
              return (
                <div key={item.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={msgUser?.avatar || "https://i.pravatar.cc/150?img=3"} />
                    <AvatarFallback>{(msgUser?.name || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%]">
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span className="text-text-primary text-xs font-semibold">
                        {msgUser?.name || "Unknown"}
                      </span>
                      <span className="text-text-muted text-[10px]">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <div
                      className="bg-bg-surface border-border rounded-lg border px-3 py-2 text-sm"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {item.text}
                    </div>
                    {Object.keys(item.reactions || {}).length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {Object.entries(item.reactions).map(([emoji, userIds]) => (
                          <button
                            key={emoji}
                            className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] ${userIds.includes(user?.id) ? "border-primary bg-primary-light" : "border-border bg-bg-surface"}`}
                            onClick={() => handleReaction(item.id, emoji)}
                          >
                            <span>{emoji}</span>
                            <span>{userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {typingUsers.length > 0 && (
              <div className="text-text-muted flex items-center gap-2 text-xs">
                <div className="flex gap-0.5">
                  <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full" />
                  <span
                    className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span>{typingUsers.map((id) => getUserById(id)?.name).join(", ")} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-border shrink-0 border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeDMUser ? activeDMUser.name : `#${activeChannelData?.name || ""}`}`}
              />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Smile size={14} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip size={14} />
                </Button>
                <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Users panel */}
        {showUserPanel && (
          <aside
            className="border-border flex w-56 shrink-0 flex-col overflow-hidden border-l"
            style={{ background: "var(--bg-surface)" }}
          >
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <h4 className="text-text-primary text-sm font-semibold">Members</h4>
              <Button variant="ghost" size="icon" onClick={() => setShowUserPanel(false)}>
                <X size={14} />
              </Button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="hover:bg-bg-surface-hover flex cursor-pointer items-center gap-2 rounded px-2 py-1.5"
                  onClick={() => {
                    chatStore.setActiveDM(u.id);
                    setShowUserPanel(false);
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <span
                      className={`border-bg-surface absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 ${u.status === "online" ? "bg-success" : "bg-text-muted"}`}
                    />
                  </div>
                  <div>
                    <p className="text-text-primary text-xs font-medium">{u.name}</p>
                    <p className="text-text-muted text-[11px]">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SlackChat;
