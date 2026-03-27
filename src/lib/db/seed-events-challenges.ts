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
  // Active
  {
    title: "CLI Tool Sprint: A Melhor Ferramenta em 24h",
    description:
      "Tens 24 horas para construir a melhor ferramenta de linha de comandos usando IA. Pode ser um CLI para produtividade, DevOps, análise de dados — o que quiseres. Originalidade e utilidade prática são os critérios de avaliação!",
    startAt: daysAgo(2),
    endAt: daysFromNow(5),
    xpReward: 150,
    status: "active" as const,
  },
  {
    title: "Bot Builder Battle: Cria o Teu Bot",
    description:
      "Constrói um bot para Discord ou Telegram usando vibe coding. O bot deve ser útil para a comunidade — moderação, jogos, notificações, ou algo totalmente inovador. Bots funcionais ganham XP extra!",
    startAt: daysAgo(3),
    endAt: daysFromNow(11),
    xpReward: 175,
    status: "active" as const,
  },
  // Voting
  {
    title: "Documentation Dash: Docs com Superpoderes",
    description:
      "O desafio de documentação terminou! Os participantes usaram ferramentas de IA para contribuir documentação de qualidade para projetos open source. Agora é a tua vez de votar na melhor contribuição.",
    startAt: daysAgo(15),
    endAt: daysAgo(3),
    xpReward: 100,
    status: "voting" as const,
  },
  // Completed
  {
    title: "API Speedrun: REST API em 4 Horas",
    description:
      "Desafio relâmpago concluído! Os participantes tiveram apenas 4 horas para construir uma REST API completa com autenticação, CRUD e documentação. Velocidade e qualidade de código foram os critérios decisivos. Parabéns aos finalistas!",
    startAt: daysAgo(35),
    endAt: daysAgo(30),
    xpReward: 100,
    status: "completed" as const,
  },
  {
    title: "AI Art Meets Code: Arte Generativa",
    description:
      "Criatividade sem limites! Os participantes combinaram código e IA para criar arte generativa — shaders, SVGs dinâmicos, visualizações de dados artísticas. Um desafio que provou que programar também é uma forma de arte.",
    startAt: daysAgo(75),
    endAt: daysAgo(70),
    xpReward: 125,
    status: "completed" as const,
  },
  // Draft (future)
  {
    title: "Design System Challenge: Componentes de Raiz",
    description:
      "Em breve! Cria uma biblioteca de componentes reutilizáveis do zero usando vibe coding. Acessibilidade, consistência visual e documentação serão avaliadas. Prepara o teu Figma e o teu editor!",
    startAt: daysFromNow(45),
    endAt: daysFromNow(52),
    xpReward: 200,
    status: "draft" as const,
  },
  {
    title: "Mobile First Challenge: PWA em 72 Horas",
    description:
      "Brevemente! Constrói uma Progressive Web App responsiva e funcional em apenas 72 horas. A app deve funcionar offline, ter boa performance mobile e resolver um problema real. Ferramentas de IA são obrigatórias!",
    startAt: daysFromNow(60),
    endAt: daysFromNow(63),
    xpReward: 200,
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
