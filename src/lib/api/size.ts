import {
    AddSizeDTO,
    GetSizeDTO,
    EditSizeDTO
  } from "@/server/application/common/dtos/size";
  import api from "./base";
  import { z } from "zod";

export const getSize = async (_id: string) => {
    const res = await api.get(`/api/attributes/sizes/${_id}`);
    const data = GetSizeDTO.parse(await res.json());
    return data;
  };

export const getSizes = async () => {
    const res = await api.get("/api/attributes/sizes");
    const data = GetSizeDTO.array().parse(await res.json());
    console.log(data);
    return data;
  };

export const addSize = async ({
    name,
  }: z.infer<typeof AddSizeDTO>) => {
    await api.post("/api/attributes/sizes", { json: { name } });
  };

export const updateSize = async ({
    _id,
    name,
  }: z.infer<typeof EditSizeDTO> & { _id: string }) => {
    await api.patch(`/api/attributes/sizes/${_id}`, { json: { name } });
  };

  export const deleteSize = async ({ _id }: { _id: string }) => {
    await api.delete(`/api/attributes/sizes/${_id}`);
  };