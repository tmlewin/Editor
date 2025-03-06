import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  FileUp, 
  FilePlus, 
  Settings, 
  User 
} from "lucide-react";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">TextEditor 2.0</h1>
          <Input 
            className="w-60 h-8" 
            placeholder="Untitled Document" 
            aria-label="Document title"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <FilePlus className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button size="sm" variant="outline">
            <FileUp className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button size="sm" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="icon" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <User className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
} 