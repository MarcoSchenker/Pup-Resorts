import "./index.css"

import {useNavigate} from "react-router-dom";

import Button from "../../components/Button";

export default function NotFound(){
    const navigate = useNavigate();

    return (
        <div className="general-div-NotFound">
            <img className="NotFound-Image" alt="Not Found" src={"NotFoundImage.png"}/>
            <div className="texts-container-NotFound">
                <h4>
                    Oops!
                </h4>
                <h5>
                    Esa página no existe.
                </h5>
            </div>
            <Button
                className="NotFound-button"
                variant="outlined"
                type="submit"
                size="medium"
                onClick={() => {navigate("/home")  }}
            >
                Ir al inicio
            </Button>
        </div>

    )
}