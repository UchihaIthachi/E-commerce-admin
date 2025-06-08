"use client";

import Link from "next/link";

function EditAction({ href, text }: { href: string; text: string }) {
  return (
    <Link className="text-orange-500 block w-full" href={href}>
      {text}
    </Link>
  );
}

export default EditAction;
