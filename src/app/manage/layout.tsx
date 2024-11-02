import Navigation from "@/app/manage/components/navigation";
import {Toaster} from "@/components/ui/toaster";

export default function ManageLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1_4">
            <Navigation/>
            {children}
            <Toaster/>
        </div>
    );
}
