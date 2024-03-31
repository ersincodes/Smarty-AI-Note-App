import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"; // Adjust imports based on your ShadCN structure
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import LoadingButton from "./ui/loading-button";

interface CreateCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface CategoryFormData {
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CreateCategoryDialog({
  open,
  setOpen,
}: CreateCategoryDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { register, handleSubmit, reset } = useForm<CategoryFormData>();
  const [deleteInProgress, setDeleteInProgress] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      };

      fetchCategories();
    }
  }, [open]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Extract the new category from the response
        const result = await response.json();
        const newCategory = result.category;

        // Add the new category to the existing categories array
        setCategories((currentCategories) => [
          ...currentCategories,
          newCategory,
        ]);
      } else {
        throw new Error("Failed to create category");
      }

      reset(); // Reset form fields
    } catch (error) {
      console.error("Failed to create category", error);
      // Optionally, display an error message
    }
  };
  const handleDeleteCategory = async (categoryId: string) => {
    // Confirm deletion with the user
    if (!confirm("Are you sure you want to delete this category?")) return;

    setDeleteInProgress((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const response = await fetch(`/api/categories`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: categoryId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Remove the deleted category from the state
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId),
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong, please try again.");
    } finally {
      setDeleteInProgress((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <DialogTitle>Create New Category</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Input
            {...register("name", { required: true })}
            placeholder="Category Name"
          />
          <Button className="w-full" type="submit">
            Submit Category
          </Button>
        </form>
        <div className="mt-4 text-center">
          <h1 className="mb-3 border-b border-current font-bold">
            Existing Categories
          </h1>
          <ul className="mt-4">
            {categories.map((category) => (
              <li
                key={category.id}
                className="mt-4 flex items-center justify-between"
              >
                {category.name}
                <LoadingButton
                  onClick={() => handleDeleteCategory(category.id)}
                  loading={deleteInProgress[category.id]}
                  disabled={deleteInProgress[category.id]}
                  variant="destructive"
                >
                  Delete
                </LoadingButton>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
