import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import HeaderUser from "@/components/layout/HeaderUser";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href={ROUTES.dashboard} className="brand">
        🧠 Tutor Inteligente · <span>FMC2</span>
      </Link>
      <nav>
        <Link href={ROUTES.dashboard}>Painel</Link>
        <Link href={ROUTES.graph}>Mapa</Link>
        <Link href={ROUTES.diagnostic}>Diagnóstico</Link>
        <HeaderUser />
      </nav>
    </header>
  );
}
