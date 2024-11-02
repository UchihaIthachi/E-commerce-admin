import {redirect} from "next/navigation";

const HomePage = () => {
    return redirect("/manage/products")
};

export default HomePage;
