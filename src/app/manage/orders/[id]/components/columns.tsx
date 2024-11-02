"use client";

import { GetOrderDTO } from "@/server/application/common/dtos/order";
import { CartItem } from "@/server/application/common/dtos/schemas";
import { ColumnDef } from "@tanstack/react-table";
import * as z from "zod";

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
    accessorKey: "order_status",
    header: "Status",
  },
  {
    accessorKey: "payment_status",
    header: "Payment Status",
  },
];
