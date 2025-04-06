import { Document } from "@/types/document";

// Mock documents for initial data
export const mockDocuments: Document[] = [
  { 
    id: 1, 
    title: "Welcome Note", 
    content: "<p>Welcome to TextEditor 2.0! This is a sample document to help you get started.</p>", 
    tags: ["welcome", "tutorial"], 
    createdAt: new Date(2023, 2, 15), 
    modifiedAt: new Date(2023, 2, 16) 
  },
  { 
    id: 2, 
    title: "Project Ideas", 
    content: "<p>Here are some project ideas to consider:</p><ul><li>Task management app</li><li>Recipe organizer</li><li>Fitness tracker</li></ul>", 
    tags: ["ideas", "projects"], 
    createdAt: new Date(2023, 3, 10), 
    modifiedAt: new Date(2023, 3, 20) 
  },
  { 
    id: 3, 
    title: "Meeting Notes", 
    content: "<p>Meeting agenda:</p><ol><li>Project updates</li><li>Timeline review</li><li>Next steps</li></ol>", 
    tags: ["meeting", "work"], 
    createdAt: new Date(2023, 4, 5), 
    modifiedAt: new Date(2023, 4, 5) 
  }
];
