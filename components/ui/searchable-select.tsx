"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { ChevronDown, Search, Check } from "lucide-react"

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: React.ElementType
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  icon: Icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [dropUp, setDropUp] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.toLowerCase().includes(q))
  }, [options, search])

  const checkPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    // If less than 260px below the trigger, open upward
    setDropUp(rect.bottom + 260 > window.innerHeight)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen) checkPosition()
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      >
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        )}
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`size-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 max-h-60 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="sticky top-0 bg-white border-b border-gray-50 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-100"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 text-center">No options found.</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                    setSearch("")
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-indigo-50 ${
                    value === opt ? "bg-indigo-50 font-semibold text-indigo-700" : "text-gray-700"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="size-4 text-indigo-600" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
