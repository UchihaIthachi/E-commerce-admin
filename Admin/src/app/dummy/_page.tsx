"use client";

import { Button } from "@/components/ui/button";
import { patchClothes } from "./actions";

function Dummy() {
  return (
    <div className="p-4">
      <Button onClick={() => patchClothes()}>Execute</Button>
    </div>
  );
}

export default Dummy;
