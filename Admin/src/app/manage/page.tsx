// src/app/manage/page.tsx
import { redirect } from "next/navigation";

const ManageRootPage = () => {
    return redirect("/manage/dashboard"); // Redirect to the new dashboard
};

export default ManageRootPage;
