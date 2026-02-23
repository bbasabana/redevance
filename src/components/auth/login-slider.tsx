"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

const slides = [
    {
        id: 1,
        image: "/images/slider/rtnc.png",
        title: "Gérez votre redevance",
        description: "Où que vous soyez, en toute simplicité.",
    },
    {
        id: 2,
        image: "/images/slider/resto.png",
        title: "Performance & Transparence",
        description: "Une gestion moderne pour un avenir numérique.",
    },
    {
        id: 3,
        image: "/images/slider/hotel.png",
        title: "Portail Officiel RTNC",
        description: "La plateforme sécurisée de la Redevance Audiovisuelle.",
    },
];

export function LoginSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-primary">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={slides[current].image}
                        alt={slides[current].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#003d7b]/80 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-12 left-12 right-12 z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-2 leading-tight">
                            {slides[current].title}
                        </h2>
                        <p className="text-xl text-white/80 max-w-md">
                            {slides[current].description}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="flex gap-2 mt-8">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-500",
                                current === i ? "w-8 bg-white" : "w-1.5 bg-white/30"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
