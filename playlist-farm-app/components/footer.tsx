"use client"

import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image src="/cassette.png" alt="" width={28} height={28} className="w-7 h-7 opacity-60" />
          <span>Made with love for music creators</span>
          <Image src="/cassette2.png" alt="" width={28} height={28} className="w-7 h-7 opacity-60" />
        </div>
        <p>© 2024 PlaylistConnect. All rights reserved.</p>
      </div>
    </footer>
  )
}
