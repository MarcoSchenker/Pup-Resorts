import Stepper from "../Stepper";

export interface HeroProps {
    stepVariant: "dog-step1" | "dog-step2" |"reserva-step1" | "reserva-step2";
    Title?: string;
    SubTitle?: string;
}

export function Hero({stepVariant, Title, SubTitle}: HeroProps) {
    return (
        <div className="hero">
            <Stepper variant={stepVariant}/>
            <h2 className="section-title">{Title}</h2>
            <p className="section-subtitle">{SubTitle}</p>
        </div>
    );
}

export default Hero;