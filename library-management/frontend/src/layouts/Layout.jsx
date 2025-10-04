import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TopMenu from '../components/TopMenu';

const Layout = () => {
  return (
    <div>
      <div className="sticky top-0 z-50">
        <Navbar />
        <TopMenu />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
