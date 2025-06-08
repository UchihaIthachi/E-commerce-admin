"use client";

import AddSizeForm from "./components/add-size-form";

function AddSizesPage() {
  return (
    <div>
      <h2 className="p-2">Sizes</h2>
      <div className="p-4">
        <AddSizeForm />
      </div>
    </div>
  );
}

export default AddSizesPage;