"use client";

import { useCallback, useState } from "react";
import portfolioData from "@/../data/portfolio.json";
import { PortfolioData, Project } from "@/types/portfolio";
import { StudioProvider } from "@/context/HistoryContext";
import Chrome from "@/components/studio/Chrome";
import { Hero, Manifest, Marquee, Porta, Stage } from "@/components/studio/Intro";
import { Index, Reels } from "@/components/studio/Work";
import { CV } from "@/components/studio/Cv";
import { Postal } from "@/components/studio/Postal";
import { Fin, Reader } from "@/components/studio/Close";

const skills = ["Mix Media", "Collage Digital", "Branding Corporativo", "Identidad Visual", "Diseño Editorial", "Ilustración Infantil", "Señalética & Wayfinding", "Adobe InDesign", "Adobe Photoshop", "Adobe Illustrator", "Infografía Científica", "Diseño de Personajes", "Texturas Analógicas", "Tratamiento de Imagen", "Concept & Storytelling"];

export default function Home() {
  const d = portfolioData as PortfolioData;
  const [sel, setSel] = useState<Project | null>(null);
  const close = useCallback(() => setSel(null), []);
  return (
    <StudioProvider ids={d.projects.map((p) => p.id)}>
      <Chrome />
      <main className="pl-6 pt-6">
        <Hero a={d.author} />
        <Marquee items={skills} />
        <Porta a={d.author} />
        <Manifest a={d.author} />
        <Stage d={d} open={setSel} />
        <Index d={d} open={setSel} />
        <Reels d={d} open={setSel} />
        <CV d={d} open={setSel} />
        <Postal />
        <Fin a={d.author} c={d.colophon} />
      </main>
      <Reader p={sel} close={close} />
    </StudioProvider>
  );
}
