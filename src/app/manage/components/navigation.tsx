"use client"; // Ensure this is at the top

import { usePathname } from "next/navigation"; // Import usePathname
import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {UserButton} from "@clerk/nextjs";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import { ThemeToggle } from "@/components/ui/ThemeToggle"; // Import ThemeToggle

// --- SVG Icon Components ---
const IconBaseProps = {
  className: "mr-2 h-4 w-4 flex-shrink-0", // Added flex-shrink-0
  "aria-hidden": "true" as const, // Ensure this is a const for type safety
  focusable: "false",
};

const DashboardIcon = () => (
  <svg {...IconBaseProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);
const ProductsIcon = () => (
  <svg {...IconBaseProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4v2h16V4zm1 10v-2H3v2h18zm-1-4H4v2h16v-2zM3 20h18v-2H3v2z" />
  </svg>
);
const OrdersIcon = () => (
  <svg {...IconBaseProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);
const GroupsIcon = () => (
  <svg {...IconBaseProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const AttributesIcon = () => (
  <svg {...IconBaseProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.91 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z" />
  </svg>
);
const MediaIcon = () => (
  <svg {...IconBaseProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-11-1H5v-5l2.75 3.54L11 13.47V18zm8-1h-3.03L12 12.24 14.75 9l4.25 6V18z" />
  </svg>
);
// --- End SVG Icon Components ---

function Navigation() {
    const pathname = usePathname(); // Get current pathname

    // Base style for all navigation menu trigger styles (links and accordion triggers)
    const baseNavStyle = "justify-start w-full text-sm transition-colors duration-150 ease-in-out";

    // Helper function to generate className for main navigation links
    const getLinkClassName = (href: string) => {
        const isActive = pathname === href;
        return cn(
            navigationMenuTriggerStyle(), // Applies default shadcn styling (padding, hover, etc.)
            baseNavStyle,
            "font-medium", // Specific to main links
            isActive && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
        );
    };

    // Helper function for Accordion Triggers
    const getAccordionTriggerClassName = (hrefPrefix: string) => {
        const isActive = pathname.startsWith(hrefPrefix); // Accordion active if path starts with prefix
         return cn(
            navigationMenuTriggerStyle(),
            baseNavStyle,
            // "font-medium", // Accordion triggers are typically not as emphasized as direct links
            isActive && "text-accent-foreground", // Only change text color if section is active
            "justify-between hover:no-underline" // Keep justify-between for chevron
        );
    };

    // Helper function for links inside Accordions
    const getAccordionLinkClassName = (href: string) => {
        const isActive = pathname === href;
        return cn(
            navigationMenuTriggerStyle(),
            baseNavStyle,
            isActive && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            "pl-8" // Indentation for nested links
        );
    };

    return (
        <div className="bg-background border-r min-h-screen flex flex-col justify-between">
            <div>
                <h2 className="p-2 text-lg font-semibold md:p-4 md:text-xl">Style Stock</h2>
                {/* Changed to font-semibold from font-bold for a slightly softer look, still prominent */}
                <NavigationMenu orientation="vertical" className="w-full">
                    <NavigationMenuList asChild>
                        <ul className="flex flex-col items-stretch py-2 pl-2 md:py-4 md:pl-4 gap-y-1 space-x-0 w-full">
                            <NavigationMenuItem className="w-full">
                                <Link href="/manage/dashboard" legacyBehavior passHref>
                                    <NavigationMenuLink className={getLinkClassName("/manage/dashboard")}>
                                        <DashboardIcon /> Dashboard
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Link href="/manage/products" legacyBehavior passHref>
                                    <NavigationMenuLink className={getLinkClassName("/manage/products")}>
                                        <ProductsIcon /> Products
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Link href="/manage/orders" legacyBehavior passHref>
                                    <NavigationMenuLink className={getLinkClassName("/manage/orders")}>
                                        <OrdersIcon /> Orders
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="groups" className="border-none">
                                        <AccordionTrigger className={getAccordionTriggerClassName("/manage/group")}>
                                            <span className="flex items-center"><GroupsIcon /> Groups</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1">
                                            <div className="flex flex-col gap-y-1">
                                                <Link href="/manage/group/categories" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={getAccordionLinkClassName("/manage/group/categories")}
                                                    >
                                                        Categories
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/manage/group/subcategories" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={getAccordionLinkClassName("/manage/group/subcategories")}
                                                    >
                                                        Subcategories
                                                    </NavigationMenuLink>
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="attributes" className="border-none">
                                        <AccordionTrigger className={getAccordionTriggerClassName("/manage/attributes")}>
                                            <span className="flex items-center"><AttributesIcon /> Attributes</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1">
                                            <div className="flex flex-col gap-y-1">
                                                <Link href="/manage/attributes/colors" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={getAccordionLinkClassName("/manage/attributes/colors")}
                                                    >
                                                        Colors
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/manage/attributes/sizes" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={getAccordionLinkClassName("/manage/attributes/sizes")}
                                                    >
                                                        Sizes
                                                    </NavigationMenuLink>
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="media" className="border-none">
                                        <AccordionTrigger className={getAccordionTriggerClassName("/manage/media")}>
                                            <span className="flex items-center"><MediaIcon /> Media</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1">
                                            <div className="flex flex-col gap-y-1">
                                                <Link href="/manage/media/banners" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={getAccordionLinkClassName("/manage/media/banners")}
                                                    >
                                                        Banners
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/manage/media/grid-items" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={getAccordionLinkClassName("/manage/media/grid-items")}
                                                    >
                                                        Grid Items
                                                    </NavigationMenuLink>
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </NavigationMenuItem>
                        </ul>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <div className={"px-4 py-3 md:px-8 md:py-4 border-t flex items-center justify-between"}>
                <ThemeToggle />
                <UserButton />
            </div>
        </div>
    );
}

export default Navigation;
