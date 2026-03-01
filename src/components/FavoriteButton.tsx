"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  listingId: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({ listingId, size = "md" }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/favorites/${listingId}`)
      .then((r) => r.json())
      .then((data) => setFavorited(data.favorited))
      .catch(() => {});
  }, [listingId, session]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user || loading) return;

    setLoading(true);
    try {
      if (favorited) {
        await fetch(`/api/favorites/${listingId}`, { method: "DELETE" });
        setFavorited(false);
      } else {
        await fetch(`/api/favorites/${listingId}`, { method: "POST" });
        setFavorited(true);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={loading}
      className={`${btnSize} rounded-full ${
        favorited ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-500" : "bg-white/80 text-muted-foreground hover:text-red-500 hover:bg-white"
      }`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} ${favorited ? "fill-current" : ""}`} />
    </Button>
  );
}
