// Loading state for COE Trends page
// This provides a Suspense boundary for the client component that uses new Date()
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
