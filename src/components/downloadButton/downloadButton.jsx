import style from "./downloadButton.module.css";
import image from "../../assets/downward-arrow.svg";
import { useContext } from "react";
import { ScarewareModalContext } from "../../contexts/ScarewareModalContext.jsx";

function DownloadButton(){
    const {showModal, setShowModal} = useContext(ScarewareModalContext)
    return (
        <button className={style.download_button}
         onClick={() => setShowModal(true)}>
            <div className={style.downward_container}>
                <img src={image} alt="Downward arrow"/>
            </div>
            <h2>Download now!</h2>
        </button>
    );
}

export default DownloadButton;