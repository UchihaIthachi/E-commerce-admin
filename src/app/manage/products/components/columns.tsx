"use client";

import {Cloth} from "@/server/application/common/dtos/schemas";
import {ColumnDef} from "@tanstack/react-table";
import * as z from "zod";

import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import EditAction from "@/app/manage/components/table/edit-action";

export const columns: ColumnDef<z.infer<typeof Cloth>>[] = [
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "sku",
        header: "SKU"
    },
    {
        accessorKey: "enabled",
        header: "Enabled"
    },
    {
        accessorKey: "category",
        header: "Category"
    },
    {
        accessorKey: "subcategory",
        header: "Subcategory"
    },
    {
        accessorKey: "price",
        header: "Price(LKR)",
    },
    {
        id: "actions",
        header: "Manage",
        cell: ({row}) => {
            const cloth = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem><EditAction href={`/manage/products/${cloth._id}/edit`}
                                                      text={"Edit"}/></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
