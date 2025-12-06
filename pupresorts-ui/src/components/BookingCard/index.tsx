import './index.css';

import React from 'react';
import {IconBooking} from "../../assets/IconBooking.tsx";
import {IconBookingHouse} from "../../assets/IconBookingHouse.tsx";
import {IconTime} from "../../assets/IconTime.tsx";
import {IconLocation} from "../../assets/IconLocation.tsx";
import TextWithIcon from "../TextWithIcon";
import Button from "../Button";
import {useNavigate} from "react-router-dom";

export interface BookingDTO {
    id: string;
    dogId: string;
    dogName?: string;
    startDate: string;
    endDate: string;
    hotelBranch: string;
}

interface BookingCardProps {
    booking?: BookingDTO;
}

export const Date = (dates: string): string => {
    if (!dates) return "";
    return dates.slice(5, 10).split("-").reverse().join("/");
};

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
    const navigate = useNavigate()

    if (!booking) {
        return (
            <div className="booking-card-container booking-card--empty">
                <div className="booking-empty-content">
                    <div className="booking-empty-logo">
                    <IconBookingHouse size={136} color='var(--primary-500)'/>
                    </div>
                    <div className="booking-empty-button-container">
                    <Button
                        className="Book-Button"
                        variant="fulfilled"
                        type="button"
                        size="large"
                        rightIcon={IconBooking}
                        onClick={() => navigate("/booking/new")}
                    >
                        Reservar
                    </Button>
                    </div>
                </div>
            </div>
        );
    }

    const { dogName, startDate, endDate, hotelBranch, dogId } = booking;

    const handleRepeat = () => {
        const params = new URLSearchParams({
            dogId,
            hotelBranch,
        });
        navigate(`/booking/new?${params.toString()}`);
    };


    return (
        <div className="booking-card-container">
            <div className="booking-info-container">
                <h3 className="dog-name">{dogName ?? "Reserva"}</h3>
                <div className="booking-info">
                    <TextWithIcon icon={IconTime} text={`${Date(startDate)} - ${Date(endDate)}`} size={16} color='var(--primary-900)'/>
                    <TextWithIcon icon={IconLocation} text={hotelBranch} size={16} color='var(--primary-900)'/>
                </div>
            </div>

            <div className="booking-card-button-container">
                <Button
                    className="Repeat-Button"
                    variant="fulfilled"
                    type="button"
                    size="large"
                    rightIcon={IconBooking}
                    onClick={handleRepeat}
                >
                    Repetir reserva
                </Button>
            </div>
        </div>
    );
};

export default BookingCard;