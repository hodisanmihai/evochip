"use client";

import React from "react";
import {
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaPhone,
  FaFacebookMessenger,
  FaWhatsapp,
} from "react-icons/fa";

const Contact: React.FC = () => {
  const phone = "+40740344530";
  const phoneLink = "tel:+40740344530";
  const whatsappLink = "https://wa.me/+40740344530";
  const instagram = "https://www.instagram.com/evochiporadea/";
  const messenger = "https://m.me/Ev0Chip";
  const facebook = "https://www.facebook.com/Ev0Chip/";
  const tiktok = "https://www.tiktok.com/@evochip";

  const cards = [
    {
      id: "phone",
      title: "Telefon",
      description: phone,
      href: phoneLink,
      borderColor: "group-hover:border-red-500/50",
      iconColor: "white",
      icon: <FaPhone className="w-6 h-6" />,
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Mesaj direct pe WhatsApp",
      href: whatsappLink,
      borderColor: "group-hover:border-red-500/50",
      iconColor: "white",
      icon: <FaWhatsapp className="w-6 h-6" />,
    },
    {
      id: "instagram",
      title: "Instagram",
      description: "Trimite un DM pe Instagram",
      href: instagram,
      borderColor: "group-hover:border-red-500/50",
      iconColor: "white",
      icon: <FaInstagram className="w-6 h-6" />,
    },
    {
      id: "messenger",
      title: "Messenger",
      description: "Mesaj pe Facebook Messenger",
      href: messenger,
      borderColor: "group-hover:border-red-500/50",
      iconColor: "white",
      icon: <FaFacebookMessenger className="w-6 h-6" />,
    },
  ];

  return (
    <section className="w-full bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center  p-8 md:p-8 gap-8 relative z-[2]">
      <div className="w-full max-w-3xl px-2 self-start md:px-30 md:mb-20 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight text-white mb-2 ">
          Ia legătura <span className="text-red-500">acum</span>
        </h1>
      </div>

      <div className="w-full max-w-3xl px-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((c) => (
          <a
            key={c.id}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="block group"
          >
            <div
              className={`w-full min-h-[11rem] h-full rounded-3xl border border-zinc-800 bg-gradient-to-br from-black via-zinc-950 to-black shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${c.borderColor}`}
            >
              <div className="p-6 md:p-8 flex flex-col gap-4 text-white h-full justify-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full border  flex items-center justify-center  shrink-0 transition-all duration-300 group-hover:border-red-500/60 group-hover:text-red-400 ${c.iconColor}`}
                  >
                    {c.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-zinc-100 leading-tight">
                    {c.title}
                  </h3>
                </div>

                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-sm">
                  {c.description}
                </p>

                <div className="h-[2px] w-1/4 bg-gradient-to-r from-transparent via-red-500 to-transparent group-hover:w-1/2 transition-all duration-500" />
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="w-full max-w-3xl px-2 mt-4">
        <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between text-white/80">
          <div>
            <div className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wider">
              Urmărește-ne
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-blue-500 flex items-center gap-2 transition-colors"
              >
                <FaFacebook className="w-5 h-5" />{" "}
                <span className="text-sm">Facebook</span>
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-pink-500 flex items-center gap-2 transition-colors"
              >
                <FaInstagram className="w-5 h-5" />{" "}
                <span className="text-sm">Instagram</span>
              </a>
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <FaTiktok className="w-5 h-5" />{" "}
                <span className="text-sm">TikTok</span>
              </a>
            </div>
          </div>

          <div className="text-sm text-zinc-400 self-start md:self-end">
            Preferi un email?{" "}
            <a
              href="mailto:contact@domeniu.ro"
              className="text-primary hover:underline block md:inline mt-1 md:mt-0"
            >
              contact@domeniu.ro
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
