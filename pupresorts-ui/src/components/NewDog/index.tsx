import {useNavigate} from "react-router-dom";
import Button from "../../components/Button";
import {IconPaw} from "../../assets/IconPaw.tsx";
import {IconDog} from "../../assets/IconDog.tsx";
import './index.css';

export default function NewDog(){
    const navigate = useNavigate();

    return(
        <div className="general-div-newDog">
           <div className="NewDog-card-image">
               <IconDog size={144} color='var(--primary-500)' />
           </div>
            <div className="Newdog-card-buttons-container">
                <Button
                    className="add-dog-button"
                    variant="fulfilled"
                    rightIcon={IconPaw}
                    onClick={() => navigate("/new_dog")}
                >
                    Agregar perro
                </Button>
            </div>
        </div>
    )

}