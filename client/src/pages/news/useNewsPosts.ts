import { useState, useRef, useMemo, useCallback, useEffect } from "react";
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
  /** 0 = Top layout, positive = Right (side) layout */
  img_pos?: number;
  content: string;
  created_at: string; // YYYY-MM-DD
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function dtoToNewsPost(dto: PostReadDTO): NewsPost {
  return {
    id: String(dto.id),
    title: dto.title,
    category: dto.category as NewsPost["category"],
    image: dto.img_url || undefined,
    imageAlt: dto.img_alt || undefined,
    imagePosition: dto.img_pos && dto.img_pos > 0 ? "Right" : "Top",
    imageSize: 25,
    content: dto.content,
    createdAt: DateTime.fromFormat(dto.created_at, "yyyy-MM-dd").isValid
      ? DateTime.fromFormat(dto.created_at, "yyyy-MM-dd")
      : DateTime.now(),
  };
}

function newsPostToCreateBody(post: NewsPost) {
  return {
    title: post.title,
    category: post.category,
    img_url: post.image ?? "",
    img_alt: post.imageAlt ?? "",
    img_pos: post.imagePosition === "Right" ? 1 : 0,
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
      const { data } = await apiClient.post<PostReadDTO>(
        "/posts",
        newsPostToCreateBody(post),
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
      toast.success("Post created.");
    },
    onError: () => {
      toast.error("Failed to create post.");
    },
  });

  // ── Update ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation<void, Error, NewsPost>({
    mutationFn: async (post) => {
      await apiClient.put(`/posts/${post.id}`, newsPostToUpdateBody(post));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
      toast.success("Post updated.");
    },
    onError: () => {
      toast.error("Failed to update post.");
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
      toast.error("Failed to delete post.");
    },
    onSuccess: () => {
      toast.success("Post deleted.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });

  // ── Filtering / pagination ────────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    return allPosts.filter((post) =>
      selectedCategories.includes(post.category),
    );
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
    if (containerRef.current && !searchQuery) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
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
    isLoading,
    containerRef,
    handleCreate,
    handleUpdate,
    handleRemove,
    handleSearch,
  };
}
