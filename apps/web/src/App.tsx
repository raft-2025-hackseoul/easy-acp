import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WorkflowProvider } from './context/WorkflowContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { APIValidatorPage } from './pages/APIValidatorPage';
import { PSPConnectorPage } from './pages/PSPConnectorPage';
import { ProductFeedPage } from './pages/ProductFeedPage';
import { AISEOPage } from './pages/AISEOPage';
import './App.css';

function App() {
  return (
    <Router>
      <WorkflowProvider>
        <div className="App">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/api-validator" element={<APIValidatorPage />} />
              <Route path="/psp-connector" element={<PSPConnectorPage />} />
              <Route path="/product-feed" element={<ProductFeedPage />} />
              <Route path="/ai-seo" element={<AISEOPage />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>
              Built for merchants | <a href="#docs">Documentation</a> |{' '}
              <a href="#support">Support</a>
            </p>
          </footer>
        </div>
      </WorkflowProvider>
    </Router>
  );
}

export default App;
