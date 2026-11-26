"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image src={images[active]} alt={name} fill priority
          sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button key={src + i} onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                i === active ? "border-primary" : "border-transparent"
              }`}>
              <Image src={src} alt={`${name} ${i + 1}`} fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}