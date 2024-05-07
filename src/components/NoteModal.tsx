import React from "react";
import { Button } from "./ui/button"; // Make sure this path is correct
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"; // Make sure this path is correct

interface NoteModalProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ content, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <>
          <DialogHeader>
            <DialogTitle>Note Content</DialogTitle>
          </DialogHeader>
          <DialogContent className="max-w-full whitespace-pre-line p-6">
            <div
              className="max-w-full overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 160px)" }}
            >
              {content}
            </div>
            <div className="flex justify-end p-4">
              <Button onClick={onClose}>Close</Button>
            </div>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default NoteModal;
