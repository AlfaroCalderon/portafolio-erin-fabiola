"use client";

import { useCallback, useState } from "react";
import portfolioData from "@/../data/portfolio.json";
import { PortfolioData, Project } from "@/types/portfolio";
import { StudioProvider } from "@/context/HistoryContext";
import Chrome from "@/components/studio/Chrome";
import Welcome from "@/components/studio/Welcome";
import { Manifest } from "@/components/studio/Intro";
import TreeJourney from "@/components/tree/TreeJourney";
import { Index } from "@/components/studio/Work";
import { CV } from "@/components/studio/Cv";
import { Fin, Reader } from "@/components/studio/Close";

export default function Home() {
  const d = portfolioData as PortfolioData;
  const [sel, setSel] = useState<Project | null>(null);
  const close = useCallback(() => setSel(null), []);
  return (
    <StudioProvider ids={d.projects.map((p) => p.id)}>
      <Welcome />
      <Chrome />
      <main>
        {/* COPA + 3 RAMAS: viaje vertical con pinning (ver components/tree/treeConfig.ts) */}
        <TreeJourney d={d} a={d.author} open={setSel} />
        {/* BASE / RAÍCES (footer): manifiesto, índice completo, CV y árbol del agradecimiento */}
        <Manifest a={d.author} />
        <Index d={d} open={setSel} />
        <CV d={d} open={setSel} />
        <Fin a={d.author} c={d.colophon} />
      </main>
      <Reader p={sel} close={close} />
    </StudioProvider>
  );
}
