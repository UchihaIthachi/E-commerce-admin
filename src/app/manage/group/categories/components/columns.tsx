"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
// Remove: import { deleteCategory } from "@/lib/api/category";
import { GetCategoriesDTO } from "@/server/application/common/dtos/category";
import { ColumnDef } from "@tanstack/react-table";
// Remove: import { MoreHorizontal } from "lucide-react"; // Not used directly here
import { z } from "zod";
import { deleteCategoryAction } from "../../actions"; // Import the server action

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
      const { _id, name } = row.original; // Get name for better confirmation message
      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <EditAction href={`/manage/group/categories/${_id}/edit`} text="Edit" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-100" // Added focus style
            onSelect={(e) => e.preventDefault()} // Prevent dropdown close
          >
            <DeleteAction
              _id={_id}
              action={deleteCategoryAction} // Pass the server action
              itemName={`category "${name}"`} // Pass item name
            />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
