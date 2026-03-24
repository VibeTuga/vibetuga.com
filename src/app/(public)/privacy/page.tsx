import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | VibeTuga",
  description:
    "Política de privacidade da VibeTuga. Como recolhemos, usamos e protegemos os teus dados.",
  alternates: {
    canonical: "https://vibetuga.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-24">
      {/* Status indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-label text-[10px] tracking-widest text-primary uppercase">
          Privacy_Protocol
        </span>
      </div>

      <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
        Política de{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
          Privacidade
        </span>
      </h1>

      <p className="text-on-surface-variant text-sm mb-12">
        Última atualização: 24 de março de 2026
      </p>

      <div className="space-y-12 text-on-surface-variant leading-relaxed">
        {/* 1. Introdução */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">1. Introdução</h2>
          <p>
            A VibeTuga (&quot;nós&quot;, &quot;nosso&quot; ou &quot;plataforma&quot;) compromete-se
            a proteger a privacidade dos seus utilizadores. Esta política descreve como recolhemos,
            utilizamos, armazenamos e protegemos os teus dados pessoais quando utilizas o nosso
            website em <span className="text-tertiary font-mono">vibetuga.com</span> e os serviços
            associados.
          </p>
        </section>

        {/* 2. Dados que recolhemos */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            2. Dados que Recolhemos
          </h2>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            2.1. Dados de Autenticação (Discord OAuth)
          </h3>
          <p className="mb-3">
            Quando inicias sessão através do Discord, recolhemos automaticamente:
          </p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>ID de utilizador Discord</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Nome de utilizador Discord</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Avatar do Discord</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>Endereço de email associado à conta Discord</span>
            </li>
          </ul>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            2.2. Dados de Perfil
          </h3>
          <p>
            Podes opcionalmente fornecer informação adicional como nome de exibição, biografia e URL
            do website pessoal.
          </p>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            2.3. Dados de Utilização
          </h3>
          <p>
            Recolhemos dados de utilização anonimizados para melhorar a experiência, incluindo
            páginas visitadas, interações com funcionalidades e métricas de desempenho. Utilizamos
            ferramentas de analytics com foco na privacidade.
          </p>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            2.4. Dados de Email
          </h3>
          <p>
            Se te subscreveres à nossa newsletter, armazenamos o teu endereço de email e
            preferências de subscrição.
          </p>

          <h3 className="font-headline text-base font-semibold text-white/80 mb-2 mt-6">
            2.5. Dados de Pagamento
          </h3>
          <p>
            Pagamentos são processados inteiramente pelo{" "}
            <span className="text-tertiary font-mono">Stripe</span>. Nunca armazenamos dados de
            cartões de crédito ou informações bancárias nos nossos servidores. Armazenamos apenas
            identificadores de transação do Stripe para referência.
          </p>
        </section>

        {/* 3. Armazenamento */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            3. Armazenamento de Dados
          </h2>
          <p className="mb-3">
            Os teus dados são armazenados de forma segura nos seguintes serviços:
          </p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-tertiary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Neon DB</span> (PostgreSQL serverless) —
                dados de utilizadores, conteúdo e transações, com encriptação em repouso e em
                trânsito.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tertiary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Cloudflare R2</span> — ficheiros
                carregados (imagens de perfil, capas de projetos, produtos digitais) armazenados com
                URLs pré-assinadas e acesso controlado.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tertiary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Vercel</span> — hosting e edge functions
                com encriptação TLS.
              </span>
            </li>
          </ul>
        </section>

        {/* 4. Cookies */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">4. Cookies</h2>
          <p className="mb-3">Utilizamos os seguintes cookies:</p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Cookies de sessão</span> — necessários
                para manter a tua sessão autenticada (NextAuth).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Preferências</span> — armazenam as tuas
                preferências de consentimento de cookies.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Analytics</span> — cookies de analytics
                com foco na privacidade para métricas agregadas de utilização.
              </span>
            </li>
          </ul>
          <p className="mt-3">
            Não utilizamos cookies de terceiros para fins publicitários. Podes gerir as tuas
            preferências de cookies a qualquer momento através do banner de cookies.
          </p>
        </section>

        {/* 5. Serviços de terceiros */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            5. Serviços de Terceiros
          </h2>
          <p className="mb-3">
            Integramos com os seguintes serviços de terceiros, cada um com a sua própria política de
            privacidade:
          </p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Discord</span> — autenticação OAuth e
                integração comunitária.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Stripe</span> — processamento de
                pagamentos e gestão de subscrições.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Resend</span> — envio de emails
                transacionais e newsletters.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Sentry</span> — monitorização de erros e
                desempenho da aplicação.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Vercel</span> — hosting, analytics e
                speed insights.
              </span>
            </li>
          </ul>
        </section>

        {/* 6. Direitos RGPD */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            6. Os Teus Direitos (RGPD)
          </h2>
          <p className="mb-3">
            Enquanto residente na União Europeia, tens os seguintes direitos sobre os teus dados
            pessoais:
          </p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Direito de acesso</span> — podes
                consultar os teus dados a qualquer momento no teu perfil em{" "}
                <span className="text-tertiary font-mono">/dashboard/settings</span>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Direito de retificação</span> — podes
                editar os teus dados pessoais em{" "}
                <span className="text-tertiary font-mono">/dashboard/profile</span>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Direito de eliminação</span> — podes
                eliminar a tua conta e todos os dados associados em{" "}
                <span className="text-tertiary font-mono">/dashboard/settings</span>. Este processo
                é irreversível e remove todos os teus dados dos nossos sistemas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Direito de exportação</span> — podes
                exportar todos os teus dados em formato JSON através de{" "}
                <span className="text-tertiary font-mono">/dashboard/settings</span>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                <span className="text-white font-semibold">Direito de oposição</span> — podes
                cancelar a subscrição da newsletter a qualquer momento através do link de
                cancelamento presente em cada email.
              </span>
            </li>
          </ul>
        </section>

        {/* 7. Segurança */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">7. Segurança</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizativas para proteger os teus dados,
            incluindo encriptação TLS em todas as comunicações, hashing de passwords e tokens,
            controlo de acesso baseado em funções, monitorização de erros com Sentry e rate limiting
            em endpoints sensíveis.
          </p>
        </section>

        {/* 8. Retenção */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">8. Retenção de Dados</h2>
          <p>
            Mantemos os teus dados pessoais enquanto a tua conta estiver ativa. Após a eliminação da
            conta, todos os dados pessoais são removidos permanentemente dos nossos sistemas num
            prazo de 30 dias. Dados anonimizados de analytics podem ser retidos para fins
            estatísticos.
          </p>
        </section>

        {/* 9. Menores */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">9. Menores de Idade</h2>
          <p>
            A VibeTuga não se destina a menores de 16 anos. Não recolhemos intencionalmente dados de
            menores. Se tiveres conhecimento de que um menor está a utilizar a plataforma,
            contacta-nos para que possamos tomar as medidas necessárias.
          </p>
        </section>

        {/* 10. Alterações */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">
            10. Alterações a Esta Política
          </h2>
          <p>
            Podemos atualizar esta política periodicamente. Quaisquer alterações significativas
            serão comunicadas através de notificação na plataforma ou por email. A data da última
            atualização será sempre indicada no topo desta página.
          </p>
        </section>

        {/* 11. Contacto */}
        <section>
          <h2 className="font-headline text-xl font-bold text-white mb-4">11. Contacto</h2>
          <p className="mb-3">
            Para questões relacionadas com privacidade ou exercício dos teus direitos, contacta-nos
            através de:
          </p>
          <ul className="list-none space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
              <span>
                Email: <span className="text-tertiary font-mono">privacidade@vibetuga.com</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">&gt;</span>
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
