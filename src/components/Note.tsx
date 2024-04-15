"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import AddEditNoteDialog from "./AddEditNoteDialog";
import { Note } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export type NoteWithCategory = Note & {
  category: {
    name: string;
  } | null;
};

interface NoteProps {
  note: NoteWithCategory;
}

export default function NoteComponent({ note }: NoteProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const maxContentLength = 150;
  const shouldShowMoreButton =
    note.content && note.content.length > maxContentLength;
  const displayContent = isExpanded
    ? note.content
    : note.content?.substring(0, maxContentLength) + "...";

  const wasUpdated = note.updatedAt > note.createdAt;
  const createdUpdatedAtTimeStamp = formatDate(
    new Date(wasUpdated ? note.updatedAt : note.createdAt),
  );

  return (
    <>
      <Card
        className="relative cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <CardDescription>
            Category: {note.category ? note.category.name : "No Category"}
            <br />
            {createdUpdatedAtTimeStamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{displayContent}</p>
          {shouldShowMoreButton && (
            <button
              className="mt-2 text-sm text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          )}
        </CardContent>
      </Card>
      <AddEditNoteDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        noteToEdit={note}
      />
    </>
  );
}
