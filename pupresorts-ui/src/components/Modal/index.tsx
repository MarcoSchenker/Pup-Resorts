import React, {useEffect} from 'react';
import Button from "../Button";
import './index.css';
import {IconCross} from "../../assets/IconCross.tsx";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    subtitle: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
}

const Modal: React.FC<ConfirmModalProps> = ({
                                                       open,
                                                       title,
                                                       subtitle,
                                                       confirmLabel = "Confirmar",
                                                       cancelLabel = "Cancelar",
                                                       onConfirm,
                                                       onCancel,
                                                       closeOnOverlayClick = true,
                                                       closeOnEsc = true,
                                                   }) => {

    useEffect(() => {
        if (!open || !closeOnEsc) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, closeOnEsc, onCancel]);

    if (!open) return null;

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => {
                if (!closeOnOverlayClick) return;
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div className="modal">
                <button
                    type="button"
                    aria-label="Cerrar"
                    className="modal-close"
                    onClick={onCancel}
                >
                    <IconCross size={20} color="var(--grey-700)" />
                </button>
                <h5 className="modal-title">{title}</h5>
                <p className="modal-subtitle body-2">{subtitle}</p>

                <div className="modal-buttons-container">
                    <Button
                        className="Cancel-Button"
                        type="button"
                        variant="outlined"
                        size="medium"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        className="Confirm-Button"
                        type="button"
                        variant="fulfilled"
                        size="medium"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
