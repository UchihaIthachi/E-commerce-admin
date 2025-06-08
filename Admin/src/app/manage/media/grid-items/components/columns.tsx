"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {ColumnDef} from "@tanstack/react-table";
import {z} from "zod";
import {GetGridItemDTO} from "@/server/application/common/dtos/grid-item";
import {deleteGridItem} from "@/lib/api/grid-item";

export const columns: ColumnDef<z.infer<typeof GetGridItemDTO>>[] = [
    {
        accessorKey: "_id",
        header: "ID",
    },
    {
        accessorKey: "index",
        header: "Index",
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
                        <EditAction href={`/manage/media/grid-items/${_id}/edit`} text="Edit"/>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-500"
                    >
                        <DeleteAction
                            _id={_id}
                            queryKey="GRID_ITEM"
                            mutationFn={deleteGridItem}
                            message="This grid item is referenced by other documents"
                        />
                    </DropdownMenuItem>
                </ActionDropdown>
            );
        },
    },
];
