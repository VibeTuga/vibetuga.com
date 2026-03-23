import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogCategories, blogPosts, users } from "@/lib/db/schema";

const CATEGORIES = [
  {
    name: "Tutoriais",
    slug: "tutoriais",
    color: "#00F0FF",
    icon: "📚",
    sortOrder: 1,
    description: "Guias passo-a-passo para vibe coding e AI tooling",
  },
  {
    name: "AI Tools",
    slug: "ai-tools",
    color: "#A855F7",
    icon: "🤖",
    sortOrder: 2,
    description: "Reviews e dicas sobre ferramentas de IA para programação",
  },
  {
    name: "Projetos",
    slug: "projetos",
    color: "#22C55E",
    icon: "🚀",
    sortOrder: 3,
    description: "Showcases e breakdowns de projetos da comunidade",
  },
  {
    name: "Comunidade",
    slug: "comunidade",
    color: "#F59E0B",
    icon: "👥",
    sortOrder: 4,
    description: "Notícias, eventos e atualizações da comunidade VibeTuga",
  },
  {
    name: "Opinião",
    slug: "opiniao",
    color: "#EF4444",
    icon: "💬",
    sortOrder: 5,
    description: "Hot takes e discussões sobre o futuro do desenvolvimento",
  },
];

const SEED_USERS = [
  {
    discordId: "000000000000000001",
    discordUsername: ".pr00f",
    displayName: ".pr00f",
    name: ".pr00f",
    role: "author" as const,
    bio: "Apaixonado por vibe coding e desenvolvimento com IA. Partilho tudo o que aprendo na comunidade VibeTuga.",
    xpPoints: 500,
    level: 3,
  },
  {
    discordId: "000000000000000002",
    discordUsername: "acewf",
    displayName: "acewf",
    name: "acewf",
    role: "author" as const,
    bio: "Builder e entusiasta de AI agents. Exploro novas formas de programar com assistência de inteligência artificial.",
    xpPoints: 350,
    level: 2,
  },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export async function seedBlog() {
  // 1. Seed categories
  console.log("Seeding categories...");
  await db.insert(blogCategories).values(CATEGORIES).onConflictDoNothing();

  // 2. Seed authors — use existing real users if they already logged in via Discord OAuth,
  //    otherwise create placeholder users (will need merging later via merge-seed-users.ts)
  console.log("Seeding authors...");
  const cats = await db.select().from(blogCategories);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  async function getOrCreateAuthor(seed: (typeof SEED_USERS)[number]) {
    // Try to find existing user by Discord username (real OAuth user)
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.discordUsername, seed.discordUsername))
      .limit(1);
    if (existing) {
      console.log(`  Found existing user "${seed.discordUsername}" (${existing.id})`);
      return existing;
    }
    // Create placeholder user with fake Discord ID
    console.log(`  Creating placeholder user "${seed.discordUsername}"`);
    await db.insert(users).values(seed).onConflictDoNothing();
    const [created] = await db
      .select()
      .from(users)
      .where(eq(users.discordId, seed.discordId))
      .limit(1);
    return created;
  }

  const authorProof = await getOrCreateAuthor(SEED_USERS[0]);
  const authorAcewf = await getOrCreateAuthor(SEED_USERS[1]);

  if (!authorProof || !authorAcewf) {
    throw new Error("Authors not found after insert");
  }

  // 4. Seed blog posts
  console.log("Seeding blog posts...");

  const posts = [
    {
      authorId: authorProof.id,
      categoryId: catMap["tutoriais"],
      title: "Como Começar com Vibe Coding em 2025",
      slug: "como-comecar-vibe-coding-2025",
      coverImage: "https://picsum.photos/seed/como-comecar-vibe-coding-2025/1200/630",
      excerpt:
        "Vibe coding é a nova forma de programar com IA ao teu lado. Neste guia, explico como dar os primeiros passos, quais as ferramentas essenciais e como tirar o máximo partido desta abordagem revolucionária ao desenvolvimento de software.",
      content: `# Como Começar com Vibe Coding em 2025

Vibe coding não é apenas uma tendência — é uma mudança fundamental na forma como desenvolvemos software. Em vez de escrever cada linha de código manualmente, colaboramos com modelos de linguagem para construir funcionalidades mais rápido do que alguma vez imaginámos.

## O Que é Vibe Coding?

O conceito foi popularizado por Andrej Karpathy, que descreveu a prática de "dar ao modelo o vibe" e deixá-lo gerar o código enquanto tu guias a direção. Não se trata de abduzir responsabilidade — trata-se de multiplicar a tua produtividade.

## Ferramentas Essenciais

Para começares, precisas de três componentes principais:

**1. Um editor com integração de IA**
O Cursor é atualmente a escolha mais popular entre os vibe coders. Tem um modo "Composer" que permite descrever funcionalidades inteiras em linguagem natural. O GitHub Copilot é uma alternativa sólida se já usas VS Code.

**2. Um modelo de linguagem poderoso**
Claude da Anthropic destaca-se pela sua capacidade de manter contexto longo e seguir instruções complexas. O GPT-4o da OpenAI também é uma escolha excelente.

**3. Uma mentalidade diferente**
A barreira principal não é técnica — é mental. Tens de aprender a comunicar o que queres de forma clara e iterativa. Pensa como um engenheiro de produto, não apenas como um programador.

## O Teu Primeiro Projeto de Vibe Coding

Recomendo começar com algo pequeno mas concreto: uma API REST simples, um script de automação, ou um componente de UI. A chave é ter um objetivo claro e ir refinando através de conversação com o modelo.

Descreve o que queres construir, o stack tecnológico que preferes, e os comportamentos esperados. O modelo vai gerar uma estrutura inicial que tu podes ajustar, expandir, e corrigir em diálogo contínuo.

## Dicas para Começar

- Começa sempre com o contexto do projeto antes de pedir código
- Sê específico nos requisitos mas deixa margem para o modelo propor soluções
- Revê sempre o código gerado — és tu o responsável pelo que vai para produção
- Mantém as sessões focadas num problema de cada vez

O vibe coding é uma habilidade que se aprende com prática. Quanto mais usares, mais eficaz te tornas a comunicar com os modelos. A VibeTuga está aqui para te acompanhar nessa jornada!`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["vibe-coding", "tutorial", "iniciantes", "ia"],
      readingTimeMinutes: 5,
      publishedAt: daysAgo(13),
      viewsCount: 487,
      likesCount: 42,
    },
    {
      authorId: authorAcewf.id,
      categoryId: catMap["ai-tools"],
      title: "Claude Code vs Cursor: Qual Escolher?",
      slug: "claude-code-vs-cursor-qual-escolher",
      coverImage: "https://picsum.photos/seed/claude-code-vs-cursor-qual-escolher/1200/630",
      excerpt:
        "Dois dos melhores tools de vibe coding frente a frente. Depois de semanas a usar ambos intensivamente, aqui estão as minhas conclusões sobre quando usar cada um e qual se adequa melhor ao teu workflow.",
      content: `# Claude Code vs Cursor: Qual Escolher?

Depois de semanas a trabalhar intensivamente com ambas as ferramentas em projetos reais, tenho uma perspetiva clara sobre os pontos fortes e fracos de cada uma. Vamos ao que interessa.

## Claude Code

O Claude Code é o terminal-first AI coding assistant da Anthropic. Funciona diretamente na linha de comandos e tem acesso ao teu sistema de ficheiros, pode executar comandos, e mantém contexto de toda a codebase.

**Pontos Fortes:**
- Contexto de projeto extremamente amplo — lê ficheiros, vê git history, entende a estrutura completa
- Execução de comandos integrada (testes, builds, migrations)
- Excelente para tarefas que envolvem múltiplos ficheiros em simultâneo
- O modelo Claude 3.5/3.7 é particularmente forte em raciocínio e código complexo

**Pontos Fracos:**
- Sem UI visual — tudo pela linha de comandos
- Curva de aprendizagem para quem não é confortável com terminal
- Menos adequado para edições rápidas e pontuais

## Cursor

O Cursor é um fork do VS Code com IA integrada profundamente na experiência de edição. Sentes-te em casa se já usas VS Code.

**Pontos Fortes:**
- Interface familiar para qualquer desenvolvedor
- Modo "Composer" para descrever funcionalidades inteiras
- Edições inline muito fluidas com Tab completion
- Excelente para frontend e UI — vês as mudanças em tempo real

**Pontos Fracos:**
- Contexto mais limitado que o Claude Code em projetos grandes
- Custa mais por tokens em uso intensivo
- Menos poderoso para automação e tarefas de devops

## A Minha Recomendação

Usa **Claude Code** quando:
- Estás a refatorar código existente em múltiplos ficheiros
- Precisas de rodar migrações de base de dados ou executar scripts
- Trabalhas num projeto backend ou fullstack complexo

Usa **Cursor** quando:
- Estás a construir UI do zero e queres ver mudanças visualmente
- Preferes uma experiência mais próxima do editor tradicional
- Precisas de auto-complete rápido durante edição normal

A resposta honesta? Os melhores vibe coders usam os dois. Claude Code para as tarefas de "arquitetura" e Cursor para as de "polish". Experimenta e encontra o teu ritmo.`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["claude-code", "cursor", "comparação", "ai-tools"],
      readingTimeMinutes: 6,
      publishedAt: daysAgo(11),
      viewsCount: 312,
      likesCount: 28,
    },
    {
      authorId: authorProof.id,
      categoryId: catMap["projetos"],
      title: "Construí uma App Completa em 2 Horas com IA",
      slug: "construi-app-completa-2-horas-com-ia",
      coverImage: "https://picsum.photos/seed/construi-app-completa-2-horas-com-ia/1200/630",
      excerpt:
        "Um breakdown honesto de como usei Claude Code para construir uma aplicação fullstack funcional em tempo recorde. O que correu bem, o que falhou, e o que aprendi sobre os limites do vibe coding.",
      content: `# Construí uma App Completa em 2 Horas com IA

Spoiler: funcionou. Mas não foi magia — foi um processo muito específico que quero partilhar contigo na totalidade.

## O Projeto

Decidi construir uma pequena aplicação de tracking de hábitos com Next.js, uma base de dados Neon, e autenticação com Discord OAuth. Nada revolucionário, mas suficientemente complexo para testar os limites do vibe coding.

## A Abordagem

**Minuto 0-15: Arquitetura**
Comecei por dar ao Claude Code um briefing completo: stack tecnológico, objetivos da app, funcionalidades essenciais, e o estilo visual desejado. Não pedi código ainda — pedi um plano.

O Claude gerou uma estrutura de pastas, lista de componentes necessários, schema de base de dados, e uma sequência de implementação. Revi tudo, fiz ajustes, e só então avancei.

**Minuto 15-60: Foundation**
Schema Drizzle, autenticação NextAuth, layout base, e as primeiras API routes. O Claude tratou de tudo — eu fui verificando cada migration e cada API route antes de confirmar.

**Minuto 60-100: Features Core**
CRUD de hábitos, tracking diário, e o dashboard principal. Aqui tive de intervir mais — o Claude gerou alguns componentes desnecessariamente complexos que simplifiquei.

**Minuto 100-120: Polish e Deploy**
Estilos finais, estados de loading e erro, e deploy no Vercel. O comando "vercel --prod" correu na primeira tentativa.

## O Que Aprendi

**O que o Claude fez bem:**
- Código boilerplate (auth config, Drizzle setup, API routes padrão)
- Resolver erros de TypeScript rapidamente
- Sugerir edge cases que eu não tinha considerado

**Onde tive de intervir:**
- Decisões de UX — o modelo não "sente" o que é bom, só sabe o que parece correto
- Performance — algumas queries N+1 que tive de corrigir manualmente
- Lógica de negócio específica ao domínio

## A Conclusão Honesta

2 horas é real, mas requer experiência. Precisas de saber o suficiente para reconhecer quando o output é bom e quando está a divergir. O vibe coding não substitui o conhecimento técnico — amplifica-o.`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["projetos", "nextjs", "fullstack", "case-study"],
      readingTimeMinutes: 7,
      publishedAt: daysAgo(9),
      viewsCount: 445,
      likesCount: 38,
    },
    {
      authorId: authorAcewf.id,
      categoryId: catMap["opiniao"],
      title: "O Futuro do Desenvolvimento é Conversacional",
      slug: "futuro-desenvolvimento-conversacional",
      coverImage: "https://picsum.photos/seed/futuro-desenvolvimento-conversacional/1200/630",
      excerpt:
        "Hot take: daqui a 5 anos, a maioria do código vai ser gerado através de conversação com modelos de IA. Não como substituição dos programadores, mas como uma forma radicalmente diferente de trabalhar. Aqui está porque acredito nisso.",
      content: `# O Futuro do Desenvolvimento é Conversacional

Vou ser direto: acho que a maioria das pessoas ainda não compreendeu o que está a acontecer no desenvolvimento de software. Não estamos a falar de auto-complete melhorado. Estamos a assistir a uma mudança de paradigma.

## O Que Está a Mudar

Durante décadas, programar significou traduzir intenção humana para sintaxe de máquina. Aprendíamos linguagens, frameworks, e APIs — não porque queríamos, mas porque era o único caminho entre "o que queremos construir" e "a máquina que executa".

Essa camada de tradução está a desaparecer.

Não completamente, não de imediato, e não sem nuance — mas a trajetória é clara. Os modelos de linguagem tornaram-se suficientemente bons para bridging entre intenção e implementação que o processo está a mudar fundamentalmente.

## O Desenvolvedor Conversacional

O desenvolvedor do futuro próximo vai passar menos tempo a escrever código linha a linha e mais tempo a:

- Definir requisitos e constrains com precisão
- Rever, validar, e iterar sobre código gerado
- Construir sistemas e arquiteturas de alto nível
- Gerir o "vibe" — a direção, os trade-offs, a qualidade

Isto não é menos trabalho. É diferente trabalho. E, na minha opinião, é trabalho mais interessante para a maioria das pessoas.

## Os Céticos Têm Um Ponto

Há críticas legítimas ao vibe coding que não devemos ignorar:

**O código gerado por IA pode ter bugs subtis.** Verdade. A revisão cuidadosa continua a ser essencial. Um modelo não sente quando algo "cheira mal" da mesma forma que um desenvolvedor experiente.

**Dependência excessiva pode erodir habilidades.** Também verdade. Se nunca entendes o código que o modelo gera, tornas-te frágil. O objetivo é usar a IA para te elevar, não para te substituir.

**Segurança é uma preocupação real.** Código gerado por modelos pode incluir vulnerabilidades conhecidas. Precisamos de melhores ferramentas de review automático.

## A Minha Aposta

Nos próximos 5 anos, a competência mais valiosa em desenvolvimento de software não vai ser "sabes escrever TypeScript" — vai ser "sabes conversar com modelos de IA de forma eficaz para construir sistemas robustos".

A VibeTuga existe precisamente para ajudar a comunidade portuguesa a desenvolver essa competência. Estamos cedo. É a altura certa para aprender.`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["opinião", "futuro", "ia", "programação"],
      readingTimeMinutes: 6,
      publishedAt: daysAgo(8),
      viewsCount: 278,
      likesCount: 31,
    },
    {
      authorId: authorProof.id,
      categoryId: catMap["ai-tools"],
      title: "Top 5 Agents que Estou a Usar Diariamente",
      slug: "top-5-agents-uso-diario",
      coverImage: "https://picsum.photos/seed/top-5-agents-uso-diario/1200/630",
      excerpt:
        "Deixei de usar apenas chatbots e passei a orquestrar agents especializados para tarefas específicas. Aqui estão os 5 agents que entraram permanentemente no meu workflow e porque é que cada um deles vale o investimento de tempo de configuração.",
      content: `# Top 5 Agents que Estou a Usar Diariamente

A diferença entre um chatbot e um agent é a capacidade de agir: executar código, chamar APIs, ler ficheiros, e persistir trabalho entre sessões. Depois de experimentar dezenas de configurações, aqui estão os que ficaram.

## 1. Claude Code (Anthropic)

Já falei sobre ele antes, mas merece o primeiro lugar. A capacidade de ter um agent com acesso completo ao meu sistema de ficheiros, que pode executar comandos e manter contexto de projeto durante horas, é transformadora.

**Uso diário:** Refactoring de código, geração de migrações de base de dados, debugging de problemas complexos.

## 2. Cursor Composer Mode

O Cursor em modo Composer comporta-se como um agent — podes descrever uma funcionalidade e ele implementa em múltiplos ficheiros simultaneamente, com previews visuais.

**Uso diário:** Construção de UI components, implementação de features de frontend.

## 3. Perplexity Pro

Para research técnico, o Perplexity é imbatível. Agrega informação atualizada, cita fontes, e mantém conversação contextual. Muito superior ao ChatGPT para encontrar informação recente sobre bibliotecas e APIs.

**Uso diário:** Documentação de libraries, comparação de abordagens, troubleshooting de erros obscuros.

## 4. Zapier AI Actions + Claude

Criei um workflow onde o Claude pode interagir com ferramentas externas via Zapier: criar tarefas no Linear, enviar mensagens no Slack, atualizar folhas de cálculo. É o meu "second brain" operacional.

**Uso diário:** Gestão de tarefas, comunicação de status, registo de decisões.

## 5. v0.dev (Vercel)

Para prototipar UI rapidamente, o v0 é extraordinário. Descreves um componente em linguagem natural, ele gera código React/Tailwind de alta qualidade que podes copiar diretamente para o teu projeto.

**Uso diário:** Prototipagem de novos componentes, inspiração visual, iteração rápida de design.

## O Stack Completo

Cada agent tem o seu nicho. A chave é saber quando usar cada um, não tentar fazer tudo com o mesmo. O Claude Code para trabalho profundo, Cursor para edição iterativa, Perplexity para research, Zapier para automação, v0 para UI.

Qual é o teu stack de agents preferido? Partilha na comunidade!`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["agents", "workflow", "produtividade", "ai-tools"],
      readingTimeMinutes: 5,
      publishedAt: daysAgo(6),
      viewsCount: 389,
      likesCount: 45,
    },
    {
      authorId: authorAcewf.id,
      categoryId: catMap["comunidade"],
      title: "VibeTuga: O Que Vem a Seguir para a Comunidade",
      slug: "vibetuga-o-que-vem-a-seguir",
      coverImage: "https://picsum.photos/seed/vibetuga-o-que-vem-a-seguir/1200/630",
      excerpt:
        "A comunidade VibeTuga está a crescer mais rápido do que esperávamos. É hora de partilhar o roadmap, os planos para os próximos meses, e como podes contribuir para construir a maior comunidade de vibe coding em língua portuguesa.",
      content: `# VibeTuga: O Que Vem a Seguir para a Comunidade

Começámos há pouco tempo e já somos uma comunidade vibrante de developers, criadores, e entusiastas de IA. É hora de ser transparente sobre o que estamos a construir e para onde vamos.

## Onde Estamos Hoje

O nosso Discord está cheio de energia — conversas diárias sobre novas ferramentas, partilha de projetos, e uma competição saudável no leaderboard. O Twitch e YouTube começam a ganhar tração com os nossos streams de live coding.

A plataforma vibetuga.com está a tomar forma: blog, showcase de projetos, sistema de gamificação, e newsletter. Estamos a construir a infraestrutura para uma comunidade sustentável.

## O Que Vem a Seguir

**Nos Próximos Meses:**

🎯 **Hackathons Mensais** — Competições de vibe coding com temas específicos. O primeiro vai ser em torno de construir agents úteis com Claude. Prémios, badges exclusivos, e reconhecimento da comunidade.

📚 **VibeTuga Learn** — Uma biblioteca de tutoriais criados pela comunidade, curados e categorizados. Qualquer membro pode contribuir; os melhores são destacados na homepage.

🤝 **Colabs de Projeto** — Um sistema de matchmaking para developers que querem colaborar em projetos open source. Encontra o teu co-founder de projeto aqui.

🎙️ **Podcast** — Conversas longas com builders portugueses sobre os seus projetos, o seu processo, e a sua visão para o futuro do desenvolvimento com IA.

## Como Podes Contribuir

A VibeTuga é construída pela comunidade para a comunidade. Há várias formas de participar:

- **Escreve um artigo** — Partilha o que aprendes. O blog está aberto a contribuições da comunidade.
- **Submete o teu projeto** — O showcase é para mostrar o que estás a construir.
- **Ajuda no Discord** — Responder às dúvidas dos outros é a forma mais poderosa de aprender.
- **Faz stream** — Se fazes live coding, vem ao nosso Twitch. Adoramos ver diferentes workflows.

## Um Agradecimento

A qualidade desta comunidade vem de vocês. Obrigado por trazerem energia, curiosidade, e generosidade. Estamos só a começar.`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["comunidade", "vibetuga", "roadmap", "novidades"],
      readingTimeMinutes: 5,
      publishedAt: daysAgo(4),
      viewsCount: 203,
      likesCount: 19,
    },
    {
      authorId: authorProof.id,
      categoryId: catMap["tutoriais"],
      title: "Dicas para Prompts Mais Eficazes no Claude",
      slug: "dicas-prompts-eficazes-claude",
      coverImage: "https://picsum.photos/seed/dicas-prompts-eficazes-claude/1200/630",
      excerpt:
        "Depois de centenas de horas a trabalhar com Claude, aprendi o que separa um prompt medíocre de um que gera exatamente o que precisas. Aqui estão as técnicas concretas que melhoraram drasticamente a qualidade dos meus outputs.",
      content: `# Dicas para Prompts Mais Eficazes no Claude

Escrever bons prompts é uma habilidade. Como toda a habilidade, melhora com prática e com feedback deliberado. Aqui estão os padrões que funcionam consistentemente para mim.

## 1. Dá Contexto Antes de Dar a Tarefa

O erro mais comum é ir direto ao pedido sem estabelecer contexto. O Claude é muito melhor quando entende o enquadramento.

❌ "Escreve uma função para validar emails"

✅ "Estou a construir um formulário de registo em Next.js com TypeScript. Precisas de uma função utilitária para validar emails que: use regex, retorne um boolean, e inclua um teste unitário básico."

## 2. Especifica o Output Format

O Claude vai adivinhar o formato se não especificares. Muitas vezes adivinha bem, mas às vezes não. Sê explícito.

"Responde em português. Formato: lista numerada. Máximo 5 itens. Sem explicação introdutória."

## 3. Usa o Padrão "Role + Tarefa + Constrains"

"Actua como um senior TypeScript developer a fazer code review. Analisa o seguinte código e identifica: (1) bugs potenciais, (2) problemas de performance, (3) violações de boas práticas. Sê directo e conciso."

## 4. Itera em Vez de Reformular

Quando o output não é perfeito, não apagues e recomeça. Itera sobre o que foi gerado.

"Bom, mas a função de validação está a rejeitar emails com '+' no username. Corrige isso e mantém o resto igual."

Esta abordagem é mais eficiente e mantém o contexto acumulado.

## 5. Pede Ao Claude Para Pensar Antes de Responder

Para problemas complexos, o "think step by step" não é cliché — funciona.

"Antes de escrever código, explica em prosa como vais abordar este problema. Depois implementa."

Isto força o modelo a resolver a lógica antes de a codificar, reduzindo bugs.

## 6. Fornece Exemplos do Output Desejado

"O output deve ser semelhante a este exemplo: [exemplo]. Adapta para o meu caso de uso: [descrição]."

## 7. Sê Honesto Sobre as Tuas Constrains

"Estou a usar Next.js 15 com App Router. A solução DEVE ser Server Component — sem 'use client'."

O Claude não sabe o teu contexto a menos que lho digas. Quanto mais específico for sobre o que NÃO podes fazer, melhor.

## A Meta-Dica

A melhor forma de melhorar os teus prompts é rever os outputs e perguntar: "O que é que o modelo não sabia que eu sabia?" Essa informação que faltava é o que deves adicionar ao próximo prompt.`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["prompts", "claude", "tutorial", "dicas"],
      readingTimeMinutes: 6,
      publishedAt: daysAgo(2),
      viewsCount: 156,
      likesCount: 22,
    },
    {
      authorId: authorAcewf.id,
      categoryId: catMap["comunidade"],
      title: "A Minha Experiência no Primeiro Hackathon AI",
      slug: "experiencia-primeiro-hackathon-ai",
      coverImage: "https://picsum.photos/seed/experiencia-primeiro-hackathon-ai/1200/630",
      excerpt:
        "48 horas, uma equipa de 3 pessoas, e um projeto construído quase inteiramente com vibe coding. Aqui está o relato honesto da minha primeira experiência num hackathon focado em IA — o que correu bem, o que foi caótico, e o que faria diferente.",
      content: `# A Minha Experiência no Primeiro Hackathon AI

48 horas. Passámos de uma ideia vaga para um produto funcional usando vibe coding quase exclusivamente. Foi caótico, intenso, e absolutamente revelador sobre onde estamos com o desenvolvimento assistido por IA.

## A Ideia e a Equipa

Eramos 3: eu (backend e arquitetura), a Rita (design e frontend), e o Tomás (produto e demo). A nossa ideia: um agent que monitoriza repositórios GitHub de projetos open source e gera relatórios semanais sobre saúde do projeto — bugs recentes, PR velocity, contributor activity.

Nada revolucionário, mas suficientemente concreto para construir em 48 horas.

## As Primeiras 12 Horas: Setup e Arquitetura

Usámos Claude Code para scaffolding — Next.js + Python FastAPI backend + PostgreSQL. Em 3 horas tínhamos a estrutura base. O que normalmente levaria um dia inteiro.

A Rita usou v0.dev para os primeiros componentes de dashboard. Em paralelo, eu estava a implementar a integração com a GitHub API com o Cursor.

**O que funcionou:** A paralelização. Com AI a acelerar cada pessoa individualmente, conseguimos avançar em três frentes simultaneamente sem conflitos.

## As Horas 12-36: Implementação Core

Aqui as coisas ficaram interessantes. O agent de análise precisava de lógica bastante complexa — scoring de saúde de projetos baseado em múltiplos sinais.

Descrevi o algoritmo ao Claude em linguagem natural, ele implementou uma primeira versão, e fizemos 4-5 iterações até estar correto. O processo inteiro levou cerca de 2 horas. Estimativa minha sem IA: um dia inteiro.

**O que falhou:** Tivemos um bug de timezone que o modelo não apanhou e que só descobrimos nas horas finais. Custo-nos 2 horas a debugar.

## As Últimas 12 Horas: Polish e Demo

Dormir foi opcional (escolhemos "não"). O Claude ajudou com os loading states, error handling, e responsive design. A Rita refineu o design system com Cursor.

Para a demo, pedi ao Claude para gerar dados de exemplo realistas para 5 repositórios conhecidos. Em 10 minutos tínhamos dados convincentes para apresentar.

## O Resultado

Não ganhámos, mas ficámos em 3º lugar e ganhámos o prémio de "Most Impressive Technical Execution". O júri ficou surpreendido com a qualidade do código para 48 horas.

## O Que Faria Diferente

- **Mais testes desde o início** — O bug de timezone teria sido apanhado com testes básicos
- **Um ficheiro de contexto partilhado** — Todos usávamos IA individualmente, mas sem contexto partilhado do projeto. Criar um CLAUDE.md logo no início teria ajudado
- **Menos features, mais polish** — Tentámos fazer demasiado. 3 features bem feitas > 8 features mediocres

## A Conclusão

Hackathons com vibe coding são uma experiência completamente diferente. A barreira de implementação baixa tanto que o bottleneck passa a ser clareza de visão e comunicação dentro da equipa. As habilidades que mais importam já não são as mesmas de há 3 anos.`,
      status: "published" as const,
      postType: "admin" as const,
      tags: ["hackathon", "experiência", "comunidade", "vibe-coding"],
      readingTimeMinutes: 7,
      publishedAt: daysAgo(1),
      viewsCount: 89,
      likesCount: 14,
    },
  ];

  // Note: onConflictDoNothing means re-running the seed will NOT update existing posts
  // (e.g. newly added coverImage won't be applied to existing rows). To update existing
  // posts, delete them first or run a manual UPDATE query.
  await db.insert(blogPosts).values(posts).onConflictDoNothing();

  console.log(`Done! Seeded ${CATEGORIES.length} categories, 2 authors, ${posts.length} posts.`);
}

// Run directly: npx tsx src/lib/db/seed-blog.ts
if (require.main === module) {
  seedBlog()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
