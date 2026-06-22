"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaFacebookMessenger,
} from "react-icons/fa";
import gsap from "gsap";
import evoChipLogo from "../../public/resources/LOGO-EVOCHIP.png";

type NavbarProps = {
  contact: any;
};

const NavBar = ({ contact }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);

  const getMessengerLink = (facebookUrl?: string) => {
    if (!facebookUrl) return "#";

    const username = facebookUrl
      .replace("https://www.facebook.com/", "")
      .replace("https://facebook.com/", "")
      .replace("/", "");

    return `https://m.me/${username}`;
  };

  const links = [
    { label: "Acasă", href: "#" },
    { label: "Servicii", href: "#showcase4" },
    { label: "Contact", href: "#contact" },
  ];

  const social = [
    {
      id: contact.facebook_url || "fb",
      href: contact.facebook_url,
      icon: <FaFacebook className="w-4 h-4" />,
    },
    {
      id: contact.instagram_url || "insta",
      href: contact.instagram_url,
      icon: <FaInstagram className="w-4 h-4" />,
    },
    {
      id: contact.tiktok_url || "tiktok",
      href: contact.tiktok_url,
      icon: <FaTiktok className="w-4 h-4" />,
    },
    {
      id: "messenger",
      href: getMessengerLink(contact?.facebook_url),
      icon: <FaFacebookMessenger className="w-4 h-4" />,
    },
  ];

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !overlayRef.current || !menuRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, ease: "power1.out" }
      );

      gsap.fromTo(
        menuRef.current,
        { y: -20, autoAlpha: 0, scale: 0.98 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" }
      );

      gsap.fromTo(
        linksRef.current,
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.45,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.15,
        }
      );
    }, overlayRef);

    return () => ctx.revert();
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 overscroll-none">
      <div className="mx-auto flex items-center justify-between w-full px-4 py-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-primary/10">
        <a href="#" className="flex items-center gap-3">
          <div className="relative w-10 h-10 md:w-16 md:h-16">
            <Image
              src={evoChipLogo}
              alt="EvoChip Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-white text-lg md:text-xl font-semibold tracking-[0.18em]">
            EVOCHIP
          </span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Meniu"
          className="w-12 h-12 rounded-full border border-red-500/20 bg-black/60 flex items-center justify-center text-red-400 hover:text-white hover:border-red-400 transition-all duration-200 "
        >
          {menuOpen ? (
            <FaTimes className="w-5 h-5" />
          ) : (
            <FaBars className="w-5 h-5" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          ref={overlayRef}
          className="absolute inset-x-0 top-full h-screen bg-black/70 border-b border-red-500/20 backdrop-blur-xl flex items-center justify-center"
        >
          <div className="mx-auto max-w-6xl" ref={menuRef}>
            <nav className="flex flex-col gap-6 text-white text-3xl text-center">
              {links.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  ref={(el) => {
                    if (el) linksRef.current[index] = el;
                  }}
                  className="hover:text-red-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-8 flex items-center justify-center gap-4">
                {social.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/60 transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
