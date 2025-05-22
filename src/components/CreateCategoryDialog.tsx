import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"; // Adjust imports based on your ShadCN structure
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import LoadingButton from "./ui/loading-button";
import { useCategories } from "@/context/CategoriesContext";

interface CreateCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface CategoryFormData {
  name: string;
}

export default function CreateCategoryDialog({
  open,
  setOpen,
}: CreateCategoryDialogProps) {
  const {
    categories,
    loading: categoriesLoading,
    refreshCategories,
  } = useCategories();
  const { register, handleSubmit, reset } = useForm<CategoryFormData>();
  const [deleteInProgress, setDeleteInProgress] = useState<{
    [key: string]: boolean;
  }>({});

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
        refreshCategories();
        reset(); // Reset form fields
      } else {
        throw new Error("Failed to create category");
      }
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

      refreshCategories();
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
      <DialogContent className="max-h-[80vh] w-[90%] max-w-[500px] overflow-auto p-6">
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
          {categoriesLoading ? (
            <p className="mt-4">Loading categories...</p>
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
