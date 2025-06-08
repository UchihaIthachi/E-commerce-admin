"use client";

import AddGridItemForm from "../components/add-grid-item-form/add-grid-item-form";

function AddProductPage() {
    return (
        <div>
            <h2 className="p-2">
                Add Grid Item
            </h2>
            <div className="p-4">
                <AddGridItemForm/>
            </div>
        </div>
    );
}

export default AddProductPage;
