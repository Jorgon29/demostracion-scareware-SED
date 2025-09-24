const isElectron = () => {
    return window.require && window.process && window.process.type;
};

const getNodeModules = () => {
    if (!window.require) return {};
    
    return {
        os: window.require('os'),
        fs: window.require('fs'),
        path: window.require('path'),
        childProcess: window.require('child_process'),
        Buffer: window.require('buffer').Buffer
    };
};

const cpuStress = () => {    
    if (isElectron()) {
        const { os, childProcess } = getNodeModules();
        const numCPUs = os ? os.cpus().length : navigator.hardwareConcurrency || 4;
        if (window.electronAPI && window.electronAPI.nativeCpuStress) {
            window.electronAPI.nativeCpuStress().then(result => {
                console.log('Native CPU stress started:', result);
            });
        } else {
            for (let i = 0; i < numCPUs; i++) {
                const worker = childProcess.spawn('node', ['-e', `
                    let counter = 0;
                    while (true) {
                        Math.pow(Math.random() * 1000000, Math.random() * 100);
                        Math.sqrt(Math.random() * 1000000000);
                        counter++;
                    }
                `], { 
                    detached: false,
                    stdio: 'pipe'
                });
                
                worker.stdout.on('data', (data) => {
                    console.log(`Native Worker ${i}:`, data.toString());
                });
            }
        }
    } else {
        const numWorkers = navigator.hardwareConcurrency || 4;
        
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                while (true) {
                    Math.random() * Math.random();
                }
            `], { type: 'application/javascript' })));
        }
    }
};

const memoryStressMultiWorker = () => {
    if (isElectron()) {
        const { os, Buffer, childProcess } = getNodeModules();
        const totalRAM = os ? Math.round(os.totalmem() / 1024 / 1024 / 1024) : 8;
        const electronMemoryStress = () => {
            window.electronMemoryHogs = window.electronMemoryHogs || [];
            let counter = 0;
            
            const fillMemory = () => {
                try {
                    const nativeBuffer = Buffer.alloc(200 * 1024 * 1024, Math.floor(Math.random() * 256)); // 200MB
                    window.electronMemoryHogs.push(nativeBuffer);
                    const bigArray = new Array(10000000);
                    for (let i = 0; i < bigArray.length; i++) {
                        bigArray[i] = {
                            id: i + counter * 10000000,
                            data: Math.random().toString(36).repeat(100),
                            timestamp: performance.now(),
                            buffer: Buffer.from(Math.random().toString(36))
                        };
                    }
                    window.electronMemoryHogs.push(bigArray);
                    const hugeString = 'x'.repeat(100 * 1024 * 1024);
                    window.electronMemoryHogs.push(hugeString);
                    const bigMap = new Map();
                    for (let i = 0; i < 2000000; i++) {
                        bigMap.set(`key_${i}_${Math.random()}`, {
                            buffer: Buffer.alloc(500, Math.floor(Math.random() * 256)),
                            timestamp: Date.now()
                        });
                    }
                    window.electronMemoryHogs.push(bigMap);
                    
                    counter++;
                    const memUsage = window.process ? window.process.memoryUsage() : null;
                    setTimeout(fillMemory, 10);
                    
                } catch (e) {
                    console.log('Electron Memory ran out:', e.message);
                }
            };
            
            fillMemory();
        };
        const numWorkers = os ? os.cpus().length : 4;
        for (let i = 0; i < numWorkers; i++) {
            childProcess.spawn('node', ['-e', `
                const arrays = [];
                let counter = 0;
                
                const fillMemory = () => {
                    try {
                        const Buffer = require('buffer').Buffer;
                        const bigBuffer = Buffer.alloc(150 * 1024 * 1024, ${i}); // 150MB per worker
                        const bigArray = new Array(5000000).fill().map(() => Math.random().toString(36));
                        const hugeString = 'worker${i}_'.repeat(10000000);
                        
                        arrays.push(bigBuffer, bigArray, hugeString);
                        counter++;
                        setImmediate(fillMemory);
                    } catch (e) {
                        console.log('Worker ${i} memory exhausted');
                    }
                };
                
                fillMemory();
            `], { detached: false, stdio: 'pipe' });
        }
        electronMemoryStress();
        
    } else {
        const numWorkers = navigator.hardwareConcurrency || 4;
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                const arrays = [];
                const fillMemory = () => {
                    try {
                        const bigArray = new Array(5000000).fill().map(() => Math.random().toString(36));
                        const hugeString = 'x'.repeat(25000000);
                        const buffer = new ArrayBuffer(50 * 1024 * 1024);

                        arrays.push(bigArray, hugeString, buffer);
                        fillMemory();
                    } catch (e) {
                        self.postMessage('Worker ${i} agotó memoria');
                    }
                };
                fillMemory();
            `], { type: 'application/javascript' })));

            worker.onmessage = (e) => console.log(e.data);
        }
    }
};
const diskStress = () => {
    if (window.electronAPI && window.electronAPI.diskStress) {
        const options = {
            fileSize: 200 * 1024 * 1024,
            numFiles: 20
        };
        
        window.electronAPI.diskStress(options).then(result => {
            if (result.error) {
                console.error('Disk stress error:', result.error);
            } else {
                console.log('Disk stress completed:', result.message);
            }
        });
 
        if (window.electronAPI.onDiskStressProgress) {
            window.electronAPI.onDiskStressProgress((event, data) => {
                console.log(`DP: ${data.current}/${data.total} - ${data.filename}`);
            });
        }
        
    } else {
        const { fs, path, os } = getNodeModules();
        if (!fs) {
            return;
        }
        
        const tempDir = path.join(os.tmpdir(), 'electron-stress-test');
        
        try {
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            let counter = 0;
            const createStressFiles = () => {
                try {
                    const filename = path.join(tempDir, `stress-${Date.now()}-${counter}.tmp`);
                    const bigData = Buffer.alloc(100 * 1024 * 1024, Math.floor(Math.random() * 256)); // 100MB
                    
                    fs.writeFileSync(filename, bigData);             
                    counter++;
                    if (counter < 30) {
                        setTimeout(createStressFiles, 1000);
                    } else {
                        console.log(`Disk stress completed: ${counter} files`);
                    }
                    
                } catch (e) {
                    console.error('Failed to create file:', e.message);
                }
            };
            
            createStressFiles();
            
        } catch (e) {
            console.error('disk stress failed:', e.message);
        }
    }
};

