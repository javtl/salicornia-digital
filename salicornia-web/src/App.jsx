import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Pages (cuando existan)
// import Home from './pages/Home';
// import Infra from './pages/Infra';
// ... más pages

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<h1>Dashboard - En construcción</h1>} />
          {/* Más rutas aquí */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
