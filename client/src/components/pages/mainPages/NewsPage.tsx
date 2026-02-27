import { formatDateTime } from "@/lib/utils";
import Navbar from "../../nav/Navbar";
import { Card } from "@/components/ui/card";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { Label } from "@/components/ui/label";
import { AddNews } from "@/components/pages/mainPages/newsPageComponents/AddNews";
import { RemoveButton } from "@/components/pages/mainPages/newsPageComponents/RemoveButton";
import { EditButton } from "@/components/pages/mainPages/newsPageComponents/EditButton";
import { ButtonGroup } from "@/components/ui/button-group";
import { Search } from "@/components/pages/mainPages/newsPageComponents/Search";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNewsPosts } from "@/components/pages/mainPages/newsPageComponents/newsPageLogic/useNewsPosts";

export function NewsPage() {
  const { settings } = useSettings();
  const IsAdmin = true; // Replace with actual admin check

  const {
    visiblePosts,
    containerRef,
    handleCreate,
    handleUpdate,
    handleRemove,
    handleSearch,
  } = useNewsPosts();

  return (
    <div className="p-4 h-screen overflow-y-auto" ref={containerRef}>
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-5">
        <span className="flex flex-row w-full justify-between">
          <ButtonGroup
            orientation="horizontal"
            className={`text-white ${
              settings.useLiquidGlass
                ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30"
                : ""
            }`}
          >
            {IsAdmin ? (
              <>
                <AddNews onCreate={handleCreate} />
                <Search onSearch={handleSearch} />
              </>
            ) : (
              <Search onSearch={handleSearch} />
            )}
          </ButtonGroup>

          <Label
            className={`text-white text-lg ${
              settings.useLiquidGlass
                ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                : ""
            } text-center`}
          >
            Latest News
          </Label>
        </span>
        <ul className="list-disc pl-5 w-full">
          {visiblePosts.map((post) => (
            <Card
              className={`z-0 flex flex-row p-10 mb-5 max-w-full ${
                settings.useLiquidGlass
                  ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
                  : "bg-gray-600 border-2 border-green-400"
              }`}
              key={post.id}
            >
              <li className="flex flex-col gap-2 w-full">
                <span className="flex flex-row w-full justify-between">
                  <Label
                    className={`text-white text-lg ${
                      settings.useLiquidGlass
                        ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                        : ""
                    } text-left`}
                  >
                    {post.title}
                  </Label>
                  <Label
                    className={`text-white text-lg ${
                      settings.useLiquidGlass
                        ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                        : ""
                    } italic text-right`}
                  >
                    {formatDateTime(post.createdAt)}
                  </Label>
                  {IsAdmin ? (
                    <ButtonGroup>
                      <EditButton post={post} onUpdate={handleUpdate} />
                      <RemoveButton onConfirm={() => handleRemove(post.id)} />
                    </ButtonGroup>
                  ) : (
                    <></>
                  )}
                </span>
                {post.imagePosition === "Top" ? (
                  <div className="flex flex-col gap-2 w-full">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="w-full rounded-md object-cover"
                        style={{ maxHeight: `${post.imageSize}vh` }}
                      />
                    )}
                    <div
                      className={`text-white text-sm ${
                        settings.useLiquidGlass
                          ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                          : ""
                      } text-justify prose prose-sm prose-invert max-w-none`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row gap-4 w-full">
                    <div
                      className={`text-white text-sm ${
                        settings.useLiquidGlass
                          ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                          : ""
                      } text-justify prose prose-sm prose-invert max-w-none`}
                      style={{ width: `${100 - (post.imageSize ?? 0)}%` }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="rounded-md object-cover"
                        style={{ width: `${post.imageSize}%` }}
                      />
                    )}
                  </div>
                )}
              </li>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  );
}
