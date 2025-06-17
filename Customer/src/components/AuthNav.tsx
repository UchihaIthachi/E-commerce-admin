"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react"; // For loading spinner

export default function AuthNav() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Optionally, redirect here or rely on AuthProvider/global effects for redirection
    // router.push('/'); // Next.js 13+ app router, ensure `useRouter` is imported if used
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : user.email ? user.email[0].toUpperCase() : '?';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* Placeholder for user image if available: <AvatarImage src={user.image || undefined} alt={user.name || ""} /> */}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
              {user.name && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account/dashboard">My Account</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/orders">My Orders</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button asChild variant="ghost">
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  );
}
