'use client';

import * as React from 'react';
import { HiXMark } from 'react-icons/hi2';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open = false, onOpenChange = () => {}, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = React.useContext(DialogContext);

  return <div onClick={() => onOpenChange(true)}>{children}</div>;
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={`relative z-50 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm text-slate-400 opacity-70 transition-opacity hover:opacity-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <HiXMark className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}

export function DialogHeader({ className = '', children }: DialogHeaderProps) {
  return (
    <div className={`mb-4 flex flex-col gap-2 text-center sm:text-left ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children }: DialogTitleProps) {
  return <h2 className={`${className}`}>{children}</h2>;
}

export function DialogDescription({ className = '', children }: DialogDescriptionProps) {
  return <p className={`text-sm text-slate-600 ${className}`}>{children}</p>;
}

export function DialogFooter({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className}`}>
      {children}
    </div>
  );
}

export function DialogClose({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = React.useContext(DialogContext);

  return <div onClick={() => onOpenChange(false)}>{children}</div>;
}

export const DialogPortal = ({ children }: { children: React.ReactNode }) => children;
export const DialogOverlay = ({ children }: { children?: React.ReactNode }) => children;
