"use client";

import { Button } from "@/components/ui/button";
import {
  RowsIcon,
  ColumnsIcon,
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Combine,
  SplitSquareVertical
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TableToolbarProps {
  position: { top: number; left: number } | null;
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onAddColumnLeft: () => void;
  onAddColumnRight: () => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  onDeleteTable: () => void;
  onMergeCells: () => void;
  onSplitCell: () => void;
}

export default function TableToolbar({
  position,
  onAddRowAbove,
  onAddRowBelow,
  onAddColumnLeft,
  onAddColumnRight,
  onDeleteRow,
  onDeleteColumn,
  onDeleteTable,
  onMergeCells,
  onSplitCell
}: TableToolbarProps) {
  if (!position) return null;
  
  return (
    <div 
      className="absolute z-50 bg-background border rounded shadow-md p-1 flex gap-1 items-center"
      style={{ top: position.top, left: position.left }}
    >
      {/* Row operations */}
      <Button variant="ghost" size="icon" onClick={onAddRowAbove} title="Add row above">
        <ArrowUpIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onAddRowBelow} title="Add row below">
        <ArrowDownIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDeleteRow} title="Delete row">
        <RowsIcon className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Column operations */}
      <Button variant="ghost" size="icon" onClick={onAddColumnLeft} title="Add column left">
        <ArrowLeftIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onAddColumnRight} title="Add column right">
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDeleteColumn} title="Delete column">
        <ColumnsIcon className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Cell operations */}
      <Button variant="ghost" size="icon" onClick={onMergeCells} title="Merge cells">
        <Combine className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onSplitCell} title="Split cell">
        <SplitSquareVertical className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Table operations */}
      <Button variant="ghost" size="icon" onClick={onDeleteTable} title="Delete table">
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}