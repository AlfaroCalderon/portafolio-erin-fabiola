export interface Author {
  name: string;
  role: string;
  location: string;
  institution: string;
  edition: string;
  title: string;
  subtitle: string;
  quote: {
    text: string;
    author: string;
  };
  bio: string[];
  closingDedication: string;
}

export interface SectionPillar {
  id: string;
  name: string;
  translation: string;
  concept: string;
  discipline: string;
  accentColor: string;
  accentBg: string;
  description: string;
}

export interface Project {
  id: string;
  number: string;
  section: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  featured: boolean;
  summary: string;
  text: string[];
  tags: string[];
  credits: string | null;
  pageStart: number;
  pageEnd: number;
  disciplines: string[];
  stampId?: string;
  primaryCutout?: string;
  secondaryCutouts?: string[];
  images: {
    cover: string;
    gallery: string[];
  };
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ColophonResource {
  name: string;
  url: string;
}

export interface Colophon {
  edition: string;
  university: string;
  designer: string;
  resources: ColophonResource[];
  note: string;
}

export interface DisciplineDefinition {
  id: string;
  name: string;
  count: number;
}

export interface PortfolioData {
  author: Author;
  sections: SectionPillar[];
  projects: Project[];
  disciplines: DisciplineDefinition[];
  skills: SkillCategory[];
  colophon: Colophon;
}
