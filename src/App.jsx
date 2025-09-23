
import './App.css'
import DownloadButton from './components/downloadButton/downloadButton.jsx';
import ScarewareModal from './components/scarewareModal/scarewareModal.jsx';
import { ScarewareProvider } from './contexts/ScarewareModalContext.jsx';

function App() {
  return (
    <ScarewareProvider>
        <h1>
          ElCheros
        </h1>
        <h3>
          Descargar GTA6 completo PC
        </h3>
      <DownloadButton />
      <ScarewareModal />
    </ScarewareProvider>
  );
}

export default App
