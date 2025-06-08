"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteSize } from "@/lib/api/size";
import { GetSizeDTO } from "@/server/application/common/dtos/size";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { z } from "zod";

export const columns: ColumnDef<z.infer<typeof GetSizeDTO>>[] = [
  {
    accessorKey: "_id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "actions",
    header: "Manage",
    cell: ({ row }) => {
      const { _id } = row.original;
      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <EditAction href={`/manage/attributes/sizes/${_id}`} text="Edit" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"            
          >
            <DeleteAction
              _id={_id}
              queryKey="COLORS"
              mutationFn={deleteSize}
              message="This size is referenced by other documents"
            />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
