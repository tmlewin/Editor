import Editor from "@/components/editor/editor";
import Header from "@/components/layout/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <Editor />
      </main>
    </div>
  );
} 