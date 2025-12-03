import {dynamicClient} from "@/server/infrastructure/clients/sanity";

export const deleteGridItem = async (_id: string) => {
    await dynamicClient.delete(_id);
};
