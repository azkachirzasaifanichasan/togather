"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type BannerEvent = {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string | null;
  venue: string;
  price: string;
  image: string;
};

export function EventBanner({ events }: { events: BannerEvent[] }) {
  const count = events.length;
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const startX = useRef(0);
  const deltaX = useRef(0);

  useEffect(() => {
    if (count < 2 || paused) return;

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  const current = index % count;

  const move = (direction: number) => {
    setIndex((value) => (value + direction + count) % count);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button")) return;
    startX.current = event.clientX;
    deltaX.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = event.clientX - startX.current;
    deltaX.current = delta;
    setDragX(delta);
  };

  const handlePointerEnd = () => {
    if (!dragging) return;
    const delta = deltaX.current;
    setDragging(false);
    setDragX(0);
    if (Math.abs(delta) > 48) {
      move(delta < 0 ? 1 : -1);
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Event unggulan"
      className="overflow-hidden rounded-lg border border-gray-200 bg-gray-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        className="flex h-80 sm:h-96"
        style={{
          transform: `translate3d(calc(${-current * 100}% + ${dragX}px), 0, 0)`,
          transition: dragging ? "none" : "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {events.map((event, slideIndex) => {
          const meta = [event.date, event.time, event.venue, event.price]
            .filter(Boolean)
            .join(" · ");
          const isActive = slideIndex === current;

          return (
            <div
              key={event.id}
              aria-hidden={!isActive}
              className="relative h-full w-full shrink-0 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />

              <div className="relative flex h-full flex-col justify-end">
                <div className="px-6 pb-6">
                  <p className="text-xs font-medium text-gray-300">
                    {event.category}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-2xl font-bold text-white sm:text-3xl">
                    {event.name}
                  </h2>
                  <p className="mt-3 text-sm text-gray-300">
                    {meta}
                  </p>
                  <Link
                    href={`/event/${event.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-4 inline-block rounded bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                  >
                    Lihat detail
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-gray-700 bg-gray-900 px-4 py-3">
        <div className="flex gap-1">
          {events.map((event, slideIndex) => (
            <button
              key={event.id}
              type="button"
              aria-label={`Slide ${slideIndex + 1}`}
              aria-current={slideIndex === current}
              onClick={() => setIndex(slideIndex)}
              className={`h-1 rounded-full transition-all ${
                slideIndex === current
                  ? "w-6 bg-white"
                  : "w-2 bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Event sebelumnya"
            onClick={() => move(-1)}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-600 text-white transition-colors hover:border-white hover:bg-white hover:text-gray-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Event berikutnya"
            onClick={() => move(1)}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-600 text-white transition-colors hover:border-white hover:bg-white hover:text-gray-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
