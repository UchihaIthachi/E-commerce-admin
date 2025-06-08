"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import DeleteAction from "@/app/manage/components/table/delete-action";
import EditAction from "@/app/manage/components/table/edit-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteCategory } from "@/lib/api/category";
import { GetCategoryDTO } from "@/server/application/common/dtos/category";
import { GetOrderDTO } from "@/server/application/common/dtos/order";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

export const columns: ColumnDef<z.infer<typeof GetOrderDTO>>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "address",
    header: "Adress",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "created",
    header: "Created",
  },
  {
    accessorKey: "shipping_method",
    header: "Shipping Method",
  },
  {
    accessorKey: "order_status",
    header: "Status",
  },
  {
    accessorKey: "payment_status",
    header: "Payment Status",
  },
  {
    id: "actions",
    header: "Manage",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <Link className="block w-full" href={`/manage/orders/${id}`}>View</Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="text-red-500">
            <DeleteAction
              _id={id}
              queryKey="ORDER"
              mutationFn={deleteOrder}
              message="This category is referenced by other documents"
            />
          </DropdownMenuItem> */}
        </ActionDropdown>
      );
    },
  },
];
