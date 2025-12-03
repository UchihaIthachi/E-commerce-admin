"use client";

import ActionDropdown from "@/app/manage/components/table/action-dropdown";
import EditAction from "@/app/manage/components/table/edit-action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { GetSizeDTO } from "@/server/application/common/dtos/size";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { trpc } from "@/lib/providers";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

// Define a new component for the delete action within the cell context
const SizeDeleteCellAction = ({ rowData }: { rowData: z.infer<typeof GetSizeDTO> }) => {
  const { _id, name } = rowData;
  const { toast } = useToast();
  const utils = trpc.useContext();

  const deleteSizeMutation = trpc.adminSize.delete.useMutation({
    onSuccess: (data) => {
      utils.adminSize.getAll.invalidate(); // Invalidate the list of sizes
      toast({
        title: "Success",
        description: `Size "${name}" (ID: ${data._id}) deleted successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || `Failed to delete size "${name}". It might be in use.`,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="link"
          className="text-red-500 p-0 h-auto hover:no-underline"
          onClick={(e) => e.stopPropagation()} // Prevents dropdown from closing on click
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the size
            &quot;{name}&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteSizeMutation.mutate({ _id })}
            disabled={deleteSizeMutation.isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            {deleteSizeMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
      return (
        <ActionDropdown>
          <DropdownMenuItem>
            <EditAction href={`/manage/attributes/sizes/${row.original._id}`} text="Edit" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-100"
            onSelect={(e) => e.preventDefault()} // Important to prevent dropdown from closing
          >
            <SizeDeleteCellAction rowData={row.original} />
          </DropdownMenuItem>
        </ActionDropdown>
      );
    },
  },
];
