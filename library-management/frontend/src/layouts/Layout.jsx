import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TopMenu from '../components/TopMenu';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <TopMenu />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
