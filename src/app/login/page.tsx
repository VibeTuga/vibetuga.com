import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { auth, signIn } from "@/lib/auth";
import { Logo } from "@/components/shared/Logo";

export const metadata = {
  title: "Entrar | VibeTuga",
};

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Erro ao iniciar login com Discord.",
  OAuthCallback: "Erro na resposta do Discord.",
  OAuthAccountNotLinked:
    "Este email já está associado a outra conta. Usa o método de login original.",
  Callback: "Erro no callback de autenticação.",
  Default: "Ocorreu um erro ao fazer login. Tenta novamente.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  const { error, callbackUrl, ref } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error as string] ?? ERROR_MESSAGES.Default) : null;
  const redirectTo = typeof callbackUrl === "string" ? callbackUrl : "/";

  // Store referral code in cookie so it survives the OAuth redirect
  if (typeof ref === "string" && ref.length > 0) {
    const cookieStore = await cookies();
    cookieStore.set("vibetuga_ref", ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30, // 30 minutes
      path: "/",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Logo size="lg" className="inline-block" />
        </div>

        {/* Card */}
        <div className="space-y-6 rounded-sm border border-white/5 bg-surface-container p-8">
          {/* Heading */}
          <div className="space-y-2 text-center">
            <h1 className="font-headline text-2xl font-black tracking-tight text-white">
              Entra na Vibe
            </h1>
            <p className="text-sm text-on-surface-variant">
              Faz login com a tua conta Discord para aceder à comunidade.
            </p>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <div className="rounded-sm border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {errorMessage}
            </div>
          )}

          {/* Discord sign-in */}
          <form
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo });
            }}
          >
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-sm bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4752C4]"
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 24 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20.317 1.492a19.27 19.27 0 0 0-4.885-1.477.07.07 0 0 0-.075.036c-.21.375-.444.864-.608 1.25a18.14 18.14 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.073.073 0 0 0-.075-.036A19.24 19.24 0 0 0 3.677 1.49.066.066 0 0 0 3.65 1.52C.533 6.093-.32 10.555.099 14.961a.08.08 0 0 0 .031.054 19.9 19.9 0 0 0 5.993 2.98.073.073 0 0 0 .08-.026 13.65 13.65 0 0 0 1.226-1.963.071.071 0 0 0-.041-.1 12.86 12.86 0 0 1-1.883-.878.072.072 0 0 1-.008-.12c.126-.093.253-.19.374-.287a.07.07 0 0 1 .073-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .074.009c.12.098.248.195.375.288a.072.072 0 0 1-.006.12 12.3 12.3 0 0 1-1.885.879.071.071 0 0 0-.04.1c.36.698.772 1.362 1.225 1.962a.072.072 0 0 0 .08.028 19.84 19.84 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028ZM8.02 12.278c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.947 2.419-2.157 2.419Z"
                  fill="currentColor"
                />
              </svg>
              Entrar com Discord
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            &larr; Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
