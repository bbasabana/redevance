import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AssujettiLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/panel/signin");
  }

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      {children}
    </div>
  );
}
