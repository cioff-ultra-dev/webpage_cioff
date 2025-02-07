import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-sm text-gray-500">Processing your order...</p>
      </div>
    </div>
  );
}
