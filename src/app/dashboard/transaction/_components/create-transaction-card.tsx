import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["income", "expense"], {
    error: "Type is required",
  }),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

export default function CreateTransactionCard({
  refetch,
}: {
  refetch: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      type: "income",
      category: "",
      date: "",
      description: "",
    },
  });
}
