"use client";
import { useEffect } from "react";

export default function SwiperInit() {
  useEffect(() => {
    let swiperInstance: import("swiper").Swiper | null = null;

    async function init() {
      const { default: Swiper } = await import("swiper");
      const { FreeMode, Pagination } = await import("swiper/modules");
      await import("swiper/css");
      await import("swiper/css/free-mode");

      swiperInstance = new Swiper(".project-slider", {
        modules: [FreeMode, Pagination],
        slidesPerView: "auto",
        spaceBetween: 40,
        freeMode: true,
        loop: true,
        grabCursor: true,
        allowTouchMove: true, // Crucial for responsive swipe navigation on mobile
        speed: 800,
        pagination: { el: ".swiper-pagination", clickable: true },
      });
    }

    init();
    return () => { swiperInstance?.destroy(true, true); };
  }, []);

  return null;
}
