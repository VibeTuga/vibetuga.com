import { db } from "@/lib/db";
import { communityEvents, challenges } from "@/lib/db/schema";

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const EVENTS = [
  // Past events (3)
  {
    title: "Live Coding: Construindo um Agente AI com Claude",
    description:
      "Stream ao vivo no Twitch onde construímos um agente de automação completo usando Claude Code. Do zero ao deploy em 2 horas!",
    eventType: "stream" as const,
    startAt: daysAgo(21),
    endAt: daysAgo(21),
    link: "https://twitch.tv/vibetuga",
  },
  {
    title: "Workshop: Introdução ao Vibe Coding",
    description:
      "Workshop prático para iniciantes — aprende os fundamentos do vibe coding e como usar ferramentas de IA para programar mais rápido.",
    eventType: "workshop" as const,
    startAt: daysAgo(14),
    endAt: daysAgo(14),
    link: "https://discord.gg/vibetuga",
  },
  {
    title: "Meetup VibeTuga Lisboa",
    description:
      "Primeiro encontro presencial da comunidade VibeTuga em Lisboa. Networking, demos de projetos e muita conversa sobre o futuro do desenvolvimento com IA.",
    eventType: "meetup" as const,
    startAt: daysAgo(7),
    endAt: daysAgo(7),
    link: "https://discord.gg/vibetuga",
  },
  // Upcoming events (5)
  {
    title: "Live Coding: Criando uma App Fullstack com Next.js e IA",
    description:
      "Stream especial onde vamos construir uma aplicação completa com Next.js 16, Drizzle ORM e Claude Code. Vem ver o processo ao vivo!",
    eventType: "stream" as const,
    startAt: daysFromNow(3),
    endAt: daysFromNow(3),
    link: "https://twitch.tv/vibetuga",
  },
  {
    title: "Workshop: Domina o Claude Code em 90 Minutos",
    description:
      "Sessão hands-on onde vais aprender truques avançados de Claude Code — desde CLAUDE.md até multi-agent workflows.",
    eventType: "workshop" as const,
    startAt: daysFromNow(10),
    endAt: daysFromNow(10),
    link: "https://discord.gg/vibetuga",
  },
  {
    title: "Desafio Relâmpago: Melhor Landing Page em 1h",
    description:
      "Competição ao vivo — tens 1 hora para criar a melhor landing page usando vibe coding. Votos da comunidade decidem o vencedor!",
    eventType: "challenge" as const,
    startAt: daysFromNow(17),
    endAt: daysFromNow(17),
    link: "https://discord.gg/vibetuga",
  },
  {
    title: "Meetup VibeTuga Porto",
    description:
      "A comunidade VibeTuga chega ao Porto! Um encontro informal com demos, lightning talks e networking entre vibe coders.",
    eventType: "meetup" as const,
    startAt: daysFromNow(24),
    endAt: daysFromNow(24),
    link: "https://discord.gg/vibetuga",
  },
  {
    title: "AMA: Perguntas e Respostas sobre AI Agents",
    description:
      "Sessão aberta de perguntas e respostas sobre agentes de IA, automação e o futuro do desenvolvimento assistido. Traz as tuas dúvidas!",
    eventType: "other" as const,
    startAt: daysFromNow(31),
    endAt: daysFromNow(31),
    link: "https://discord.gg/vibetuga",
  },
];

const CHALLENGES = [
  // Active (startAt past, endAt future)
  {
    title: "Desafio 48h: Cria o teu Agente AI",
    description:
      "Tens 48 horas para construir um agente de IA funcional usando qualquer ferramenta. O agente deve resolver um problema real — automação, análise de dados, assistência pessoal, ou algo completamente novo. Criatividade conta!",
    startAt: daysAgo(5),
    endAt: daysFromNow(9),
    xpReward: 200,
    status: "active" as const,
  },
  // Voting (both dates past)
  {
    title: "Vibe Coding Challenge: Landing Page em 2h",
    description:
      "Desafio encerrado! Os participantes tiveram 2 horas para criar a melhor landing page usando apenas vibe coding. Agora é hora de votar no teu favorito. As submissões estão abertas para votação da comunidade.",
    startAt: daysAgo(20),
    endAt: daysAgo(6),
    xpReward: 150,
    status: "voting" as const,
  },
  // Completed (2)
  {
    title: "Hack Week: Melhor Projeto Open Source",
    description:
      "Uma semana inteira dedicada a contribuir para projetos open source usando vibe coding. Os participantes escolheram um repo, fizeram PRs significativos, e a comunidade votou nos melhores contribuidores. Parabéns aos vencedores!",
    startAt: daysAgo(45),
    endAt: daysAgo(38),
    xpReward: 200,
    status: "completed" as const,
  },
  {
    title: "Desafio Prompt Engineering: O Prompt Perfeito",
    description:
      "Quem consegue escrever o melhor system prompt para uma tarefa específica? Os participantes competiram para criar prompts que geram o output mais preciso e útil. Avaliação cega pela comunidade.",
    startAt: daysAgo(60),
    endAt: daysAgo(53),
    xpReward: 100,
    status: "completed" as const,
  },
  // Draft
  {
    title: "Battle Royale: Frontend vs Backend com IA",
    description:
      "Em breve! Duas equipas, um objetivo: construir a melhor feature usando vibe coding. Uma equipa foca-se no frontend, outra no backend. No final, juntam tudo e a comunidade decide quem brilhou mais.",
    startAt: daysFromNow(30),
    endAt: daysFromNow(37),
    xpReward: 150,
    status: "draft" as const,
  },
];

async function seedEventsChallenges() {
  try {
    console.log("Seeding community events...");
    await db.insert(communityEvents).values(EVENTS).onConflictDoNothing();
    console.log(`  Inserted ${EVENTS.length} community events.`);

    console.log("Seeding challenges...");
    await db.insert(challenges).values(CHALLENGES).onConflictDoNothing();
    console.log(`  Inserted ${CHALLENGES.length} challenges.`);

    console.log("Done! Seed completed successfully.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seedEventsChallenges().then(() => process.exit(0));
