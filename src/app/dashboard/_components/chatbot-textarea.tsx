import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrainIcon, SendIcon } from "lucide-react";
import { Dispatch, KeyboardEvent, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export default function ChatbotTextarea({
  sendMessage,
  isThinking,
  setIsThinking,
  mode,
  setMode,
}: {
  sendMessage: (message: string) => void;
  isThinking: boolean;
  setIsThinking: Dispatch<SetStateAction<boolean>>;
  mode: "general" | "personalized";
  setMode: Dispatch<SetStateAction<"general" | "personalized">>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage(data.message);
    form.reset();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(form.getValues());
    }
  }
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-secondary flex flex-col rounded-2xl p-2"
    >
      <Controller
        control={form.control}
        name="message"
        render={({ field }) => (
          <Field>
            <textarea
              {...field}
              id="form-message"
              placeholder="Ask AI Advisor here"
              autoComplete="off"
              className="h-16 resize-none rounded-md px-3 py-2 focus:outline-none"
              onKeyDown={handleKeyDown}
            />
          </Field>
        )}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Toggle
            size="sm"
            variant="outline"
            pressed={isThinking}
            onPressedChange={setIsThinking}
            className={cn("h-8 w-8 px-0 py-0 text-xs", {
              "bg-primary/10!": isThinking,
            })}
          >
            <BrainIcon className="size-4" />
          </Toggle>
          <Select
            value={mode}
            onValueChange={(value) =>
              setMode(value as "general" | "personalized")
            }
          >
            <SelectTrigger size="sm" className="capitalize">
              <SelectValue>{mode}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="personalized">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="text-primary hover:bg-primary/10 hover:text-primary cursor-pointer disabled:bg-transparent"
          >
            <SendIcon className="size-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
