import { newsPosts, type NewsPost } from "@/lib/PageTypes";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { formatDateTime } from "@/lib/utils";
import Navbar from "../../nav/Navbar";
import { Card } from "@/components/ui/card";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { Label } from "@/components/ui/label";
import { AddNews } from "./mainPageComponents/AddNews";
import { RemoveButton } from "./mainPageComponents/RemoveButton";
import { EditButton } from "./mainPageComponents/EditButton";
import { ButtonGroup } from "@/components/ui/button-group";
import { Search } from "./mainPageComponents/Search";

export function NewsPage() {
  const { settings } = useSettings();
  const [allPosts, setAllPosts] = useState<NewsPost[]>(newsPosts);
  const [postsToShow, setPostsToShow] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const IsAdmin = true; // Replace with actual admin check
  const containerRef = useRef<HTMLDivElement>(null);

  const visiblePosts = useMemo(() => {
    if (searchQuery) {
      return allPosts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return allPosts.slice(0, postsToShow);
  }, [allPosts, postsToShow, searchQuery]);

  const handleScroll = useCallback(() => {
    if (containerRef.current && !searchQuery) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        // 5px buffer
        setPostsToShow((prev) => prev + 2);
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  function handleCreate(post: NewsPost) {
    setAllPosts((p) => [post, ...p]);
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPostsToShow(2); // Reset pagination when a new search is made
  };

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
              className={`z-0 flex flex-row p-10 mb-5 max-w-full max-h-lg ${
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
                      <EditButton
                        post={post}
                        onUpdate={(p) =>
                          setAllPosts((list) =>
                            list.map((it) => (it.id === p.id ? p : it)),
                          )
                        }
                      />
                      <RemoveButton
                        onConfirm={() =>
                          setAllPosts((p) => p.filter((x) => x.id !== post.id))
                        }
                      />
                    </ButtonGroup>
                  ) : (
                    <></>
                  )}
                </span>
                <Label
                  className={`text-white text-sm ${
                    settings.useLiquidGlass
                      ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                      : ""
                  } text-justify`}
                >
                  {post.content}
                </Label>
              </li>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  );
}
