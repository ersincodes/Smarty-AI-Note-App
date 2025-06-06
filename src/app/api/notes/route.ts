import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allNotes = await prisma.note.findMany({ where: { userId } });

    return Response.json({ notes: allNotes }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, content, categoryId } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    // Create note first without waiting for embedding
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
        categoryId,
      },
    });

    // Generate embedding in the background
    generateEmbeddingAndUpsert(note.id, title, content, userId);

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, title, content, categoryId } = parseResult.data;

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = auth();

    if (!userId || userId !== note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    // Update note without waiting for embedding
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content, categoryId },
    });

    // Generate embedding in the background
    generateEmbeddingAndUpsert(id, title, content, userId);

    return Response.json({ note: updatedNote }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deleteNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parseResult.data;

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.note.delete({ where: { id } });
      await notesIndex.deleteOne(id);
    });

    return Response.json({ message: "Note deleted." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getEmbeddingForNote(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + (content || ""));
}

// Background function to generate embedding and upsert to Pinecone
async function generateEmbeddingAndUpsert(
  noteId: string,
  title: string,
  content: string | undefined,
  userId: string,
) {
  try {
    const embedding = await getEmbeddingForNote(title, content);
    await notesIndex.upsert([
      {
        id: noteId,
        values: embedding,
        metadata: { userId },
      },
    ]);
  } catch (error) {
    console.error("Error generating embedding:", error);
    // We don't want to fail the main operation if embedding fails
    // Could implement a retry mechanism or queue system for production
  }
}
