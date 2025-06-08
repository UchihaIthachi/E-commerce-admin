import api from "./base";

export const putImage = async ({ file }: { file: File }) => {
  const res = await fetch("/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileType: file.type,
    }),
  });

  const data = await res.json();
  const { url, publicURL }: { url: string; publicURL: string } = data;

  const upload = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  return publicURL;
};

export const deleteImage = async ({ id }: { id: string }) => {
  const res = await api.delete(`/api/image?id=${id}`);
  const { url }: { url: string } = await res.json();

  await fetch(url, {
    method: "DELETE",
  });
};
