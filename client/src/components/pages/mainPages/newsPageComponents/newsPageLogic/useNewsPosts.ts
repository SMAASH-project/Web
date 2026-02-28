import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { newsPosts, type NewsPost } from "@/types/PageTypes";

export function useNewsPosts(selectedCategories: NewsPost["category"][] = []) {
  const [allPosts, setAllPosts] = useState<NewsPost[]>(newsPosts);
  const [postsToShow, setPostsToShow] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    return allPosts.filter((post) =>
      selectedCategories.includes(post.category),
    );
  }, [allPosts, selectedCategories]);

  const visiblePosts = useMemo(() => {
    if (searchQuery) {
      return filteredPosts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filteredPosts.slice(0, postsToShow);
  }, [filteredPosts, postsToShow, searchQuery]);

  useEffect(() => {
    setPostsToShow(2);
  }, [selectedCategories]);

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

  function handleCreate(post: NewsPost) {
    setAllPosts((p) => [post, ...p]);
  }

  function handleUpdate(updated: NewsPost) {
    setAllPosts((list) =>
      list.map((it) => (it.id === updated.id ? updated : it)),
    );
  }

  function handleRemove(id: string) {
    setAllPosts((p) => p.filter((x) => x.id !== id));
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPostsToShow(2);
  }

  return {
    visiblePosts,
    containerRef,
    handleCreate,
    handleUpdate,
    handleRemove,
    handleSearch,
  };
}
