import {AddProductDTO} from "@/server/application/common/dtos/cloth";
import {log} from "@/server/application/common/services/logging";
import {dynamicClient} from "@/server/infrastructure/clients/sanity";
import {deleteSize} from "@/server/infrastructure/repositories/attributes/size-repository";
import {z} from "zod";
import {createId} from "@paralleldrive/cuid2";

type AddProductCommand = z.infer<typeof AddProductDTO>;

export default async function createProductCommandHandler(
    command: AddProductCommand
) {
    const {name,sku ,description, price,discount, category, subcategory, variants, media, seo,enabled} = command;
    const cloth = {
        _id:createId(),
        _type: "cloth",
        name,
        sku,
        enabled,
        description,
        price,
        discount,
        category: {
            _type: "reference",
            _ref: category,
        },
        subcategory: {
            _type: "reference",
            _ref: subcategory,
        },
        seo: seo
    };
    const publishedCloth = await dynamicClient.create(cloth);

    const toPublishVariants = variants.map((variant) => {
        return dynamicClient.create({
            _id:createId(),
            _type: "variant",
            cloth: {
                _type: "reference",
                _ref: publishedCloth._id,
            },
            color: {
                _type: "reference",
                _ref: variant.color,
            },
            size: {
                _type: "reference",
                _ref: variant.size,
            },
            stock: variant.stock,
        });
    });
    const publishedVariants = await Promise.all(toPublishVariants);

    const toPublishMedia = media.map((mediaItem) => {
        return dynamicClient.create({
            _id:createId(),
            _type: "media",
            cloth: {
                _type: "reference",
                _ref: publishedCloth._id,
            },
            color: {
                _type: "reference",
                _ref: mediaItem.color,
            },
            images: mediaItem.images,
            default: mediaItem.isDefault,
        });
    });

    const publishedMedia = await Promise.all(toPublishMedia);
    log("INFO", "Successfully published cloth to Sanity")
}
