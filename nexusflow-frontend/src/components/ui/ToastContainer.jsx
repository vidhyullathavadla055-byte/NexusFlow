import { useContext } from "react";
import { ToastContext } from "../../context/ToastContext";
import "./ToastContainer.css";

function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {ctx.toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="status">
          <span className="toast-message">{t.message}</span>
          <button type="button" className="toast-dismiss" onClick={() => ctx.dismiss(t.id)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
