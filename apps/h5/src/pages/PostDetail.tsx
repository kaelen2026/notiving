import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await apiClient.getPost(id!);
      if (!res.success || !res.data) {
        throw new Error(res.error ?? "Post not found");
      }
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-foreground-secondary">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-foreground-secondary">
          {error?.message ?? "Post not found"}
        </p>
        <Link to="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          {post.title}
        </h1>
        <time className="text-sm text-foreground-tertiary">
          {new Date(post.createdAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>
      <div className="prose text-foreground-secondary leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
