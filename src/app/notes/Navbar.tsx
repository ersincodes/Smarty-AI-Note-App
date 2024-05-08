"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/Logo_Smarty.png";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddNoteDialog from "@/components/AddEditNoteDialog";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

import AIChatButton from "@/components/AIChatButton";
import CreateCategoryDialog from "@/components/CreateCategoryDialog";

export default function Navbar() {
  const { theme } = useTheme();
  const [showAddEditNoteDialog, setShowAddEditNoteDialog] = useState(false);
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false);

  return (
    <>
      <div className="p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/notes" className="flex-center flex gap-1">
            <Image src={logo} alt="Smarty Logo" width={50} height={50} />
            <span className="mt-3 font-bold">Smarty</span>
          </Link>
          <div className="flex-center flex gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <ThemeToggleButton />
            <AIChatButton />
            {/* <Button onClick={() => setShowCreateCategoryDialog(true)}>
              <Plus size={20} className="mr-2" />
              Category
            </Button> */}
            <Button onClick={() => setShowAddEditNoteDialog(true)}>
              <Plus size={20} className="mr-2" />
              Note
            </Button>
          </div>
        </div>
      </div>
      {showCreateCategoryDialog && (
        <CreateCategoryDialog
          open={showCreateCategoryDialog}
          setOpen={setShowCreateCategoryDialog}
        />
      )}
      <AddNoteDialog
        open={showAddEditNoteDialog}
        setOpen={setShowAddEditNoteDialog}
      />
    </>
  );
}
