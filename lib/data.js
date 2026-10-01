export const profile = {
  name: "Dhrumil Kharadi",
  first: "Dhrumil",
  last: "Kharadi",
  role: "DevOps Engineer & Full-Stack Developer",
  location: "Ahmedabad, India",
  email: "dhumil05@gmail.com",
  github: "https://github.com/Dhrumil-Kharadi",
  linkedin: "https://www.linkedin.com/in/dhrumil-kharadi-639620324/",
  resume: "/Dhrumil-Kharadi-Resume.pdf",
  summary:
    "I ship and keep production systems alive. Docker, CI/CD, Nginx, Kafka and Linux on the ops side; React, Next.js, Node, FastAPI and Postgres on the product side; LangChain, RAG and agentic AI when the problem needs a brain.",
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export const stats = [
  { value: "1st", label: "Codeversity AI Hackathon", sub: "IIT Gandhinagar" },
  { value: "Top 7", label: "Smart India Hackathon", sub: "Grand Finale" },
  { value: "04", label: "Live client platforms", sub: "Freelance" },
  { value: "10+", label: "AI agents orchestrated", sub: "LangGraph · RAG" },
];

export const stackRowA = [
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Nginx",
  "Kafka",
  "Linux",
  "Terraform",
  "AWS",
  "GitHub Actions",
  "Load Balancing",
  "CDN",
  "DNS",
];

export const stackRowB = [
  "Next.js",
  "React",
  "Node.js",
  "FastAPI",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "LangChain",
  "LangGraph",
  "RAG",
  "MCP",
  "Agentic AI",
];

export const work = [
  {
    index: "01",
    title: "FarmXpert",
    kind: "Multi-agent AI platform for farmers",
    tags: ["LangGraph", "RAG", "FastAPI", "10+ agents"],
    meta: "1st Place · IIT Gandhinagar",
    href: "https://farmxpert.in",
  },
  {
    index: "02",
    title: "CUDAS",
    kind: "AI interview & career roadmap portal",
    tags: ["LangChain", "RAG", "OCR", "Agents"],
    meta: "Top 7 · SIH Grand Finale",
    href: "https://cudas.vercel.app",
  },
  {
    index: "03",
    title: "NemLUXURA",
    kind: "E-commerce platform",
    tags: ["REST APIs", "Admin panel", "Payments"],
    meta: "Freelance · Live",
    href: "https://luxuramattress.com",
  },
  {
    index: "04",
    title: "Vintage Valley Resort",
    kind: "Hotel booking platform",
    tags: ["Razorpay", "Ezee API", "JWT", "Hostinger"],
    meta: "Freelance · Live",
    href: "https://vintagevalleyresort.com",
  },
  {
    index: "05",
    title: "Waltain Energy",
    kind: "Renewable energy brand website",
    tags: ["Neumorphic UI", "Responsive", "Deploy"],
    meta: "Freelance · Live",
    href: "https://waltainenergy.com",
  },
  {
    index: "06",
    title: "Aaurawell",
    kind: "Wellness e-commerce store",
    tags: ["Storefront", "Cart & orders", "Responsive"],
    meta: "Freelance · Live",
    href: "https://aaurawell.com",
  },
];

// Background music. Drop the track at public/audio/on-and-on.mp3.
// `start`/`end` (seconds) pick the 30-second section that loops forever.
export const music = {
  src: "/audio/on-and-on.mp3",
  start: 0,
  end: 30,
  volume: 0.12, // 0–1, kept very low
  credit: "Cartoon — On & On (feat. Daniel Levi) [NCS Release]",
};
