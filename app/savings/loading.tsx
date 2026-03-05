export default function SavingsLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Header skeleton */}
      <div className="border-b-4 border-black bg-green-400 px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="h-4 w-16 bg-green-700 opacity-40" />
            <div className="h-12 w-40 bg-black opacity-20 mt-2" />
          </div>
          <div className="h-10 w-28 border-2 border-black bg-pink-400 opacity-60" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        {/* Current savings skeleton */}
        <div className="border-4 border-black bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          <div className="h-4 w-32 bg-green-700 opacity-40 mx-auto mb-3" />
          <div className="h-16 w-64 bg-black opacity-20 mx-auto animate-pulse" />
        </div>

        {/* Two panels skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
            >
              <div className="h-7 w-36 bg-black opacity-20 mb-2 animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 mb-4 animate-pulse" />
              <div className="h-12 border-2 border-black bg-gray-100 mb-3 animate-pulse" />
              <div className="h-12 border-2 border-black bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
