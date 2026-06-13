"use client"

import Image, { StaticImageData } from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

type Teacher = {
  name: string
  subject: string
  photo: StaticImageData
  accent: string
}

export function TeacherCarousel({ teachers }: { teachers: Teacher[] }) {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const count = teachers.length

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % count)
  }, [count])

  // Auto-rotate every 4.5s
  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(next, 4500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, next])

  // Click pauses for 6s then resumes
  const handleClick = (index: number) => {
    setIsPaused(true)
    setActive(index)
    if (resumeRef.current) clearTimeout(resumeRef.current)
    resumeRef.current = setTimeout(() => setIsPaused(false), 6000)
  }

  useEffect(() => {
    return () => {
      if (resumeRef.current) clearTimeout(resumeRef.current)
    }
  }, [])

  /*
   * Layout:
   * The container is wide (spans the full column).
   * Center card = 65% width, 100% height, centered.
   * Left card  = 65% width, 80% height, shifted left so ~half is visible.
   * Right card = 65% width, 80% height, shifted right so ~half is visible.
   * Others = hidden behind center.
   */
  const getStyle = (index: number): React.CSSProperties => {
    const diff = (index - active + count) % count

    if (diff === 0) {
      // CENTER — active card
      return {
        left: "50%",
        transform: "translateX(-50%) scale(1)",
        opacity: 1,
        zIndex: 10,
        filter: "brightness(1)",
      }
    }
    if (diff === 1) {
      // RIGHT — next card, half visible
      return {
        left: "50%",
        transform: "translateX(18%) scale(0.80)",
        opacity: 0.55,
        zIndex: 5,
        filter: "brightness(0.65)",
      }
    }
    if (diff === count - 1) {
      // LEFT — previous card, half visible
      return {
        left: "50%",
        transform: "translateX(-118%) scale(0.80)",
        opacity: 0.55,
        zIndex: 5,
        filter: "brightness(0.65)",
      }
    }
    // HIDDEN
    return {
      left: "50%",
      transform: "translateX(-50%) scale(0.7)",
      opacity: 0,
      zIndex: 0,
      pointerEvents: "none",
      filter: "brightness(0.4)",
    }
  }

  return (
    <div className="w-full max-w-lg select-none">
      {/* Carousel viewport */}
      <div
        className="relative overflow-hidden"
        style={{ height: "clamp(240px, 46vw, 350px)" }}
      >
        {teachers.map((teacher, index) => {
          const diff = (index - active + count) % count
          const isActive = diff === 0

          return (
            <div
              key={teacher.name}
              onClick={() => handleClick(index)}
              className="absolute top-0 cursor-pointer will-change-transform"
              style={{
                width: "72%",
                height: "100%",
                ...getStyle(index),
                transition:
                  "transform 1s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 1s cubic-bezier(0.22, 0.61, 0.36, 1), filter 1s cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            >
              {/* Gradient border frame */}
              <div
                className="h-full w-full rounded-2xl p-[3px] shadow-2xl transition-shadow duration-1000"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #22d3ee, rgba(255,255,255,0.35), #fbbf24)"
                    : "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                  boxShadow: isActive
                    ? "0 25px 60px -12px rgba(0,0,0,0.5)"
                    : "0 10px 30px -8px rgba(0,0,0,0.3)",
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[13px] bg-gray-900">
                  <Image
                    src={teacher.photo}
                    alt={`${teacher.name} — ${teacher.subject} Instructor`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 70vw, 400px"
                    priority={index < 2}
                    placeholder="blur"
                  />

                  {/* Name overlay — fades in only on active card */}
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-4 pt-16 transition-opacity duration-700"
                    style={{ opacity: isActive ? 1 : 0 }}
                  >
                    <p className="text-base font-bold text-white md:text-lg">
                      {teacher.name}
                    </p>
                    <p className="text-xs font-medium text-cyan-300 md:text-sm">
                      {teacher.subject}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>


    </div>
  )
}
