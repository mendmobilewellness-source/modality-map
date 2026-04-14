import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Admin from './pages/Admin';
import ForBusinesses from './pages/ForBusinesses';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/for-businesses" element={<ForBusinesses />} />
      </Routes>
    </BrowserRouter>
  );
}
