import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

export default function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-36",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={onClose} className="mb-1 ms-auto block">
        <XCircle size={30} />
      </button>
      <div className="flex h-[600px] flex-col rounded border bg-background shadow-xl">
        <div className="mt-3 h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))}
          {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Thinking for the correct answer...",
              }}
            />
          )}
          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something went wrong. Please try again...",
              }}
            />
          )}
          {!error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              <Bot />
              Ask Smarty anything about your questions...
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-1">
          <Button
            title="Clear Chat"
            variant="outline"
            size="icon"
            className="shrink-0"
            type="button"
            onClick={() => setMessages([])}
          >
            <Trash />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            ref={inputRef}
          />
          <Button className="ml-1" type="submit">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const { user } = useUser();

  const isAIMessage = role === "assistant";

  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAIMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    >
      {isAIMessage && <Bot className="m3-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border px-3 py-2",
          isAIMessage ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
      {!isAIMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="User Image"
          height={100}
          width={100}
          className="object-cpver ml-2 h-10 w-10 rounded-full"
        />
      )}
    </div>
  );
}
