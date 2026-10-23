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
import { handleChat, handleChatWithStream } from "@/features/ai/chat";
import { cn } from "@/lib/utils";
import { BotIcon, ChevronDownIcon, EllipsisIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatbotTextarea from "./chatbot-textarea";
import { useMutation } from "@tanstack/react-query";
import Markdown from "react-markdown";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Conversation } from "@/app/types/ai";

export default function ChatbotDrawer() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [isThinking, setIsthinking] = useState<boolean>(false);

  // const { mutate: handleChatMutation, isPending } = useMutation({
  //   mutationFn: ({
  //     message,
  //     isThinking,
  //   }: {
  //     message: string;
  //     isThinking: boolean;
  //   }) => handleChat(message, isThinking),
  //   onSuccess: (response) => {
  //     let parts: {
  //       text: string;
  //       thought?: boolean;
  //     }[] = [];

  //     if (response?.thought !== "") {
  //       parts = [
  //         ...parts,
  //         { thought: true, text: response?.thought || "Terjadi kesalahan" },
  //       ];
  //     }

  //     const botMessage = {
  //       role: "model",
  //       parts: [...parts, { text: response?.answer || "Terjadi kesalahan" }],
  //     };

  //     setConversation((prev) => [...prev, botMessage]);
  //   },
  //   onError: (error) => {
  //     const botMessage = {
  //       role: "model",
  //       parts: [{ text: "terjadi kesalahan: " + error.message }],
  //     };

  //     setConversation((prev) => [...prev, botMessage]);
  //   },
  // });

  const { mutate: handleChatMutation, isPending } = useMutation({
    mutationFn: async ({ isThinking }: { isThinking: boolean }) => {
      if (isThinking) {
        setConversation((prev) => [
          ...prev,
          { role: "model", parts: [{ thought: true, text: "" }, { text: "" }] },
        ]);

        const response = await handleChatWithStream(conversation, isThinking);
        for await (const chunk of response) {
          setConversation((prev) => {
            const newConversation = [...prev];
            const lastIndex = newConversation.length - 1;

            const parts = newConversation[lastIndex].parts;
            const isThought = chunk.startsWith("[thought]");
            const text = isThought ? chunk.slice("[thought]".length) : chunk;

            newConversation[lastIndex] = {
              ...newConversation[lastIndex],
              parts: [
                {
                  ...parts[0],
                  text: isThought ? parts[0].text + text : parts[0].text,
                },
                {
                  text: !isThought ? parts[1].text + text : parts[1].text,
                },
              ],
            };

            return newConversation;
          });
        }
        return response;
      } else {
        setConversation((prev) => [
          ...prev,
          { role: "model", parts: [{ text: "" }] },
        ]);

        const response = await handleChatWithStream(conversation, isThinking);
        for await (const chunk of response) {
          setConversation((prev) => {
            const newConversation = [...prev];
            const lastIndex = newConversation.length - 1;

            newConversation[lastIndex] = {
              ...newConversation[lastIndex],
              parts: [
                { text: newConversation[lastIndex].parts[0].text + chunk },
              ],
            };

            return newConversation;
          });
        }
        return response;
      }
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
    handleChatMutation({ isThinking: isThinking });
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
                    {message.role === "model" ? (
                      <div className="response-ai">
                        {message.parts.map((part, indexPart) => (
                          <div key={`response-ai-${index}-${indexPart}`}>
                            {part.thought ? (
                              <Collapsible>
                                <CollapsibleTrigger
                                  render={<Button variant="ghost" />}
                                >
                                  Tampilkan alur berpikir
                                  <ChevronDownIcon />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="ml-4 border-l pl-2">
                                    <Markdown>{part.text}</Markdown>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : (
                              <Markdown>{part.text}</Markdown>
                            )}
                          </div>
                        ))}
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
          <ChatbotTextarea
            isThinking={isThinking}
            setIsThinking={setIsthinking}
            sendMessage={sendMessage}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
