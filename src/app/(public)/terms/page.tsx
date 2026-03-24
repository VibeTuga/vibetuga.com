import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço | VibeTuga",
  description:
    "Termos de serviço da VibeTuga. Regras de utilização da plataforma, marketplace e conteúdo.",
  alternates: {
    canonical: "https://vibetuga.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-24">
      {/* Status indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        <span className="font-label text-[10px] tracking-widest text-secondary uppercase">
          Terms_Protocol
        </span>
      </div>

      <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
        Termos de{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
          Serviço
        </span>
      </h1>

      <p className="text-on-surface-variant text-sm mb-12">
        Última atualização: 24 de março de 2026
      </p>

      <div className="space-y-12 text-on-surface-variant leading-relaxed">
        {/* 1. Aceitação */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao aceder e utilizar a plataforma VibeTuga (&quot;plataforma&quot;), aceitas ficar
            vinculado a estes Termos de Serviço. Se não concordares com algum destes termos, não
            deves utilizar a plataforma. A utilização continuada após alterações aos termos
            constitui aceitação dos termos revistos.
          </p>
        </section>

        {/* 2. Descrição */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            2. Descrição do Serviço
          </h2>
          <p>
            A VibeTuga é uma comunidade portuguesa de vibe coding que oferece: blog com artigos e
            tutoriais, galeria de projetos (showcase), sistema de gamificação com XP e badges,
            marketplace de produtos digitais, newsletter e ferramentas de colaboração comunitária.
          </p>
        </section>

        {/* 3. Conta */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            3. Conta de Utilizador
          </h2>
          <p className="mb-3">Ao criar uma conta através do Discord OAuth:</p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>Deves ter pelo menos 16 anos de idade.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>És responsável por manter a segurança da tua conta Discord associada.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>Não podes criar múltiplas contas ou partilhar credenciais de acesso.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Reservamo-nos o direito de suspender ou eliminar contas que violem estes termos.
              </span>
            </li>
          </ul>
        </section>

        {/* 4. Uso Aceitável */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">4. Uso Aceitável</h2>
          <p className="mb-3">Ao utilizar a plataforma, comprometes-te a não:</p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                Publicar conteúdo ilegal, difamatório, discriminatório, ou que viole direitos de
                terceiros.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                Utilizar a plataforma para spam, phishing, distribuição de malware ou qualquer
                atividade maliciosa.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Tentar aceder a contas, dados ou sistemas sem autorização.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                Fazer scraping automatizado, ataques de força bruta ou sobrecarregar a
                infraestrutura.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                Manipular o sistema de gamificação (XP, badges, leaderboard) de forma fraudulenta.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Assediar, intimidar ou perseguir outros membros da comunidade.</span>
            </li>
          </ul>
        </section>

        {/* 5. Conteúdo */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            5. Conteúdo e Propriedade Intelectual
          </h2>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            5.1. O Teu Conteúdo
          </h3>
          <p>
            Manténs a propriedade intelectual de todo o conteúdo que publicas na plataforma
            (artigos, projetos, comentários, produtos). Ao publicar, concedes à VibeTuga uma licença
            não exclusiva, mundial e revogável para exibir, distribuir e promover o teu conteúdo
            dentro da plataforma.
          </p>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            5.2. Conteúdo da Plataforma
          </h3>
          <p>
            O design, código-fonte, marca e conteúdo editorial da VibeTuga são propriedade da equipa
            VibeTuga e estão protegidos por direitos de autor. Não é permitida a reprodução sem
            autorização expressa.
          </p>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            5.3. Moderação de Conteúdo
          </h3>
          <p>
            Reservamo-nos o direito de remover ou editar qualquer conteúdo que viole estes termos,
            sem aviso prévio. Publicações na comunidade podem estar sujeitas a aprovação por
            moderadores antes de serem visíveis publicamente.
          </p>
        </section>

        {/* 6. Marketplace */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            6. Regras do Marketplace
          </h2>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            6.1. Vendedores
          </h3>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Deves ter o papel de &quot;seller&quot; aprovado para listar produtos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                Apenas podes vender produtos digitais dos quais detenhas os direitos de
                distribuição.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Deves fornecer descrições precisas e honestas dos produtos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>És responsável pelo suporte pós-venda e atualizações dos teus produtos.</span>
            </li>
          </ul>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            6.2. Compradores
          </h3>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Produtos digitais são licenciados para uso pessoal, salvo indicação contrária do
                vendedor.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Podes solicitar reembolso no prazo de 14 dias após a compra, sujeito a análise.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>Não é permitida a redistribuição ou revenda de produtos adquiridos.</span>
            </li>
          </ul>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            6.3. Pagamentos e Comissões
          </h3>
          <p>
            Todos os pagamentos são processados através do Stripe. A VibeTuga pode reter uma
            comissão sobre cada venda, conforme comunicado aos vendedores durante o processo de
            registo. Os valores e condições de comissão podem ser alterados com aviso prévio de 30
            dias.
          </p>
        </section>

        {/* 7. Terminação */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            7. Terminação de Conta
          </h2>
          <p className="mb-3">A tua conta pode ser suspensa ou terminada nos seguintes casos:</p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Violação repetida dos termos de uso aceitável.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Atividade fraudulenta no marketplace ou sistema de gamificação.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Múltiplas denúncias confirmadas por outros utilizadores.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Decisão administrativa para proteção da comunidade.</span>
            </li>
          </ul>
          <p className="mt-3">
            Podes eliminar a tua conta voluntariamente a qualquer momento em{" "}
            <span className="text-tertiary font-mono">/dashboard/settings</span>. Após eliminação, o
            teu conteúdo público pode permanecer anonimizado na plataforma.
          </p>
        </section>

        {/* 8. Limitação de Responsabilidade */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            8. Limitação de Responsabilidade
          </h2>
          <p className="mb-3">
            A VibeTuga é fornecida &quot;tal como está&quot;, sem garantias de qualquer tipo,
            expressas ou implícitas. Não nos responsabilizamos por:
          </p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>Interrupções de serviço, perda de dados ou falhas técnicas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Qualidade, precisão ou funcionalidade de produtos vendidos por terceiros no
                marketplace.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Conteúdo publicado por utilizadores, incluindo artigos, comentários e projetos.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Danos diretos, indiretos, incidentais ou consequenciais decorrentes da utilização da
                plataforma.
              </span>
            </li>
          </ul>
        </section>

        {/* 9. Resolução de disputas */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            9. Resolução de Disputas
          </h2>
          <p>
            Disputas entre compradores e vendedores devem ser primeiro resolvidas entre as partes. A
            VibeTuga pode intervir como mediador a pedido de qualquer uma das partes. Estes termos
            são regidos pela legislação portuguesa e quaisquer litígios serão submetidos à
            jurisdição dos tribunais portugueses competentes.
          </p>
        </section>

        {/* 10. Alterações */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            10. Alterações aos Termos
          </h2>
          <p>
            Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações
            significativas serão comunicadas com pelo menos 15 dias de antecedência através de
            notificação na plataforma ou email. A utilização continuada após a entrada em vigor das
            alterações constitui aceitação dos novos termos.
          </p>
        </section>

        {/* 11. Contacto */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">11. Contacto</h2>
          <p className="mb-3">Para questões relacionadas com estes termos, contacta-nos:</p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Email: <span className="text-tertiary font-mono">legal@vibetuga.com</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                Discord: <span className="text-tertiary font-mono">discord.vibetuga.com</span>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
