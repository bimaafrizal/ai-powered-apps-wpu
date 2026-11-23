import { cn } from "@/lib/utils";
import { UploadCloudIcon } from "lucide-react";
import { DragEvent, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

export default function FileDropzoneInput({
  refetch,
  setValues,
}: {
  refetch: () => void;
  setValues: UseFormSetValue<{
    amount: string;
    type: "income" | "expense";
    category: string;
    date: string;
    description: string;
  }>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer?.files.length > 0) {
      console.log(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}

      onDragLeave={() => setIsDragging(false)}

      onClick={() => fileInputRef.current?.click()}

      onDrop={handleDrop}

      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-muted hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <input type="file" ref={fileInputRef} className="hidden" />
      <div className="flex flex-col items-center">
        <UploadCloudIcon
          className={cn(
            "size-8",
            isDragging ? "text-primary" : "text-muted-foreground",
          )}
        />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium">Drag & Drag Receipt Here</p>
        <p className="text-muted-foreground text-xs">or click to browse</p>
      </div>
    </div>
  );
}
