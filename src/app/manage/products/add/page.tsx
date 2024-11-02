"use client";

import AddProductForm from "./components/add-product-form/add-product-form";

function AddProductPage() {
  return (
    <div>
      <h2 className="p-2">
        Add Product
      </h2>
      <div className="p-4">
        <AddProductForm />
      </div>
    </div>
  );
}

export default AddProductPage;
