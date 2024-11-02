import {
    AddColorDTO,
    GetColorDTO,
    EditColorDTO
  } from "@/server/application/common/dtos/color";
  import api from "./base";
  import { z } from "zod";

export const getColor = async (_id: string) => {
    const res = await api.get(`/api/attributes/colors/${_id}`);
    const data = GetColorDTO.parse(await res.json());
    return data;
  };

export const getColors = async () => {
    const res = await api.get("/api/attributes/colors");
    const data = GetColorDTO.array().parse(await res.json());
    return data;
  };

export const addColor = async ({
    name,
    hex,
  }: z.infer<typeof AddColorDTO>) => {
    await api.post("/api/attributes/colors", { json: { name, hex } });
  };

export const updateColor = async ({
    _id,
    name,
    hex,
  }: z.infer<typeof EditColorDTO> & { _id: string }) => {
    await api.patch(`/api/attributes/colors/${_id}`, { json: { name, hex } });
  };

  export const deleteColor = async ({ _id }: { _id: string }) => {
    await api.delete(`/api/attributes/colors/${_id}`);
  };