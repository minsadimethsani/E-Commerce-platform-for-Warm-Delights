export default function ResetPasswordLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-[75vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-[#A47251]/10 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 animate-pulse">
        <div className="text-center space-y-3">
          <div className="h-3 w-32 bg-[#DD9E59]/40 mx-auto rounded-full" />
          <div className="h-8 w-44 bg-gray-300/60 mx-auto rounded" />
          <div className="h-3.5 w-52 bg-gray-200/60 mx-auto rounded" />
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-gray-200/60 rounded" />
            <div className="h-11 w-full bg-gray-200/60 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-32 bg-gray-200/60 rounded" />
            <div className="h-11 w-full bg-gray-200/60 rounded-xl" />
          </div>
        </div>

        <div className="h-12 w-full bg-[#A47251]/40 rounded-full" />
      </div>
    </div>
  );
}
