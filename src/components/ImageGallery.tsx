"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Fuel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-[16/10] bg-muted flex items-center justify-center">
          <Fuel className="h-24 w-24 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10]">
        <Image
          src={images[current]}
          alt={`${title} - Image ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Badge variant="secondary" className="absolute bottom-3 right-3 bg-black/50 text-white border-0">
              {current + 1} / {images.length}
            </Badge>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === current ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
