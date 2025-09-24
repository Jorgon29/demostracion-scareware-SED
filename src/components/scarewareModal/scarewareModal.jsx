import { useContext } from "react";
import { ScarewareModalContext } from "../../contexts/ScarewareModalContext.jsx";
import style from "./scarewareModal.module.css";
import warning from "../../assets/warning.svg";
import crash from "./stress.js";

function ScarewareModal(){
    const {showModal, setShowModal} = useContext(ScarewareModalContext);
    
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };
    
    return (
        <>
            {showModal && 
                <div className={style.modal_overlay} onClick={handleOverlayClick}>
                    <div className={style.modal_content}>
                        <h1>
                            Your computer has been infected!!
                        </h1>
                        <div className={style.warning_container}>
                            <img src={warning} alt="warning icon"/>
                        </div>
                        <h2>
                            Security scan completed with critical findings. System integrity may be compromised. Follow the instructions to resolve this issue.
                        </h2>
                        <button className={style.scareware_button} onClick={() => {crash()}}>
                            Click me!
                        </button>
                    </div>
                </div>
            }
        </>
    );
}

export default ScarewareModal;