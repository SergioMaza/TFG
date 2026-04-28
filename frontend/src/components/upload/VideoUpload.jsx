import { useCallback, useRef, useMemo, useState } from "react";
import { Upload } from "lucide-react";

export default function VideoUpload({
  uploadedFile,
  setUploadedFile,
}) {
  const fileInputRef = useRef();
  const [isVertical, setIsVertical] = useState(false);

  // Abrir selector de archivos
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cuando se carga el video
  const handleVideoLoaded = (e) => {
    const { videoWidth, videoHeight } = e.target;
    setIsVertical(videoHeight > videoWidth);

  };

  // Cambiar archivo
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) setUploadedFile(file);
    },
    [setUploadedFile],
  );

  // URL del video (memoizado)
  const videoURL = useMemo(
    () => (uploadedFile ? URL.createObjectURL(uploadedFile) : null),
    [uploadedFile],
  );

  return (
    <section>
      {uploadedFile ? (
        <div className="flex flex-col items-center gap-4">
          {/* Info del video */}
          <div className="flex items-center justify-center w-full rounded-md space-x-2">
            <p
              className="truncate text-sm font-medium text-(--gray)"
              title={uploadedFile.name}
            >
              {uploadedFile.name}
            </p>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-sm font-semibold text-(--primary) hover:opacity-90 transition-colors duration-200 underline ps-2"
            >
              Cambiar
            </button>
          </div>

          {/* Video */}
          <video
            src={videoURL}
            controls
            className={`rounded-xl mx-auto ${isVertical ? "w-auto max-w-[320px]" : "w-full"}`}
            onLoadedMetadata={handleVideoLoaded}
          />
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length > 0) {
              handleFileChange({ target: { files: e.dataTransfer.files } });
              e.dataTransfer.clearData();
            }
          }}
          className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-(--primary) px-6 py-14 mb-8 cursor-pointer hover:bg-(--bg-extra-light) transition-colors"
        >
          <div className="flex max-w-120 flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-(--gray)" />
            <p className="text-lg font-bold leading-tight text-center">
              <span className="bg-(--gray) text-transparent bg-clip-text">
                Arrastra o selecciona un archivo
              </span>
            </p>
            <p className="text-sm font-normal text-(--gray) text-center">
              Archivos de video (mp4, mov, etc.)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </section>
  );
}
