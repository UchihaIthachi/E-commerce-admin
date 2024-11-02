"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteCategory } from "@/lib/api/category";
import { GetCategoriesDTO } from "@/server/application/common/dtos/category";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { z } from "zod";

export const columns: ColumnDef<z.infer<typeof GetCategoriesDTO>>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    id: "actions",
    header: "Manage",
    cell: ({ row }) => {
      const { _id } = row.original;
      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <EditAction href={`/manage/group/categories/${_id}/edit`} text="Edit" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"            
          >
            <DeleteAction
              _id={_id}
              queryKey="CATEGORY"
              mutationFn={deleteCategory}
              message="This category is referenced by other documents"
            />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
