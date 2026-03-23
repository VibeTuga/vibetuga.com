import { AdminUsersManager } from "./AdminUsersManager";

export default function UsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Utilizadores
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Gestão de utilizadores, verificação e roles
        </p>
      </div>

      <AdminUsersManager />
    </div>
  );
}
