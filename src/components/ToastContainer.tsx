import { useStore } from '../context/StoreContext';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { ToastType } from '../types';

const icons: Record<ToastType, typeof CheckCircle> = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const colors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};
const iconColors: Record<ToastType, string> = {
  success: 'text-green-500', error: 'text-red-500', warning: 'text-amber-500', info: 'text-blue-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in ${colors[toast.type]}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
