export default function LoadingSpinner({ label = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}