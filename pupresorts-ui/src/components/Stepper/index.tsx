import "./index.css";

import React from "react";

import {IconInfo} from "../../assets/IconInfo";
import {IconMedkit} from "../../assets/IconMedkit";
import {IconPayment} from "../../assets/IconPayment";
import {IconTick} from "../../assets/IconTick";

export type StepperVariant =
    | "reserva-step1"
    | "reserva-step2"
    | "dog-step1"
    | "dog-step2";

type SideState = "enabled" | "disabled";

const VARIANTS: Record<
    StepperVariant,
    { left: { icon: "info" | "tick"; state: SideState };
        right: { icon: "payment" | "medkit"; state: SideState };
        connectorOn: boolean; }
> = {
    "reserva-step1": {
        left:  { icon: "info",  state: "enabled"  },
        right: { icon: "payment", state: "disabled" },
        connectorOn: false,
    },
    "reserva-step2": {
        left:  { icon: "tick",  state: "enabled"  },
        right: { icon: "payment", state: "enabled"  },
        connectorOn: true,
    },
    "dog-step1": {
        left:  { icon: "info",  state: "enabled"  },
        right: { icon: "medkit", state: "disabled" },
        connectorOn: false,
    },
    "dog-step2": {
        left:  { icon: "tick",  state: "enabled"  },
        right: { icon: "medkit", state: "enabled"  },
        connectorOn: true,
    },
};

export interface StepperProps {
    variant: StepperVariant;
    size?: number;
    className?: string;
}

const TINTS = {
    enabled:  "var(--primary-500)",
    disabled: "var(--grey-300)",
};

export const Stepper: React.FC<StepperProps> = ({
                                                    variant,
                                                    size = 48,
                                                    className = "",
                                                }) => {
    const cfg = VARIANTS[variant];

    const renderIcon = (which: "left" | "right") => {
        const side = cfg[which];
        const color = TINTS[side.state];

        switch (side.icon) {
            case "info":
                return <IconInfo size={size} color={color} />;
            case "tick":
                return <IconTick size={size} color={color} />;
            case "payment":
                return <IconPayment size={size} color={color} />;
            case "medkit":
                return <IconMedkit size={size} color={color} />;
        }
    };

    return (
        <div className={`stepper ${variant} ${className}`}>
            {renderIcon("left")}

            <div className={`step-connector ${cfg.connectorOn ? "on" : "off"}`} />

            {renderIcon("right")}
        </div>
    );
};

export default Stepper;
