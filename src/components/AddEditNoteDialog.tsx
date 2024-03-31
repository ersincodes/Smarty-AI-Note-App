import { CreateNoteSchema, createNoteSchema } from "@/lib/validation/note";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./ui/loading-button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Note, Category } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectLabel } from "@radix-ui/react-select";
import { Controller } from "react-hook-form";

interface AddEditNoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteToEdit?: Note;
}

export default function AddEditNoteDialog({
  open,
  setOpen,
  noteToEdit,
}: AddEditNoteDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const router = useRouter();

  const form = useForm<CreateNoteSchema>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: noteToEdit?.title || "",
      content: noteToEdit?.title || "",
    },
  });

  async function onSubmit(input: CreateNoteSchema) {
    try {
      if (noteToEdit) {
        const response = await fetch("/api/notes", {
          method: "PUT",
          body: JSON.stringify({
            id: noteToEdit.id,
            ...input,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      } else {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong, please try again..");
    }
  }

  async function deleteNote() {
    if (!noteToEdit) return;
    setDeleteInProgress(true);
    try {
      const response = await fetch("/api/notes", {
        method: "DELETE",
        body: JSON.stringify({
          id: noteToEdit.id,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong, please try again..");
    } finally {
      setDeleteInProgress(false);
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{noteToEdit ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "none" ? null : value);
                      }}
                      value={field.value || "none"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          <SelectItem value="none">None</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {noteToEdit && (
                <LoadingButton
                  variant="destructive"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deleteNote}
                  type="button"
                >
                  Delete Note
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
