import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { Button, Icon } from "../../components/UiKit";
import { useContext } from "react";
import { ImgFileContext } from "./join";
import CloseIcon from "@mui/icons-material/Close";

export default function JoinProfile({
  navigation,
}: {
  navigation: {
    goBack: () => void;
    moveOn: () => void;
  };
}) {
  const { imgFile } = useContext(ImgFileContext);

  return (
    <div className="flex flex-col justify-center gap-5">
      <ImageViewer />
      <CancelImgSelectionButton />

      <Button
        onClick={async (e) => {
          e.preventDefault();
          navigation.moveOn();
        }}
      >
        {imgFile ? "Next" : "Maybe later"}
      </Button>
    </div>
  );
}

const CancelImgSelectionButton = () => {
  const { imgFile, setImgFile } = useContext(ImgFileContext);

  if (!imgFile) {
    return null;
  }

  return (
    <div
      className="group mb-3 flex cursor-pointer items-center self-center text-sm"
      onClick={() => setImgFile(undefined)}
    >
      <Icon IconRef={CloseIcon} size="sm" />
      <span className="ml-2 opacity-50">Don't use this photo</span>
    </div>
  );
};

const ImageViewer = ({}) => {
  return (
    <div className="rounded-xl [transition:box-shadow_0.3s,border_0.3s] hover:shadow-[0px_0px_30px_5px_rgba(59,130,246,0.1)]">
      <label
        htmlFor="img-input"
        className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-border_s bg-transparent shadow-[30px_30px_200px_0px_rgba(0,255,194,0.1),-30px_-30px_200px_0px_rgba(143,0,255,0.1)] [transition:box-shadow_0.3s,border_0.3s]
        hover:border-border_p "
      >
        <ImageSelected />
        <ImageSelector />
      </label>
    </div>
  );
};

const ImageSelector = () => {
  const { imgFile, setImgFile } = useContext(ImgFileContext);

  return (
    <>
      <div
        className={`${
          imgFile && "opacity-0 hover:opacity-100"
        } group absolute flex min-h-full min-w-full flex-col items-center justify-center bg-bg_primary_trans backdrop-blur-xl [transition:opacity_0.3s]`}
      >
        <span className="mb-4 font-bold">
          {imgFile
            ? "Select another profile picture"
            : "Select your profile picture"}
        </span>
        <Icon IconRef={AddAPhotoIcon} iconFontSize={24} size="xl" />
      </div>

      <input
        className="absolute hidden h-full w-full"
        type="file"
        hidden
        id="img-input"
        accept=".jpeg, .png, .jpg"
        onChange={(e) =>
          setImgFile(e.target.files ? e.target.files[0] : undefined)
        }
      />
    </>
  );
};

const ImageSelected = () => {
  const { imgFile } = useContext(ImgFileContext);

  if (!imgFile) {
    return null;
  }

  return (
    <>
      <img
        className="absolute min-h-full min-w-full object-cover opacity-20"
        src={URL.createObjectURL(imgFile)}
      />
      <img
        className="min-h-full min-w-full rounded-full object-cover"
        src={URL.createObjectURL(imgFile)}
      />
    </>
  );
};
