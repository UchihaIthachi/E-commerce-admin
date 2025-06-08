"use client";

import AddColorForm from "./components/add-color-form";

function AddColorsPage() {
  return (
    <div>
      <h2 className="p-2">Colors</h2>
      <div className="p-4">
        <AddColorForm />
      </div>
    </div>
  );
}

export default AddColorsPage;