import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import apiClient from "@/lib/apiClient";
import type { NewsPost } from "@/types/PageTypes";
import { toast } from "@/lib/toast";

// ─── Backend DTO ──────────────────────────────────────────────────────────────

interface PostReadDTO {
  id: number;
  title: string;
  category: string;
  img_url?: string;
  img_alt?: string;
  /**
   * Encodes both layout and image size:
   *   0          → Top, default 50 vh  (omitempty — not sent when 0)
   *   positive   → Right, img_pos * 10 = width %  (e.g. 2.5 → 25 %)
   *   negative   → Top,  |img_pos| * 10 = max-height vh  (e.g. -2.5 → 25 vh)
   * Legacy: img_pos === 1 treated as Right + 25 % default.
   */
  img_pos?: number;
  content: string;
  created_at: string; // YYYY-MM-DD
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function dtoToNewsPost(dto: PostReadDTO): NewsPost {
  const pos = dto.img_pos ?? 0;
  const isRight = pos > 0;
  return {
    id: String(dto.id),
    title: dto.title,
    category: dto.category as NewsPost["category"],
    image: dto.img_url || undefined,
    imageAlt: dto.img_alt || undefined,
    imagePosition: isRight ? "Right" : "Top",
    // Legacy img_pos=1 (old boolean Right) → default 25 %; new values: multiply by 10
    imageSize: isRight
      ? pos === 1
        ? 25
        : Math.round(pos * 10)
      : pos === 0
        ? 50
        : Math.round(-pos * 10),
    content: dto.content,
    createdAt: DateTime.fromFormat(dto.created_at, "yyyy-MM-dd").isValid
      ? DateTime.fromFormat(dto.created_at, "yyyy-MM-dd")
      : DateTime.now(),
  };
}

function newsPostToCreateBody(post: NewsPost) {
  // Clamp 1–99 so the encoded value stays within the DB constraint (img_pos < 10)
  const size = Math.min(Math.max(post.imageSize ?? 25, 1), 99);
  return {
    title: post.title,
    category: post.category,
    img_url: post.image ?? "",
    img_alt: post.imageAlt ?? "",
    img_pos: post.imagePosition === "Right" ? size / 10 : -(size / 10),
    content: post.content,
  };
}

function newsPostToUpdateBody(post: NewsPost) {
  return { id: Number(post.id), ...newsPostToCreateBody(post) };
}

const POSTS_KEY = ["posts"] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNewsPosts(selectedCategories: NewsPost["category"][] = []) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("news");
  const [postsToShow, setPostsToShow] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fetch all posts ──────────────────────────────────────────────────────
  const { data: allPosts = [], isLoading } = useQuery<NewsPost[]>({
    queryKey: POSTS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<PostReadDTO[] | null>("/posts", {
        params: { page: 1, page_size: 100 },
      });
      return (data ?? []).map(dtoToNewsPost);
    },
    staleTime: 2 * 60 * 1000,
  });

  // ── Create ───────────────────────────────────────────────────────────────
  const createMutation = useMutation<PostReadDTO, Error, NewsPost>({
    mutationFn: async (post) => {
      const { data } = await apiClient.post<PostReadDTO>("/posts", newsPostToCreateBody(post));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
      toast.success(t("toast.created"));
    },
    onError: () => {
      toast.error(t("toast.createFailed"));
    },
  });

  // ── Update ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation<void, Error, NewsPost>({
    mutationFn: async (post) => {
      await apiClient.put(`/posts/${post.id}`, newsPostToUpdateBody(post));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
      toast.success(t("toast.updated"));
    },
    onError: () => {
      toast.error(t("toast.updateFailed"));
    },
  });

  // ── Delete ───────────────────────────────────────────────────────────────
  // The backend controller has a Delete function but no DELETE route mounted yet.
  // We optimistically remove from cache and attempt the request — it will
  // succeed once the route is wired up, and falls back gracefully until then.
  const removeMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/posts/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: POSTS_KEY });
      const previous = queryClient.getQueryData<NewsPost[]>(POSTS_KEY);
      queryClient.setQueryData<NewsPost[]>(POSTS_KEY, (old) =>
        (old ?? []).filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      const ctx = context as { previous?: NewsPost[] } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(POSTS_KEY, ctx.previous);
      }
      toast.error(t("toast.deleteFailed"));
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });

  // ── Filtering / pagination ────────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    return allPosts.filter((post) => selectedCategories.includes(post.category));
  }, [allPosts, selectedCategories]);

  useEffect(() => {
    setPostsToShow(2);
  }, [selectedCategories]);

  const visiblePosts = useMemo(() => {
    if (searchQuery) {
      return filteredPosts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filteredPosts.slice(0, postsToShow);
  }, [filteredPosts, postsToShow, searchQuery]);

  // ── Infinite scroll ───────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    if (!searchQuery) {
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 5) {
        setPostsToShow((prev) => prev + 2);
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleCreate(post: NewsPost) {
    createMutation.mutate(post);
  }

  function handleUpdate(updated: NewsPost) {
    updateMutation.mutate(updated);
  }

  function handleRemove(id: string) {
    removeMutation.mutate(id);
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPostsToShow(2);
  }

  return {
    visiblePosts,
    totalCount: filteredPosts.length,
    isSearching: searchQuery.length > 0,
    isLoading,
    containerRef,
    handleCreate,
    handleUpdate,
    handleRemove,
    handleSearch,
  };
}
