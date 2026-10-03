export default function GalleryLoading() {
  return (
    <div className="container-page pt-28 sm:pt-36" aria-busy="true" aria-label="Chargement de la galerie">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton mt-8 h-14 w-2/3 max-w-xl rounded-lg" />
      <div className="skeleton mt-5 h-4 w-72 rounded" />
      <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="skeleton aspect-[3/2] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
