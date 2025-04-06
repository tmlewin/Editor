"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  autoSave: boolean;
  setAutoSave: (autoSave: boolean) => void;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;
}

export default function SettingsDialog({
  open,
  setOpen,
  autoSave,
  setAutoSave,
  autoSaveInterval,
  setAutoSaveInterval,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your editor preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save">Auto Save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save document changes
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          {autoSave && (
            <div className="flex items-center justify-between">
              <Label htmlFor="save-interval">Save Interval (seconds)</Label>
              <input
                id="save-interval"
                type="number"
                min="5"
                max="300"
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="w-20 p-2 border rounded"
              />
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Ctrl+B</div><div>Bold</div>
              <div>Ctrl+I</div><div>Italic</div>
              <div>Ctrl+U</div><div>Underline</div>
              <div>Ctrl+S</div><div>Save</div>
              <div>Ctrl+L</div><div>Bullet List</div>
              <div>Ctrl+O</div><div>Numbered List</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}