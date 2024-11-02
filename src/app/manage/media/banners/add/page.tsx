"use client";

import AddBannerForm from "../components/add-banner-form/add-banner-form";

function AddProductPage() {
    return (
        <div>
            <h2 className="p-2">
                Add Banner
            </h2>
            <div className="p-4">
                <AddBannerForm/>
            </div>
        </div>
    );
}

export default AddProductPage;
