import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { imageSrc, uploadImages } from "@/lib/upload";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: "products" | "categories" | "banners";
  multiple?: boolean;
  label?: string;
  hint?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder,
  multiple = false,
  label = "Image",
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded = await uploadImages(Array.from(files), folder);
      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(-1));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeMain(index: number) {
    const next = [...value];
    const [picked] = next.splice(index, 1);
    if (picked) next.unshift(picked);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div
              key={url + index}
              className="relative size-24 overflow-hidden rounded-md border border-border bg-secondary"
            >
              <img src={imageSrc(url) ?? ""} alt="" className="size-full object-cover" />
              {multiple && index === 0 ? (
                <span className="absolute inset-x-0 bottom-0 bg-navy/80 py-0.5 text-center text-[10px] font-semibold text-navy-foreground">
                  Main
                </span>
              ) : null}
              <div className="absolute right-1 top-1 flex gap-1">
                {multiple && index > 0 ? (
                  <button
                    type="button"
                    onClick={() => makeMain(index)}
                    title="Set as main image"
                    className="grid size-6 place-items-center rounded bg-navy/80 text-navy-foreground"
                  >
                    <Star className="size-3" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  title="Remove image"
                  className="grid size-6 place-items-center rounded bg-destructive text-destructive-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {busy
          ? "Uploading…"
          : value.length
            ? multiple
              ? "Upload more images"
              : "Upload new image"
            : multiple
              ? "Upload images"
              : "Upload image"}
      </Button>
      <p className="text-xs text-muted-foreground">
        {hint ?? "JPG, PNG, WEBP, AVIF or GIF · up to 10 MB per image."}
      </p>
    </div>
  );
}
