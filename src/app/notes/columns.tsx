"use client";

import { NoteWithCategory } from "@/components/Note";
import { ColumnDef } from "@tanstack/react-table";

export type ShowContentModal = (content: string) => void;

export const columns: (
  showContentModal: ShowContentModal,
) => ColumnDef<NoteWithCategory>[] = (showContentModal) => [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      const content = row.original.content ?? "";
      const truncatedContent =
        content.length > 100 ? content.substring(0, 100) + "..." : content;
      return (
        <div
          onClick={() => (content ? showContentModal(content) : null)}
          style={{ cursor: "pointer" }}
        >
          {truncatedContent}
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.category?.name || "No Category",
    id: "category",
    header: "Category",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
  },
];
