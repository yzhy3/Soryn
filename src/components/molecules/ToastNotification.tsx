import React from 'react';
import { StatusDot } from '../atoms/StatusDot';

type ToastNotificationProps = {
  message: string;
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => (
  <div
    role="status"
    className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-md flex items-center gap-2"
  >
    <StatusDot className="bg-sky-400" />
    <span>{message}</span>
  </div>
);
