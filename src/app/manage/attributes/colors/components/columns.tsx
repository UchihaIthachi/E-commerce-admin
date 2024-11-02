"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteColor } from "@/lib/api/color";
import { GetColorDTO } from "@/server/application/common/dtos/color";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { z } from "zod";

export const columns: ColumnDef<z.infer<typeof GetColorDTO>>[] = [
  {
    accessorKey: "_id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "hex",
    header: "Hex",
  },
  {
    id: "actions",
    header: "Manage",
    cell: ({ row }) => {
      const { _id } = row.original;
      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <EditAction href={`/manage/attributes/colors/${_id}`} text="Edit" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"            
          >
            <DeleteAction
              _id={_id}
              queryKey="COLOR"
              mutationFn={deleteColor}
              message="This color is referenced by other documents"
            />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
