import {ReadonlyURLSearchParams} from "next/navigation";

export const getRange = (searchParams: ReadonlyURLSearchParams) => {
    const range = searchParams.get("range");
    if (!range) return;
    return range;
}