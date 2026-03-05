export default function BudgetLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Header skeleton */}
      <div className="border-b-4 border-black bg-pink-400 px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="h-4 w-16 bg-pink-600 opacity-40" />
            <div className="h-12 w-48 bg-black opacity-20 mt-2" />
          </div>
          <div className="h-10 w-28 border-2 border-black bg-green-400 opacity-60" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        {/* Add form skeleton */}
        <div className="border-4 border-black bg-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="h-7 w-32 bg-black opacity-20 mb-4" />
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-12 flex-1 border-2 border-black bg-white opacity-60" />
            <div className="h-12 w-36 border-2 border-black bg-white opacity-60" />
            <div className="h-12 w-24 border-2 border-black bg-green-400 opacity-60" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-4 border-black bg-pink-400 px-6 py-4 flex justify-between">
            <div className="h-4 w-16 bg-pink-600 opacity-40" />
            <div className="h-4 w-16 bg-pink-600 opacity-40" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-b-2 border-black px-6 py-4 flex justify-between items-center"
            >
              <div className="h-5 bg-gray-200 animate-pulse" style={{ width: `${100 + i * 40}px` }} />
              <div className="h-5 w-20 bg-gray-200 animate-pulse" />
            </div>
          ))}
          <div className="border-t-4 border-black bg-yellow-300 px-6 py-4 flex justify-between">
            <div className="h-6 w-16 bg-black opacity-20" />
            <div className="h-6 w-24 bg-black opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
