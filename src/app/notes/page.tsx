import Note from "@/components/Note";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import { columns } from "./columns";
import { DataTable } from "./data-table";
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
    <div className="w-full">
      {/* {allNotes.map((note) => (
        <Note note={note} key={note.id} />
      ))} */}
      <ClientSideTable notes={allNotes} />
    </div>
  );
}