const domStress = () => {
    const multiplier = isElectron() ? 3 : 1;
    const elementsPerFrame = 1000 * multiplier;
    
    const createElements = () => {
        for (let i = 0; i < elementsPerFrame; i++) {
            const div = document.createElement('div');
            div.innerHTML = 'x'.repeat(1000);
            div.style.cssText = `
                position: absolute;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                width: ${Math.random() * 100}px;
                height: ${Math.random() * 100}px;
                background: hsl(${Math.random() * 360}, 100%, 50%);
                opacity: ${Math.random()};
                transform: rotate(${Math.random() * 360}deg);
            `;
            document.body.appendChild(div);
        }

        requestAnimationFrame(createElements);
    };

    createElements();
};

const animationStress = () => {
    const elements = [];
    const numElements = isElectron() ? 2000 : 1000;

    for (let i = 0; i < numElements; i++) {
        const div = document.createElement('div');
        div.style.cssText = `
            width: ${Math.random() * 50 + 10}px; 
            height: ${Math.random() * 50 + 10}px; 
            background: hsl(${Math.random() * 360}, 100%, 50%); 
            position: absolute;
            transition: all 0.05s;
            border-radius: ${Math.random() * 50}px;
            box-shadow: 0 0 ${Math.random() * 20}px rgba(255,255,255,0.5);
        `;
        document.body.appendChild(div);
        elements.push(div);
    }

    const animate = () => {
        elements.forEach(el => {
            el.style.left = Math.random() * window.innerWidth + 'px';
            el.style.top = Math.random() * window.innerHeight + 'px';
            el.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            el.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 2 + 0.5})`;
        });

        setTimeout(animate, isElectron() ? 5 : 10);
    };

    animate();
};
const eventStress = () => {  
    const button = document.createElement('button');
    button.textContent = 'Generador de eventos';
    button.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 10000; padding: 10px;';
    document.body.appendChild(button);

    const numListeners = isElectron() ? 20000 : 10000;
    
    for (let i = 0; i < numListeners; i++) {
        button.addEventListener('click', () => {
            console.log(`Event ${i} triggered at ${performance.now()}`);
            if (Math.random() < 0.1) {
                button.dispatchEvent(new Event('click'));
            }
        });
    }
    button.click();
};
const stackStress = () => {
    const recursiveFunction = (depth = 0, data = {}) => {
        data[`level_${depth}`] = new Array(100).fill(Math.random());
        return recursiveFunction(depth + 1, data);
    };

    try {
        recursiveFunction();
    } catch (e) {
        console.log('Stack overflow:', e.message);
    }
};

const crash = () => {   
    setTimeout(() => {
        cpuStress();
    }, 100);
    
    setTimeout(() => {
        memoryStressMultiWorker();
    }, 1000);
    
    setTimeout(() => {
        domStress();
    }, 2000);
    
    setTimeout(() => {
        animationStress();
    }, 3000);
    
    setTimeout(() => {
        eventStress();
    }, 4000);
    
    if (isElectron()) {
        setTimeout(() => {
            diskStress();
        }, 5000);
    }
};

const cleanup = () => {
    if (window.electronMemoryHogs) {
        delete window.electronMemoryHogs;
    }
    
    if (window.electronAPI && window.electronAPI.stopNativeWorkers) {
        window.electronAPI.stopNativeWorkers().then(result => {
            console.log(result.message);
        });
    }
    
    if (window.electronAPI && window.electronAPI.cleanupStressFiles) {
        window.electronAPI.cleanupStressFiles().then(result => {
            console.log(result.message);
        });
    }
    
    if (window.gc) {
        window.gc();
    }
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
};

window.stressFunctions = {
    cpuStress,
    memoryStressMultiWorker,
    diskStress,
    domStress,
    animationStress,
    eventStress,
    stackStress,
    crash,
    cleanup,
    isElectron
};

export default crash;
