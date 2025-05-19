import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw Error("PINECONE_API_KEY is not set");
}

// Initialize Pinecone client using v6.0.0 SDK
const pinecone = new Pinecone({
  apiKey,
});

// Target the index using the new SDK pattern
export const notesIndex = pinecone.index("smartyapp");

// Example function to upsert vectors
export async function upsertVectors(
  vectors: {
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }[],
  namespace = "",
) {
  try {
    await notesIndex.upsert(vectors);
    return { success: true };
  } catch (error) {
    console.error("Error upserting vectors:", error);
    return { success: false, error };
  }
}

// Example function to query vectors
export async function queryVectors({
  vector,
  topK = 10,
  namespace = "",
  filter = {},
  includeMetadata = true,
  includeValues = false,
}: {
  vector: number[];
  topK?: number;
  namespace?: string;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
  includeValues?: boolean;
}) {
  try {
    const targetIndex = namespace
      ? notesIndex.namespace(namespace)
      : notesIndex;

    const results = await targetIndex.query({
      vector,
      topK,
      filter,
      includeMetadata,
      includeValues,
    });

    return { success: true, results };
  } catch (error) {
    console.error("Error querying vectors:", error);
    return { success: false, error };
  }
}

// Example function to delete vectors
export async function deleteVectors(ids: string[], namespace = "") {
  try {
    const targetIndex = namespace
      ? notesIndex.namespace(namespace)
      : notesIndex;

    if (ids.length === 1) {
      // Use deleteOne for a single ID
      await targetIndex.deleteOne(ids[0]);
    } else {
      // Use deleteMany for multiple IDs
      await targetIndex.deleteMany(ids);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting vectors:", error);
    return { success: false, error };
  }
}

// Example function to fetch vectors by ID
export async function fetchVectors(ids: string[], namespace = "") {
  try {
    const targetIndex = namespace
      ? notesIndex.namespace(namespace)
      : notesIndex;

    const results = await targetIndex.fetch(ids);

    return { success: true, results };
  } catch (error) {
    console.error("Error fetching vectors:", error);
    return { success: false, error };
  }
}

// Example function to get index stats
export async function getIndexStats(namespace = "") {
  try {
    const stats = await notesIndex.describeIndexStats();
    return { success: true, stats };
  } catch (error) {
    console.error("Error getting index stats:", error);
    return { success: false, error };
  }
}
