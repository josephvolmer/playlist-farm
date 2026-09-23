"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 32, height = 32, className = "h-8 w-8" }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to use: logo.png for dark mode, logo2.png for light mode
  const logoSrc = mounted && (resolvedTheme === "dark" || theme === "dark") ? "/logo.png" : "/logo2.png"

  return <Image src={logoSrc} alt="PlaylistConnect Logo" width={width} height={height} className={className} />
}
