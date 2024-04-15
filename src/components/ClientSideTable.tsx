"use client";

import React, { useState } from "react";
import { DataTable } from "../app/notes/data-table";

import { ColumnDef } from "@tanstack/react-table";
import { CellContext } from "@tanstack/react-table";

import { columns } from "../app/notes/columns";
import AddEditNoteDialog from "@/components/AddEditNoteDialog";
import { NoteWithCategory } from "@/components/Note";
import { Button } from "./ui/button";
import { PencilIcon } from "lucide-react";
import NoteModal from "./NoteModal";

interface ClientSideTableProps {
  notes: NoteWithCategory[];
}

const ClientSideTable: React.FC<ClientSideTableProps> = ({ notes }) => {
  const [selectedNote, setSelectedNote] = useState<NoteWithCategory | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalContent, setNoteModalContent] = useState("");

  const showContentModal = (content: string) => {
    setNoteModalContent(content);
    setIsNoteModalOpen(true);
  };

  const handleEdit = (note: NoteWithCategory) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedNote(null);
  };

  const actionColumn: ColumnDef<NoteWithCategory> = {
    id: "actions",
    header: "Actions",
    accessorKey: "id",
    cell: ({ row }: CellContext<NoteWithCategory, unknown>) => (
      <>
        <Button onClick={() => handleEdit(row.original)}>
          <PencilIcon name="edit" />
        </Button>
      </>
    ),
  };

  const tableColumns = [...columns(showContentModal), actionColumn];

  return (
    <>
      <DataTable columns={tableColumns} data={notes} />
      {selectedNote && isDialogOpen && (
        <AddEditNoteDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          noteToEdit={selectedNote}
        />
      )}
      <NoteModal
        content={noteModalContent}
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
      />
    </>
  );
};

export default ClientSideTable;
