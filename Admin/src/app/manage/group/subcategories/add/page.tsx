"use client";

import AddSubCategoryForm from "./../components/add-subcategory-form/add-subcategory-form";

function AddCategoriesPage() {
  return (
    <div>
      <h2 className="p-2">Subcategories</h2>
      <div className="p-4">
        <AddSubCategoryForm />
      </div>
    </div>
  );
}

export default AddCategoriesPage;
