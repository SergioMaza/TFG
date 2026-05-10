export function GuideCard({ title, img, guide_url, commercial_name }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col group border border-(--bg-extra-light)">
      {/* IMAGE HEADER */}
      <div className="h-72 w-full relative">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-500"
        />

        <div className="absolute inset-0 bg-linear-to-t from-(--bg-light) to-transparent" />

        <div className="absolute bottom-4 left-6">
          <h4 className="text-2xl font-black">{commercial_name}</h4>
        </div>
      </div>

      {/* ACTION */}
      <div className="p-5">
        <a
          href={guide_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex justify-center items-center rounded-lg border border-(--primary) hover:opacity-90 transition-opacity px-4 py-3 text-sm font-semibold"
        >
          Ver guía completa
        </a>
      </div>
    </div>
  );
}
