import { useRef, useCallback } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageUploadProps {
  currentImage?: string | null;
  fallback?: string;
  onImageChange: (dataUrl: string) => void;
  size?: "sm" | "lg";
}

function resizeImage(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ currentImage, fallback = "?", onImageChange, size = "lg" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    try {
      const dataUrl = await resizeImage(file, 400, 0.8);
      onImageChange(dataUrl);
    } catch {
      // silently fail
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  }, [onImageChange]);

  const sizeClasses = size === "lg"
    ? "h-28 w-28 border-4"
    : "h-24 w-24 border-2";
  const iconSize = size === "lg" ? "w-8 h-8" : "w-6 h-6";
  const badgeSize = size === "lg" ? "w-8 h-8" : "w-7 h-7";
  const badgeIconSize = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className="flex flex-col items-center">
      <div className="relative group cursor-pointer" onClick={handleClick}>
        <Avatar className={`${sizeClasses} border-background shadow-lg`}>
          <AvatarImage src={currentImage || undefined} />
          <AvatarFallback className="text-muted-foreground">
            {currentImage ? fallback : <Camera className={iconSize} />}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className={`${iconSize} text-white drop-shadow-md`} />
        </div>
        <div className={`absolute bottom-0 right-0 ${badgeSize} bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-sm`}>
          <Camera className={badgeIconSize} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 font-medium">
        {currentImage ? "Tap to change photo" : "Upload Profile Photo"}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
