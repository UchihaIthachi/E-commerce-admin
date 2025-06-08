import { ChangeEvent, useId, useRef } from "react";
import { Card } from "@/components/ui/card";
import { PlusCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageInputProps = {
  onChange: (file: File) => void;
  className?: string;
};

function ImageInput({ onChange, className }: ImageInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    onChange(file);
    e.target.value = "";
  };

  const handleClick = () => {
    ref.current!.click();
  };

  return (
    <Card
      className={cn(
        "h-48 border relative flex justify-center items-center",
        className
      )}
      onClick={handleClick}
    >
      <label id={id} className="block text-xl"></label>
      <input
        name="image"
        id={id}
        type="file"
        accept="image/png, image/jpeg"
        ref={ref}
        onChange={handleFileChange}
        className="invisible absolute"
      />
      <PlusCircleIcon width={24} height={24} className="block cursor-pointer" />
    </Card>
  );
}

export default ImageInput;
