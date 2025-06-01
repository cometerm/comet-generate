"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import Hero from "@/components/layout/hero";
import Features from "@/components/layout/features";
import { Speedometer, Target, GearSix, Package } from "@phosphor-icons/react";

const fadeInBlur = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
  },
};

export default function Page() {
  const [copiedStates, setCopiedStates] = useState({});

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const features = [
    {
      icon: Speedometer,
      title: "Fullstack in Seconds",
      description:
        "Scaffold frontend and backend Next.js apps with typesafe code in a few seconds.",
    },
    {
      icon: Target,
      title: "Database Options",
      description:
        "Choose either a NoSQL (MongoDB) or SQL (Prisma/Postgres), pre-integrated for you.",
    },
    {
      icon: GearSix,
      title: "Customizable Boilerplates",
      description:
        "Pick and choose a template or roll your own stack to tailor to your needs.",
    },
    {
      icon: Package,
      title: "Production Standards",
      description:
        "Includes Bun, ESLint, Prettier, TypeScript, Shadcn, and modern tooling by default.",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-neutral-950 text-neutral-300"
      variants={fadeInBlur}
      initial="initial"
      animate="animate"
    >
      <Header />
      <Hero copiedStates={copiedStates} copyToClipboard={copyToClipboard} />
      <Features features={features} />
    </motion.div>
  );
}
