"use client";

import { GetCartItemDTO } from "@/server/application/common/dtos/cart-item";
import { GetOrderDTO } from "@/server/application/common/dtos/order";
import { CartItem } from "@/server/application/common/dtos/schemas";
import { ColumnDef } from "@tanstack/react-table";
import * as z from "zod";

export const columns: ColumnDef<z.infer<typeof GetCartItemDTO>>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "count",
    header: "Amount",
  },
];
