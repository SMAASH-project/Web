import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResizableHorizontal({
  onImageSizeChange,
  initialImageSize = 25,
  textColor = "",
  subtextColor = "",
  inputClass = "",
}: {
  onImageSizeChange?: (size: number) => void;
  initialImageSize?: number;
  textColor?: string;
  subtextColor?: string;
  inputClass?: string;
}) {
  const [imageSize, setImageSize] = useState(initialImageSize);
  const contentSize = 100 - imageSize;

  const handleResize = (size: number) => {
    setImageSize(size);
    onImageSizeChange?.(size);
  };

  const handleImageInputChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setImageSize(num);
      onImageSizeChange?.(num);
    }
  };

  const handleContentInputChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      const newImageSize = 100 - num;
      setImageSize(newImageSize);
      onImageSizeChange?.(newImageSize);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ResizablePanelGroup orientation="horizontal" className="min-h-50 w-full rounded-lg border">
        <ResizablePanel defaultSize={100 - initialImageSize}>
          <div className="flex h-full items-center justify-center p-6">
            <span className={`font-semibold ${subtextColor}`}>Content</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={initialImageSize}
          onResize={(size) => handleResize(size.asPercentage)}
        >
          <div className="flex h-full items-center justify-center p-6">
            <span className={`font-semibold ${subtextColor}`}>Image</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label className={`text-xs ${subtextColor}`}>Content %</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={contentSize.toFixed(1)}
            onChange={(e) => handleContentInputChange(e.target.value)}
            className={inputClass || "text-sm"}
          />
        </div>
        <div className="flex-1">
          <Label className={`text-xs ${subtextColor}`}>Image %</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={imageSize.toFixed(1)}
            onChange={(e) => handleImageInputChange(e.target.value)}
            className={inputClass || "text-sm"}
          />
        </div>
      </div>
    </div>
  );
}
