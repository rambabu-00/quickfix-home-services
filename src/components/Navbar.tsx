import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LogOut, Menu, X, Wrench } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const links = () => {
    const base = [{ to: "/", label: "Home" }, { to: "/categories", label: "Services" }];
    if (!user) return base;
    if (role === "customer") return [...base, { to: "/my-bookings", label: "My Bookings" }];
    if (role === "service_provider") return [...base, { to: "/provider/dashboard", label: "Dashboard" }];
    if (role === "admin") return [...base, { to: "/admin", label: "Admin" }];
    return base;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Wrench className="h-6 w-6" /> QuickFix
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links().map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Sign Up</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links().map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Logout</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Login</Button>
                <Button size="sm" onClick={() => { navigate("/register"); setMobileOpen(false); }}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
