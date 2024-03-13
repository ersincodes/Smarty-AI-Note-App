import Image from "next/image";
import logo from "@/assets/Logo_Smarty.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/notes");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="ga-4 flex items-center">
        <Image src={logo} alt="Smarty Logo" width={150} height={150} />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Smarty
        </span>
      </div>
      <p className="max-w-prose text-center">
        An intelligent self development app with AI integration, built with
        OpenAI, Pinecone, Next.js,Shadcn UI, Clerk, and more...
      </p>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}
