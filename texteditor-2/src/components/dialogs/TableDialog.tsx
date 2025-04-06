"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onInsertTable: (rows: number, cols: number, headerRow: boolean, headerCol: boolean) => void;
}

export default function TableDialog({ open, setOpen, onInsertTable }: TableDialogProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headerRow, setHeaderRow] = useState(true);
  const [headerCol, setHeaderCol] = useState(false);

  const handleSubmit = () => {
    // Validate inputs
    const validRows = Math.max(1, Math.min(20, rows));
    const validCols = Math.max(1, Math.min(10, cols));

    // Close the dialog first to ensure UI updates properly
    setOpen(false);

    // Use setTimeout to ensure the dialog is fully closed before inserting the table
    // This helps prevent any UI blocking that might interfere with the table insertion
    // A slightly longer timeout ensures the selection is properly restored
    setTimeout(() => {
      onInsertTable(validRows, validCols, headerRow, headerCol);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
          <DialogDescription>
            Configure the dimensions and options for your table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="headerRow"
                checked={headerRow}
                onChange={(e) => setHeaderRow(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="headerRow">Header Row</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="headerCol"
                checked={headerCol}
                onChange={(e) => setHeaderCol(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="headerCol">Header Column</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Insert Table</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}