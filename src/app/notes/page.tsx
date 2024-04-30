import Note from "@/components/Note";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import ClientSideTable from "@/components/ClientSideTable";

export const metadata: Metadata = {
  title: "Smarty - Notes",
};

export default async function NotesPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const allNotes = await prisma.note.findMany({
    where: { userId },
    include: {
      category: true,
    },
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full sm:min-w-0">
        <div className="block sm:hidden">
          {allNotes.map((note) => (
            <Note note={note} key={note.id} />
          ))}
        </div>
        <div className="hidden sm:block">
          <ClientSideTable notes={allNotes} />
        </div>
      </div>
    </div>
  );
}
