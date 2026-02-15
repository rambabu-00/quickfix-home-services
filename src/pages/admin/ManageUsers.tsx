import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserRow {
  user_id: string;
  full_name: string;
  role: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map((rolesRes.data ?? []).map((r) => [r.user_id, r.role]));
      setUsers((profilesRes.data ?? []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) ?? "unknown",
      })));
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold">Manage Users</h1>
      <div className="relative mt-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="mt-6 flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {filtered.map((u) => (
            <Card key={u.user_id}>
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-medium">{u.full_name || "No name"}</span>
                <Badge variant="outline">{u.role.replace("_", " ")}</Badge>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground">No users found.</p>}
        </div>
      )}
    </div>
  );
}
