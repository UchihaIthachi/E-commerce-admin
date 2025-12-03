"use client";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {UserButton} from "@clerk/nextjs";

function Navigation() {
    return (
        <div className="border-r min-h-screen flex flex-col justify-between">
            <div>
                <h2 className="p-2">Kandy Selection</h2>
                <NavigationMenu orientation="vertical">
                    <NavigationMenuList asChild>
                        <ul className="flex flex-col items-stretch py-4 pl-4 gap-y-2 space-x-0">
                            <NavigationMenuItem>
                                <Link href="/manage/dashboard" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Dashboard
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/manage/products" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Products
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/manage/orders" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Orders
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="attributes">
                                        <AccordionTrigger>Groups</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col gap-y-2">
                                                <Link href="/manage/group/categories" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
                                                    >
                                                        Categories
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/manage/group/subcategories" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
                                                    >
                                                        Subcategories
                                                    </NavigationMenuLink>
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="attributes">
                                        <AccordionTrigger>Attributes</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col gap-y-2">
                                                <Link href="/manage/attributes/colors" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
                                                    >
                                                        Colors
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/manage/attributes/sizes" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
                                                    >
                                                        Sizes
                                                    </NavigationMenuLink>
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="media">
                                        <AccordionTrigger>Media</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col gap-y-2">
                                                <Link href="/manage/media/banners" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
                                                    >
                                                        Banners
                                                    </NavigationMenuLink>
                                                </Link>
                                                <Link href="/manage/media/grid-items" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
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
            <div className={"px-8 py-4"}>
                <UserButton />
            </div>
        </div>
    );
}

export default Navigation;
