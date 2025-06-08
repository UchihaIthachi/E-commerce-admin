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

function Navigation() {
    const pathname = usePathname(); // Get current pathname

    // Helper function to generate className for navigation links
    const getLinkClassName = (href: string) => {
        const isActive = pathname === href;
        return cn(
            navigationMenuTriggerStyle(),
            isActive && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            "justify-start w-full" // Ensure links take full width and text is left-aligned
        );
    };

    const getAccordionLinkClassName = (href: string) => {
        const isActive = pathname === href;
        return cn(
            navigationMenuTriggerStyle(),
            isActive && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            "justify-start w-full pl-8" // Increased indentation with pl-8 (base pl-4 from trigger + pl-4 for item)
        );
    };


    return (
        <div className="bg-background border-r min-h-screen flex flex-col justify-between">
            <div>
                <h2 className="p-2 text-lg font-bold md:p-4 md:text-xl">Style Stock</h2>
                <NavigationMenu orientation="vertical" className="w-full">
                    <NavigationMenuList asChild>
                        <ul className="flex flex-col items-stretch py-2 pl-2 md:py-4 md:pl-4 gap-y-1 space-x-0 w-full">
                            <NavigationMenuItem className="w-full">
                                <Link href="/manage/dashboard" legacyBehavior passHref>
                                    <NavigationMenuLink className={getLinkClassName("/manage/dashboard")}>
                                        {/* <Icon name="dashboard" /> */} Dashboard
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Link href="/manage/products" legacyBehavior passHref>
                                    <NavigationMenuLink className={getLinkClassName("/manage/products")}>
                                        {/* <Icon name="products" /> */} Products
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Link href="/manage/orders" legacyBehavior passHref>
                                    <NavigationMenuLink className={getLinkClassName("/manage/orders")}>
                                        {/* <Icon name="orders" /> */} Orders
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="groups" className="border-none">
                                        <AccordionTrigger className={cn(navigationMenuTriggerStyle(), "justify-between w-full hover:no-underline")}>
                                            <span>{/* <Icon name="groups" /> */} Groups</span>
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
                                        <AccordionTrigger className={cn(navigationMenuTriggerStyle(), "justify-between w-full hover:no-underline")}>
                                            <span>{/* <Icon name="attributes" /> */} Attributes</span>
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
                                        <AccordionTrigger className={cn(navigationMenuTriggerStyle(), "justify-between w-full hover:no-underline")}>
                                            <span>{/* <Icon name="media" /> */} Media</span>
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
