import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Tasks<span className="brand-accent">Gen</span>
        </Link>
        <div className="navbar-links">
          <Link to="/create">New Project</Link>
          <Link to="/history">History</Link>
          <Link to="/status">Status</Link>
        </div>
      </div>
    </nav>
  );
}