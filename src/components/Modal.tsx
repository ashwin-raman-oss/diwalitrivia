import type { ReactNode } from 'react';

interface Props {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, actions, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{title}</h2>
        {children}
        <div className="modal__actions">{actions}</div>
      </div>
    </div>
  );
}
