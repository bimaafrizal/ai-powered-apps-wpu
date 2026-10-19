import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export default function ChatbotTextarea({
  sendMessage,
}: {
  sendMessage: (message: string) => void;
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
    if (e.key == "Enter" && !e.shiftKey) {
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
        render={({ field, fieldState }) => (
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
      <div className="flex justify-between">
        <div></div>
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
