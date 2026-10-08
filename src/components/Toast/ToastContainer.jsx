// ToastContainer.jsx - Container de toasts (toast.js vanilla via Context)

import { useApp } from '../../hooks/useApp.js';

export default function ToastContainer() {
  const { state } = useApp();
  return (
    <div className="toast-container" id="toastContainer">
      {state.toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}
