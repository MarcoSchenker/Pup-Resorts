import './index.css'
import logo from "../../assets/logobig.png";
import Button from "../../components/Button";
import {useNavigate} from "react-router-dom";

export const LandingPage = () => {

    const navigate = useNavigate();

    return (
        <div className= "landing-general-div">
            <div>
        <div className="landing-header">
            <img className= "logo-landing" alt="logo" src={logo}/>
            <h4 className="landing-city"> Buenos Aires, Argentina </h4>
        </div>
        <div className="landing-frame">
            <p className="landing-title">¡El futuro del alojamiento perruno ya llegó!</p>
            <div className="landing-buttons-container">
                <Button
                    className="Register-Button"
                    variant="fulfilled"
                    type="button"
                    size="large"
                    onClick={()=> { navigate("/register")}}
                >
                    Registrarse
                </Button>
                <Button
                    className="Login-Button"
                    variant="outlined"
                    type="button"
                    size="large"
                    onClick={() => { navigate("/login")}}
                >
                    Iniciar sesión
                </Button>
            </div>
            </div>
            </div>
        </div>
    )
}

export default LandingPage;