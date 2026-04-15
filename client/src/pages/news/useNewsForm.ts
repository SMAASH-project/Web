import { useState, useRef } from "react";
import type { NewsPost } from "@/types/PageTypes";

interface UseNewsFormOptions {
  /** Initial values to populate the form (used by EditButton) */
  initial?: Partial<NewsPost>;
}

export function useNewsForm(options: UseNewsFormOptions = {}) {
  const { initial } = options;

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState<NewsPost["category"]>(
    initial?.category ?? "Major update",
  );
  const [imagePosition, setImagePosition] = useState<"Top" | "Right">(
    initial?.imagePosition ?? "Top",
  );
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "");
  const [imageSize, setImageSize] = useState(initial?.imageSize ?? 25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageAlt(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImage("");
    setImageAlt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm(values?: Partial<NewsPost>) {
    setTitle(values?.title ?? "");
    setContent(values?.content ?? "");
    setCategory(values?.category ?? "Major update");
    setImagePosition(values?.imagePosition ?? "Top");
    setImage(values?.image ?? "");
    setImageAlt(values?.imageAlt ?? "");
    setImageSize(values?.imageSize ?? 25);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /** Get the current form values as a partial NewsPost */
  function getFormValues() {
    return {
      title,
      content,
      category,
      image,
      imageAlt,
      imagePosition,
      imageSize,
    };
  }

  return {
    open,
    setOpen,
    title,
    setTitle,
    content,
    setContent,
    category,
    setCategory,
    imagePosition,
    setImagePosition,
    image,
    setImage,
    imageAlt,
    setImageAlt,
    imageSize,
    setImageSize,
    fileInputRef,
    handleFileChange,
    clearImage,
    resetForm,
    getFormValues,
  };
}
