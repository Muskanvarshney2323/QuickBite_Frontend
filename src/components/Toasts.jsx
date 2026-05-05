import { useToast } from '../store/toast';

export default function Toasts() {
  const items = useToast((s) => s.items);
  return (
    <div className="toast-wrap">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.type === 'default' ? '' : t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
