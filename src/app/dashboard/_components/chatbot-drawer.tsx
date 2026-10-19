"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { handleChat } from "@/features/ai/chat";
import { cn } from "@/lib/utils";
import { BotIcon, EllipsisIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatbotTextarea from "./chatbot-textarea";
import { useMutation } from "@tanstack/react-query";
import Markdown from "react-markdown";

export default function ChatbotDrawer() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<
    {
      role: string;
      parts: {
        text: string;
      }[];
    }[]
  >([]);

  const { mutate: handleChatMutation, isPending } = useMutation({
    mutationFn: handleChat,
    onSuccess: (response) => {
      const botMessage = {
        role: "model",
        parts: [{ text: response || "terjadi kesalahan" }],
      };
      setConversation((prev) => [...prev, botMessage]);
    },
    onError: (error) => {
      const botMessage = {
        role: "model",
        parts: [{ text: "terjadi kesalahan: " + error.message }],
      };

      setConversation((prev) => [...prev, botMessage]);
    },
  });

  function sendMessage(message: string) {
    const newMessage = {
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    };

    setConversation((prev) => [...prev, newMessage]);
    handleChatMutation(message);
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation]);

  return (
    <Drawer swipeDirection="right" modal={false}>
      <DrawerTrigger
        render={
          <Button
            className="fixed right-4 bottom-4 size-14 rounded-full"
            size="icon-lg"
            variant="outline"
          />
        }
      >
        <BotIcon className="size-6" />
      </DrawerTrigger>
      <DrawerContent className="w-[calc(100vw-2rem)]! rounded-xl! border shadow-lg [--drawer-inset:2rem] md:w-110!">
        <DrawerHeader className="flex flex-row justify-between">
          <div>
            <DrawerTitle className="text-primary font-bold">
              AI Financial Advisor
            </DrawerTitle>
            <DrawerDescription>
              Get personalized financial advice.
            </DrawerDescription>
          </div>
          <DrawerClose render={<Button variant="outline" size="icon" />}>
            <XIcon />
          </DrawerClose>
        </DrawerHeader>
        <div className="no-scrollbar mt-5 h-full overflow-y-auto px-4">
          {conversation.length > 0 ? (
            <div
              ref={chatRef}
              className="no-scrollbar flex h-full flex-col gap-8 overflow-x-hidden overflow-y-auto"
            >
              {conversation.map((message, index) => (
                <div
                  key={`conversation-${index}`}
                  className={cn(
                    "flex flex-col gap-2",
                    message.role === "model" ? "items-start" : "items-end",
                  )}
                >
                  <div
                    className={cn("flex w-full flex-col", {
                      "bg-primary/20 text-primary w-fit max-w-3/4 rounded-3xl rounded-br-md px-5 py-2":
                        message.role === "user",
                    })}
                  >
                    {message.role === "model" && (
                      <div className="text-primary flex items-center gap-1 text-xs font-semibold">
                        <BotIcon />
                        AI Advisor
                      </div>
                    )}
                    {message.role == "model" ? (
                      <div className="response-ai">
                        <Markdown>{message.parts[0].text}</Markdown>
                      </div>
                    ) : (
                      message.parts[0].text
                    )}
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex animate-pulse items-center">
                  <EllipsisIcon className="text-primary size-8 opacity-25" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <h2 className="text-primary text-3xl font-bold">Hello There</h2>
              <h4 className="text-xl">What can I help you?</h4>
            </div>
          )}
        </div>
        <DrawerFooter>
          <ChatbotTextarea sendMessage={sendMessage} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
