"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuViewport,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ShoppingCart, User } from "lucide-react";
import DropdownMenu from "@app/(landpage)/components/DropdownMenu"; // Import the reusable DropdownMenu component

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      {/* Left Logo */}
      <div className="flex items-center space-x-4">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Middle Navigation */}
      <NavigationMenu>
        <NavigationMenuList className="flex space-x-6">
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/"
              className="text-gray-700 hover:text-black"
            >
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/shop"
              className="text-gray-700 hover:text-black"
            >
              Shop
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Reusable Women Dropdown */}
          <DropdownMenu
            triggerText="Women"
            menuItems={[
              {
                href: "/women/dresses",
                title: "Dresses",
                description: "Trendy and stylish dresses for all occasions.",
              },
              {
                href: "/women/tops",
                title: "Tops",
                description: "Elegant tops to pair with anything.",
              },
            ]}
          />

          {/* Reusable Men Dropdown */}
          <DropdownMenu
            triggerText="Men"
            menuItems={[
              {
                href: "/men/shirts",
                title: "Shirts",
                description: "Stylish shirts for all occasions.",
              },
              {
                href: "/men/trousers",
                title: "Trousers",
                description:
                  "Perfectly tailored trousers for comfort and style.",
              },
            ]}
          />
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Cart Icon */}
        <a
          href="/cart"
          className="flex items-center text-gray-700 hover:text-black"
        >
          <ShoppingCart className="h-6 w-6" />
        </a>
        {/* User Icon */}
        <a
          href="/user"
          className="flex items-center text-gray-700 hover:text-black"
        >
          <User className="h-6 w-6" />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
