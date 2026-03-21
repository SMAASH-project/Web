import { useTranslation } from "react-i18next";
import {
  formatDateTime,
  getBackgroundClasses,
  getTextColor,
  getTextShadow,
  getButtonClasses,
} from "@/lib/utils";
import Navbar from "../../nav/Navbar";
import { Card } from "@/components/ui/card";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { Label } from "@/components/ui/label";
import type { NewsPost } from "@/types/PageTypes";
import { AddNews } from "@/components/pages/mainPages/newsPageComponents/AddNews";
import { RemoveButton } from "@/components/pages/mainPages/newsPageComponents/RemoveButton";
import { EditButton } from "@/components/pages/mainPages/newsPageComponents/EditButton";
import { ButtonGroup } from "@/components/ui/button-group";
import { Search } from "@/components/pages/mainPages/newsPageComponents/Search";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNewsPosts } from "@/components/pages/mainPages/newsPageComponents/newsPageLogic/useNewsPosts";
import { useNewsCategoryFilter } from "@/components/pages/mainPages/newsPageComponents/newsPageLogic/useNewsCategoryFilter";
import { LoadPost } from "@/lib/pageAnimations/newsPageAnimations/LoadPost";
import { FilterSelect } from "./newsPageComponents/Filter";
import { CategoryBadge } from "./newsPageComponents/CategoryBadge";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function NewsPage() {
  const { settings } = useSettings();
  const { t } = useTranslation("news");
  const { isAdmin } = useContext(AuthContext);
  const { selectedByCategory, selectedCategories, setCategorySelected } =
    useNewsCategoryFilter();

  const {
    visiblePosts,
    containerRef,
    handleCreate,
    handleUpdate,
    handleRemove,
    handleSearch,
  } = useNewsPosts(selectedCategories);

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const buttonClass = getButtonClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <div className="p-3 sm:p-4 h-screen overflow-y-auto" ref={containerRef}>
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-4">
        {/* ── Toolbar ── */}
        <div className="flex flex-row w-full items-center justify-between gap-2">
          <ButtonGroup
            orientation="horizontal"
            className={`${buttonClass} rounded-lg shrink-0`}
          >
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
            <Label
              className={`text-base sm:text-lg ${textColor} ${textShadow} text-center hidden sm:block`}
            >
              {t("title") || "Latest News"}
            </Label>
            <FilterSelect
              selectedByCategory={selectedByCategory}
              onCategoryChange={setCategorySelected}
            />
          </span>
        </div>

        {/* ── Post list ── */}
        <ul className="list-none w-full flex flex-col gap-4">
          {visiblePosts.map((post: NewsPost, index: number) => {
            const cardContent = (
              <Card
                className={`z-0 flex flex-col p-4 sm:p-6 md:p-8 w-full ${bgClass}`}
              >
                {/* Header: title+badge left, date+actions right */}
                <div className="flex flex-row w-full items-start justify-between gap-3 mb-3">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Label
                      className={`text-base sm:text-lg font-semibold ${textColor} ${textShadow} break-words`}
                    >
                      {post.title}
                    </Label>
                    <CategoryBadge category={post.category} />
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Label
                      className={`text-xs sm:text-sm ${textColor} ${textShadow} italic text-right whitespace-nowrap`}
                    >
                      {formatDateTime(post.createdAt)}
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
                  <div className="flex flex-col gap-3 w-full">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="w-full rounded-md object-cover"
                        style={{ maxHeight: `${post.imageSize}vh` }}
                      />
                    )}
                    <div
                      className={`text-sm ${textColor} ${textShadow} text-justify prose prose-sm prose-invert max-w-none`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  /* Side image — stacks on mobile, side-by-side on sm+ */
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <div
                      className={`text-sm ${textColor} ${textShadow} text-justify prose prose-sm prose-invert max-w-none w-full sm:flex-1`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="rounded-md object-cover w-full sm:w-(--img-size)"
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

            return settings.useAnimations ? (
              <LoadPost key={post.id} index={index}>
                {cardContent}
              </LoadPost>
            ) : (
              <div key={post.id}>{cardContent}</div>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
