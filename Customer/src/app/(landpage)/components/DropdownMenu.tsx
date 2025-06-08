// components/DropdownMenu.tsx

import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ChevronDown } from "lucide-react";

// ListItem component for better reusability inside the dropdown
const ListItem = ({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) => (
  <li>
    <NavigationMenuLink
      href={href}
      className="block p-2 text-gray-700 hover:bg-gray-100"
    >
      <div className="font-medium">{title}</div>
      <p className="text-sm text-gray-500">{children}</p>
    </NavigationMenuLink>
  </li>
);

interface DropdownMenuProps {
  triggerText: string;
  menuItems: { href: string; title: string; description: string }[];
}

const DropdownMenu = ({ triggerText, menuItems }: DropdownMenuProps) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        {triggerText} <ChevronDown size={16} />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          {menuItems.map((item, index) => (
            <ListItem key={index} href={item.href} title={item.title}>
              {item.description}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

export default DropdownMenu;
