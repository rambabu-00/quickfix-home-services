import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from("service_categories").select("*").order("name");
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("service_categories").insert({ name: newName.trim(), description: newDesc.trim() });
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewName("");
      setNewDesc("");
      toast({ title: "Category added" });
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("service_categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted" });
      fetchCategories();
    }
  };

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold">Manage Categories</h1>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row">
          <Input placeholder="Category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <Button onClick={addCategory} disabled={adding}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="mt-6 flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <span className="font-medium">{c.name}</span>
                  {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
