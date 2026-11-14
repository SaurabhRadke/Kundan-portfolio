export const site = {
  name: "Kundan Mourya",
  initials: "KM",
  role: "Machine Learning Engineer",
  company: "Caterpillar",
  email: "kundanmourya111@gmail.com",
  location: "India",
  tz: "Asia/Kolkata",
  tagline:
    "ML engineer building vision models you can interpret, retrieval systems you can trust, and agents that ship.",
};

export const stats = [
  { value: 0.82, decimals: 2, label: "F1 my semantic-attention model reached on CNN interpretability" },
  { value: 8.46, decimals: 2, label: "GPA — MTech in Data Science, IIT Palakkad" },
  { value: 3, decimals: 0, label: "Vision benchmarks I've trained on — AwA2, CIFAR-10, CUB-200" },
  { value: 5, decimals: 0, label: "ML, vision & LLM systems I've built end-to-end" },
];

export type Role = {
  company: string;
  title: string;
  period: string;
  where: string;
  current?: boolean;
  points: string[];
};

export const experience: Role[] = [
  {
    company: "Caterpillar",
    title: "Software Engineer",
    period: "Aug 2026 — Present",
    where: "Full-time",
    current: true,
    points: [
      "Engineering software and data-driven ML solutions for industrial products.",
      "Converted from the summer internship into a full-time role.",
    ],
  },
  {
    company: "Caterpillar",
    title: "Software Engineer Intern",
    period: "Jun 2026 — Aug 2026",
    where: "Internship",
    points: ["Built and shipped ML-backed engineering tooling ahead of the full-time offer."],
  },
  {
    company: "IDFC FIRST Bank · Retail Analytics",
    title: "Data Analyst — Consultant",
    period: "Nov 2023 — Jul 2024",
    where: "Square One Data Insights · Mumbai BKC",
    points: [
      "Automated daily refresh of three Business Banking dashboards — Product Holding, BBG Portfolio, NPA.",
      "Replaced manual data prep with an automated extraction + transformation pipeline.",
      "Built new dashboards and served business SQL requests.",
    ],
  },
  {
    company: "ERP Launchpad",
    title: "Data Analyst Intern",
    period: "Jun 2023 — Oct 2023",
    where: "Remote",
    points: ["Delivered ERP solutions for clients in India, the USA and Denmark from business requirements."],
  },
];

export const education = [
  { school: "Indian Institute of Technology, Palakkad", degree: "MTech, Data Science", period: "2024 — 2026", score: "GPA 8.46" },
  { school: "Shri Ramdeobaba College of Engg. & Mgmt., Nagpur", degree: "BE, Civil Engineering", period: "2017 — 2021", score: "GPA 8.48" },
];

export type Project = {
  id: string;
  title: string;
  kind: string;
  problem: string;
  points: string[];
  metric?: { value: string; label: string };
  stack: string[];
};

export const featured: Project = {
  id: "semantic-attention",
  title: "Interpreting CNNs with Semantic Attention",
  kind: "Research · under Dr. Sahely Bhadra",
  problem: "What does a CNN actually look at — in words a human understands?",
  points: [
    "Vision–language framework aligning CNN features with human-readable semantic attributes.",
    "Cross-attention + multi-layer attention on ResNet backbones.",
    "Gradient-based filter analysis & attribute-frequency studies exposed dataset imbalance as the key limit.",
  ],
  metric: { value: "0.82", label: "F1 on high-frequency attributes" },
  stack: ["PyTorch", "ResNet", "Cross-Attention", "AwA2", "CIFAR-10", "CUB-200"],
};

export const projects: Project[] = [
  {
    id: "segmentation",
    title: "Customer Segmentation",
    kind: "Unsupervised ML",
    problem: "A retail client had no clear customer groups for targeted marketing.",
    points: [
      "Compared K-Means, Agglomerative and DBSCAN on engineered features.",
      "Logistic Regression to assign new customers; frontend + Docker.",
    ],
    metric: { value: "1-click", label: "segment any customer" },
    stack: ["scikit-learn", "K-Means", "DBSCAN", "Docker"],
  },
  {
    id: "hiring",
    title: "Hiring Automation Platform",
    kind: "LLM · Agentic",
    problem: "Recruitment from JD to offer letter was manual and slow.",
    points: [
      "LangGraph + Pydantic workflows for structured, auditable decisions.",
      "FastAPI, Streamlit, LinkedIn API, Supabase and email automation; Docker on AWS.",
    ],
    metric: { value: "JD → Offer", label: "fully automated" },
    stack: ["LangGraph", "Pydantic", "FastAPI", "Supabase", "AWS"],
  },
  {
    id: "meme",
    title: "Meme Surveillance",
    kind: "Multimodal Deep Learning",
    problem: "Hateful memes hide meaning across both image and text.",
    points: [
      "CLIP encoders with cross-modal attention and multi-stage feature fusion.",
    ],
    metric: { value: "+0.7%", label: "AUROC improvement" },
    stack: ["CLIP", "Transformers", "Cross-modal Attention"],
  },
  {
    id: "rag",
    title: "Private RAG Chatbot",
    kind: "LLM · On-prem",
    problem: "Organisations needed PDF insight retrieval with zero data leaving the building.",
    points: [
      "DeepSeek-R1 + LangChain, SQLite embeddings, Streamlit UI — fully offline.",
    ],
    metric: { value: "100%", label: "local, private search" },
    stack: ["DeepSeek-R1", "LangChain", "SQLite", "Streamlit"],
  },
];

export const toolkit = [
  { group: "Modelling", items: ["Python", "PyTorch", "scikit-learn", "CNNs", "Transformers", "CLIP"] },
  { group: "LLM & Agents", items: ["LangChain", "LangGraph", "RAG", "Agentic AI", "Pydantic", "DeepSeek"] },
  { group: "Data", items: ["Pandas", "SQL", "MySQL", "PostgreSQL", "Excel"] },
  { group: "Ship & See", items: ["Docker", "AWS", "FastAPI", "Streamlit", "Git", "Tableau", "Power BI", "Looker Studio"] },
];
