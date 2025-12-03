"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"; // Keep for potential client-side confirmations/errors
// @ts-ignore
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog"; // For confirmation

type DeleteActionProps = {
  _id: string;
  action: (formData: FormData) => Promise<{ message?: string; errors?: any }>; // Server action
  itemName?: string; // Optional: for more specific confirmation messages
};

function SubmitButton({ itemName }: { itemName?: string }) {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction
      type="submit"
      disabled={pending}
      className="bg-red-500 hover:bg-red-600"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Delete"
      )}
    </AlertDialogAction>
  );
}

function DeleteAction({ _id, action, itemName }: DeleteActionProps) {
  const { toast } = useToast(); // Toast can be used by parent form if useFormState is used there

  // This component now focuses on rendering the form and confirmation
  // The actual server action logic, revalidation, and primary feedback
  // are handled by the server action itself and potentially useFormState on the calling page.

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={"link"}
          type="button" // Important: not a submit button for an outer form
          className="text-red-500 p-0 h-auto hover:no-underline"
          // onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing if needed
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            {itemName ? ` ${itemName}` : " item"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <form action={action} className="flex items-center"> {/* Use flex to align items if needed */}
            <input type="hidden" name="_id" value={_id} />
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div className="ml-2"> {/* Add margin if needed */}
             <SubmitButton itemName={itemName} />
            </div>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAction;
