"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { deleteSubCategory } from "@/lib/api/subcategory"; // No longer needed
import { deleteSubcategoryAction } from "../actions"; // Import server action
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
            {/*
              The DeleteAction component now directly takes a server action.
              Client-side toast for success/error should be handled by the page/component
              that invokes actions and uses useFormState, or by the DeleteAction if it's adapted further.
              For now, DeleteAction's internal form will call the server action.
            */}
            <DeleteAction
              _id={_id}
              action={deleteSubcategoryAction}
              itemName="subcategory" // Optional: for a more specific confirmation message
            />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
