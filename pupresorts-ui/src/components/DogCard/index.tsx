import './index.css';

import React, {useState} from 'react';

import {IconAge} from "../../assets/IconAge.tsx";
import {IconBreed} from "../../assets/IconBreed.tsx";
import {IconDog} from "../../assets/IconDog.tsx";
import {IconEdit} from "../../assets/IconEdit.tsx";
import {IconTrash} from "../../assets/IconTrash.tsx";
import Button from "../Button";
import TextWithIcon from "../TextWithIcon";
import {toast} from "react-toastify";
import Modal from "../Modal";
import {deleteDog} from "../../api/api.ts";
//import type {IconProps} from "../../utils/types.ts";

export interface DogCardProps {
    id: string;
    name: string;
    age: number;
    breed: string;
    imageUrl: string | null;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const DogCard: React.FC<DogCardProps> = ({
                                                    id,
                                                    name,
                                                    age,
                                                    breed,
                                                    imageUrl,
                                                    onEdit,
                                                    onDelete,
                                                }) => {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = () => setOpen(true);

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            if (id) await deleteDog(id);
            if (onDelete) onDelete(id);
            toast("Perro eliminado correctamente", { type: "success" });
        } catch (err) {
            toast("Ocurrió un error al eliminar el perro", { type: "error" });
        } finally {
            setDeleting(false);
            setOpen(false);
        }
    };

    return (
        <>
        <div className="dog-card-container">
            <div className="dog-card-image">
                {imageUrl ? (
                    <img
                        className="dog-card-img"
                        src={imageUrl}
                        alt="image"
                    />
                ) : (
                    <IconDog size={144} color='var(--primary-500)'/>
                )}
            </div>
            <div className="dog-info-container">
                <div className="dog-info">
                    <h3 className="dog-name">{name}</h3>

                    <TextWithIcon icon={IconAge} text={`${age} ${age === 1 ? "año" : "años"}`} size={16} color='var(--primary-900)'/>
                    <TextWithIcon icon={IconBreed} text={breed} size={16} color='var(--primary-900)'/>

                </div>

                <div className="dog-card-buttons-container">
                    <Button
                        className="Edit-Button"
                        type="button"
                        size="rounded"
                        variant="fulfilled"
                        rightIcon={IconEdit}
                        onClick={() => onEdit && onEdit(id)}
                    />
                    <Button
                        className="Delete-Button"
                        type="button"
                        size="rounded"
                        variant="fulfilled"
                        rightIcon={IconTrash}
                        onClick={handleDeleteClick}
                        disabled={deleting}
                    />
                </div>
            </div>
        </div>

        <Modal
            open={open}
            title="Eliminar perro"
            subtitle={`¿Estás seguro de que querés eliminar a ${name}?`}
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            onConfirm={handleConfirmDelete}
            onCancel={() => setOpen(false)}
            />
        </>
    );
};

export default DogCard;
