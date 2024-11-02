"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {deleteCategory} from "@/lib/api/category";
import {ColumnDef} from "@tanstack/react-table";
import {z} from "zod";
import {GetBannerDTO} from "@/server/application/common/dtos/banner";
import {deleteBanner} from "@/lib/api/banner";

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
                    >
                        <DeleteAction
                            _id={_id}
                            queryKey="BANNER"
                            mutationFn={deleteBanner}
                            message="This category is referenced by other documents"
                        />
                    </DropdownMenuItem>
                </ActionDropdown>
            );
        },
    },
];
