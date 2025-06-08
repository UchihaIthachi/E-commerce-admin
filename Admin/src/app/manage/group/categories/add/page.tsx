"use client";

import AddCategoryForm from "./../components/add-category-form/add-category-form";

function AddCategoriesPage() {
  return (
    <div>
      <h2 className="p-2">Categories</h2>
      <div className="p-4">
        <AddCategoryForm />
      </div>
    </div>
  );
}

export default AddCategoriesPage;
