import {dynamicClient} from "@/server/infrastructure/clients/sanity";

export const deleteBanner = async (_id: string) => {
    await dynamicClient.delete(_id);
};
