import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Grid3X3, CalendarCheck } from "lucide-react";

const items = [
  { to: "/admin/users", icon: <Users className="h-8 w-8" />, title: "Manage Users", description: "View and manage all users" },
  { to: "/admin/categories", icon: <Grid3X3 className="h-8 w-8" />, title: "Manage Categories", description: "Add, edit, or remove service categories" },
  { to: "/admin/bookings", icon: <CalendarCheck className="h-8 w-8" />, title: "All Bookings", description: "View all platform bookings" },
];

export default function AdminDashboard() {
  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader>
                <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit">{item.icon}</div>
                <CardTitle className="font-display">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
