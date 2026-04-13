import { useTranslation } from "react-i18next";
import {
  formatDate,
  getBackgroundClasses,
  getTextColor,
  getTextShadow,
  getSubtextColor,
  getButtonClasses,
} from "@/lib/utils";
import Navbar from "@/components/nav/Navbar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/pages/settings/SettingsContext";
import type { NewsPost } from "@/types/PageTypes";
import { AddNews } from "@/pages/news/components/AddNews";
import { RemoveButton } from "@/pages/news/components/RemoveButton";
import { EditButton } from "@/pages/news/components/EditButton";
import { ButtonGroup } from "@/components/ui/button-group";
import { Search } from "@/pages/news/components/Search";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNewsPosts } from "@/pages/news/useNewsPosts";
import { useNewsCategoryFilter } from "@/pages/news/useNewsCategoryFilter";
import { LoadPost } from "@/animations/LoadPost";
import { FilterSelect } from "./components/Filter";
import { CategoryBadge } from "./components/CategoryBadge";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useVirtualizer } from "@tanstack/react-virtual";

export function NewsPage() {
  const { settings } = useSettings();
  const { t } = useTranslation("news");
  const { isAdmin } = useContext(AuthContext);
  const { selectedByCategory, selectedCategories, setCategorySelected } = useNewsCategoryFilter();

  const {
    visiblePosts,
    totalCount,
    isSearching,
    isLoading: postsLoading,
    handleCreate,
    handleUpdate,
    handleRemove,
    handleSearch,
  } = useNewsPosts(selectedCategories);

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode);
  const buttonClass = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode);
  const postsVirtualizer = useVirtualizer({
    count: visiblePosts.length,
    getScrollElement: () => document.documentElement,
    estimateSize: () => 360,
    overscan: 6,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 360,
  });

  return (
    <div className="min-h-dvh w-full px-4 pb-8 sm:px-8 lg:px-25">
      <Navbar />
      <div className="z-0 mt-25 flex w-full flex-col items-center justify-start gap-4">
        {/* ── Toolbar ── */}
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <ButtonGroup orientation="horizontal" className={`${buttonClass} shrink-0 rounded-lg`}>
            {isAdmin ? (
              <>
                <AddNews onCreate={handleCreate} />
                <Search onSearch={handleSearch} />
              </>
            ) : (
              <Search onSearch={handleSearch} />
            )}
          </ButtonGroup>

          <span className="flex flex-row items-center gap-2">
            {!postsLoading && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${bgClass} ${subtextColor}`}
              >
                {isSearching
                  ? t("results", { count: visiblePosts.length })
                  : t("posts", { count: totalCount })}
              </span>
            )}
            <FilterSelect
              selectedByCategory={selectedByCategory}
              onCategoryChange={setCategorySelected}
            />
          </span>
        </div>

        {/* ── Post list ── */}
        {postsLoading && (
          <ul className="flex w-full list-none flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <div className={`z-0 flex w-full flex-col rounded-xl p-4 sm:p-6 md:p-8 ${bgClass}`}>
                  <div className="mb-3 flex w-full flex-row items-start justify-between gap-3">
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24 shrink-0" />
                  </div>
                  <Skeleton className="mt-1 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-5/6" />
                  <Skeleton className="mt-2 h-3 w-4/6" />
                </div>
              </li>
            ))}
          </ul>
        )}
        <ul
          className="relative w-full list-none"
          style={{ height: `${postsVirtualizer.getTotalSize()}px` }}
        >
          {postsVirtualizer.getVirtualItems().map((virtualRow) => {
            const post = visiblePosts[virtualRow.index] as NewsPost;
            const index = virtualRow.index;
            const cardContent = (
              <Card
                className={`z-0 flex w-full min-w-0 flex-col overflow-hidden p-4 sm:p-6 md:p-8 ${bgClass}`}
              >
                {/* Header: title+badge left, date+actions right */}
                <div className="mb-3 flex w-full min-w-0 flex-row items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <Label
                      className={`text-[clamp(0.85rem,1.8vw,1.125rem)] font-semibold ${textColor} ${textShadow} wrap-break-word`}
                    >
                      {post.title}
                    </Label>
                    <CategoryBadge category={post.category} />
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Label
                      className={`text-[clamp(0.65rem,1.2vw,0.875rem)] ${textColor} ${textShadow} text-right whitespace-nowrap italic`}
                    >
                      {formatDate(post.createdAt)}
                    </Label>
                    {isAdmin && (
                      <ButtonGroup>
                        <EditButton post={post} onUpdate={handleUpdate} />
                        <RemoveButton onConfirm={() => handleRemove(post.id)} />
                      </ButtonGroup>
                    )}
                  </div>
                </div>

                {/* Body: image + content */}
                {post.imagePosition === "Top" ? (
                  <div className="flex w-full min-w-0 flex-col gap-3">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="w-full rounded-md"
                        style={{ maxHeight: `${post.imageSize}vh` }}
                      />
                    )}
                    <div
                      className={`text-[clamp(0.7rem,1.5vw,0.875rem)] ${textColor} ${textShadow} prose prose-sm prose-invert max-w-none min-w-0 text-justify wrap-break-word`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  /* Side image — stacks on mobile, side-by-side on sm+ */
                  <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <div
                      className={`text-[clamp(0.7rem,1.5vw,0.875rem)] ${textColor} ${textShadow} prose prose-sm prose-invert w-full max-w-none min-w-0 text-justify wrap-break-word sm:flex-1`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                    </div>
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="w-full flex-none self-start rounded-md sm:w-(--img-size)"
                        style={
                          {
                            "--img-size": `${post.imageSize}%`,
                          } as React.CSSProperties
                        }
                      />
                    )}
                  </div>
                )}
              </Card>
            );

            return (
              <li
                key={post.id}
                data-index={virtualRow.index}
                ref={postsVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className="pb-4">
                  {settings.useAnimations ? (
                    <LoadPost index={index}>{cardContent}</LoadPost>
                  ) : (
                    cardContent
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
