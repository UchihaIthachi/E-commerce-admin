"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {ColumnDef} from "@tanstack/react-table";
import {z} from "zod";
import {GetBannerDTO} from "@/server/application/common/dtos/banner";
import { deleteBannerAction } from "../actions";

export const columns: ColumnDef<z.infer<typeof GetBannerDTO>>[] = [
    {
        accessorKey: "_id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        id: "actions",
        header: "Manage",
        cell: ({row}) => {
            const {_id} = row.original;
            return (
                <ActionDropdown>
                    <DropdownMenuItem>
                        <EditAction href={`/manage/media/banners/${_id}/edit`} text="Edit"/>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-500"
                        onSelect={(e) => e.preventDefault()}
                    >
                        <DeleteAction
                            _id={_id}
                            action={deleteBannerAction}
                            itemName={`banner "${row.original.name}"`}
                        />
                    </DropdownMenuItem>
                </ActionDropdown>
            );
        },
    },
];
