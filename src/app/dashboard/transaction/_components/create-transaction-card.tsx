import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { createTransaction } from "@/features/transaction/action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { convertToIDR } from "@/lib/utils";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["income", "expense"], {
    error: "Type is required",
  }),
  category: z.string().min(1, "Category is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((date) => date <= format(new Date(), "yyyy-MM-dd"), {
      message: "Date cannot be in the future",
    }),
  description: z.string().min(1, "Description is required"),
});

const typeOptions = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

const categoryOptions = [
  { label: "Food & Drink", value: "Food & Drink" },
  { label: "Transportation", value: "Transportation" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Shopping", value: "Shopping" },
  { label: "Housing", value: "Housing" },
  { label: "Salary", value: "Salary" },
  { label: "Other", value: "Other" },
];

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

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      const formatedData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      return createTransaction(formatedData);
    },
    onSuccess: () => {
      form.reset();
      refetch();
      toast.success("Transaction created successfully!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction",
      );
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <Card className="w-full gap-2">
      <CardHeader className="gap-0">
        <CardTitle>Create Transaction</CardTitle>
        <CardDescription>Add a new financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-3">
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="form-amount">Amount</FieldLabel>
                  <Input
                    {...field}
                    id="form-amount"
                    placeholder={convertToIDR(0)}
                    autoComplete="off"
                    type="text"
                    inputMode="numeric"
                    value={field.value ? convertToIDR(Number(field.value)) : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/\D/g, "").replace(/^0+/, ""),
                      )
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="form-type">Type</FieldLabel>
                  <Select
                    items={typeOptions}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger id="form-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="form-category">Category</FieldLabel>
                  <Select
                    items={categoryOptions}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger id="form-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="form-date">Date</FieldLabel>
                  <DatePicker
                    id="form-date"
                    disableFuture
                    value={field.value ? parseISO(field.value) : undefined}
                    onChange={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="form-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="form-description"
                    placeholder="Enter description"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              size="lg"
              type="submit"
              disabled={!form.formState.isValid || isPending}
            >
              {isPending ? "Creating..." : "Create Transaction"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
