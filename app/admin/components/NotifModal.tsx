"use client";

import React, { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface NotifModalProps {
  message: string;
  variant?: "success" | "error";
  onClose: () => void;
}

const NotifModal = ({
  message,
  variant = "success",
  onClose,
}: NotifModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const color = variant === "success" ? "forestgreen" : "indianred";
  const title = variant === "success" ? "Success !" : "Error !";

  const triggerExitAnimation = useCallback(() => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        x: 100,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => onClose(),
      });
    } else {
      onClose();
    }
  }, [onClose]);

  useLayoutEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
      );
    }

    timerRef.current = setTimeout(() => {
      triggerExitAnimation();
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerExitAnimation]);

  const handleManualClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    triggerExitAnimation();
  };

  return (
    <div
      ref={modalRef}
      className="fixed top-4 right-4 z-10000 flex items-center justify-center p-4 will-change-transform"
    >
      <div className="flex w-full max-w-96 h-24 overflow-hidden bg-[#111111] border border-zinc-800 shadow-2xl rounded-xl relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="96"
          width="16"
          className="shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeWidth="2"
            stroke={color}
            fill={color}
            d="M 8 0 
               Q 4 4.8, 8 9.6 
               T 8 19.2 
               Q 4 24, 8 28.8 
               T 8 38.4 
               Q 4 43.2, 8 48 
               T 8 57.6 
               Q 4 62.4, 8 67.2 
               T 8 76.8 
               Q 4 81.6, 8 86.4 
               T 8 96 
               L 0 96 
               L 0 0 
               Z"
          ></path>
        </svg>

        <div className="mx-3 overflow-hidden w-full flex flex-col justify-center">
          <p
            className={`text-lg font-bold leading-tight mr-3 overflow-hidden text-ellipsis whitespace-nowrap`}
            style={{ color }}
          >
            {title}
          </p>
          <p className="overflow-hidden leading-snug text-zinc-400 max-h-12 text-sm mt-0.5 wrap-break-words">
            {message}
          </p>
        </div>

        <button
          onClick={handleManualClose}
          className="w-16 flex items-center justify-center cursor-pointer focus:outline-none hover:bg-zinc-800/30 transition-colors shrink-0 border-l border-zinc-800/50"
          aria-label="Închide notificare"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke={color}
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotifModal;
