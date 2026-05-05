import { useToast } from "../store/toast";

// Toast popup component
export default function Toasts() {
  const items = useToast((state) => state.items);
  const remove = useToast((state) => state.remove);

  return (
    <div className="toast-wrap">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type}`}
          onClick={() => remove(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}