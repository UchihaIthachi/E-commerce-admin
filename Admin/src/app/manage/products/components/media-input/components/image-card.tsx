/* eslint-disable @next/next/no-img-element */
import {cn} from "@/lib/utils";
import {Trash2Icon} from "lucide-react";

type ImageCardProps = {
  image: string;
  onDelete?: (id: string) => void;
};

function ImageCard({ image, onDelete }: ImageCardProps) {
  return (
    <div className="h-48 border relative rounded-lg">
      <img
        src={image}
        alt=""
        className={cn("block object-cover h-full rounded-lg")}
      />

      {onDelete && (
        <Trash2Icon
          width={24}
          height={24}
          onClick={() => onDelete(image)}
          className="absolute right-2 top-2 p-1 border cursor-pointer border-white rounded-md text-white"
        />
      )}
    </div>
  );
}

export default ImageCard;
