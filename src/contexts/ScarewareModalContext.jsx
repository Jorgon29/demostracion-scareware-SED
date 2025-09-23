import { createContext, useState } from "react";

export const ScarewareModalContext = createContext();

export const ScarewareProvider = ({children}) => {
    const [showModal, setShowModal] = useState(false);
    
    return (
        <ScarewareModalContext.Provider value={{ showModal, setShowModal }}>
            {children}
        </ScarewareModalContext.Provider>
    );
}