"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteSubCategory } from "@/lib/api/subcategory";
import { GetCategoryDTO } from "@/server/application/common/dtos/category";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import {GetSubCategoriesDTO} from "@/server/application/common/dtos/subcategory";

export const columns: ColumnDef<z.infer<typeof GetSubCategoriesDTO>>[] = [
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
    accessorKey: "category",
    cell: (props) => {
      return props.row.original.category.name;
    },
    header: "Category",
  },
  {
    id: "actions",
    header: "Manage",
    cell: ({ row }) => {
      const { _id } = row.original;

      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <EditAction href={`/manage/group/subcategories/${_id}/edit`} text="Edit" />
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">
            <DeleteAction
              _id={_id}
              queryKey="SUBCATEGORY"
              mutationFn={deleteSubCategory}
              message="This subcategory is referenced by other documents"
            />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
