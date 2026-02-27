import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function ResizableVertical({
  onImageSizeChange,
  initialImageSize = 25,
}: {
  onImageSizeChange?: (size: number) => void;
  initialImageSize?: number;
}) {
  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="min-h-50 max-w-sm rounded-lg border md:min-w-112.5"
    >
      <ResizablePanel
        defaultSize={initialImageSize}
        onResize={(size) => onImageSizeChange?.(size.asPercentage)}
      >
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Banner Image</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - initialImageSize}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
