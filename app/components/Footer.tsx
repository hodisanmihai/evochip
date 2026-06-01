"use client";

import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import {
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaFacebookMessenger,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const phone = "+40740344530";
  const email = "contact@evochip.ro";
  const address = "Oradea, Romania";

  const instagram = "https://www.instagram.com/evochiporadea/";
  const facebook = "https://www.facebook.com/Ev0Chip/";
  const tiktok = "https://www.tiktok.com/@evochip";
  const messenger = "https://m.me/Ev0Chip";

  const links = [
    { label: "Acasă", href: "#" },
    { label: "Servicii", href: "#showcase4" },
    { label: "Contact", href: "#contact" },
    { label: "Politică de Confidențialitate", href: "#" },
  ];

  return (
    <footer className="w-full bg-gradient-to-t from-black via-zinc-950 to-black border-t border-red-500/20 backdrop-blur-xl z-[2]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid  grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-200 via-white to-red-200 bg-clip-text text-transparent">
              EvoChip
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Soluții inovatoare și performante pentru dezvoltarea digitală a
              afacerii tale.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-[2px] w-8 bg-gradient-to-r from-red-500 to-transparent" />
              <span className="text-xs text-red-500/80 font-semibold">
                QUALITY SOLUTIONS
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white">Links Rapide</h4>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-zinc-400 hover:text-red-400 transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white">Contact</h4>
            <div className="space-y-3">
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-zinc-400 hover:text-red-400 transition-colors text-sm group"
              >
                <FaPhone className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-zinc-400 hover:text-red-400 transition-colors text-sm group"
              >
                <FaEnvelope className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                {email}
              </a>
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                {address}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent mb-8" />

        {/* Social Links & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">Urmărește-ne:</span>
            <div className="flex gap-4">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/60 transition-all"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/60 transition-all"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/60 transition-all"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
              <a
                href={messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/60 transition-all"
              >
                <FaFacebookMessenger className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right text-xs text-zinc-500">
            <p>
              © {currentYear}{" "}
              <span className="text-red-500 font-semibold">EvoChip</span>. Toate
              drepturile rezervate.
            </p>
            <a
              href="https://portofolio-xi-dun.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-primary hover:underline"
            >
              Designed & Developed by
              <span className="text-red-500">@hodii</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
