import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  BookmarkCheck, 
  PlusCircle, 
  QrCode, 
  Shield, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Layers,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'all';

  const isAllEventsActive = location.pathname === '/dashboard' && (activeTab === 'all' || !searchParams.has('tab'));
  const isBookedEventsActive = (location.pathname === '/dashboard' && activeTab === 'booked') || location.pathname === '/booked-events';
  const isClubCurrentEventsActive = location.pathname === '/dashboard' || location.pathname === '/current-events';
  const isCreateEventActive = location.pathname === '/create-event';
  const isScannerActive = location.pathname === '/scanner';

  // Admin nav active states (Requirement 2)
  const isAdminCurrentClubsActive = 
    (location.pathname === '/admin/dashboard' && activeTab !== 'create') ||
    location.pathname.startsWith('/admin/clubs') ||
    location.pathname === '/manage-clubs';
  const isAdminCreateClubActive = 
    (location.pathname === '/admin/dashboard' && activeTab === 'create') ||
    location.pathname === '/create-club';

  const getLinkClass = (isActive) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm shadow-primary/20'
        : 'text-gray-300 hover:text-white hover:bg-white/5'
    }`;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-surface/70 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link 
          to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
          onClick={closeMenu}
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white hover:opacity-90 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <TicketIcon className="w-5 h-5 text-white" />
          </div>
          <span>Ticke<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Go</span></span>
        </Link>

        {user && (
          <>
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* ================= CLUB / DEPARTMENT NAV OPTIONS (Requirement 2) ================= */}
              {user.role === 'club' ? (
                <>
                  {/* Option 1: Current Events */}
                  <Link 
                    to="/dashboard" 
                    className={getLinkClass(isClubCurrentEventsActive && !isCreateEventActive && !isScannerActive)}
                  >
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Current Events</span>
                  </Link>

                  {/* Option 2: Create Event */}
                  <Link 
                    to="/create-event" 
                    className={getLinkClass(isCreateEventActive)}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Create Event</span>
                  </Link>

                  {/* Option 3: Verify Tickets */}
                  <Link 
                    to="/scanner" 
                    className={getLinkClass(isScannerActive)}
                  >
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <span>Verify Tickets</span>
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                /* ================= ADMIN / ORGANIZATION NAV OPTIONS (Requirement 2) ================= */
                <>
                  {/* Option 1: Current Clubs (default) */}
                  <Link 
                    to="/admin/dashboard" 
                    className={getLinkClass(isAdminCurrentClubsActive)}
                  >
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Current Clubs</span>
                  </Link>

                  {/* Option 2: Create Club */}
                  <Link 
                    to="/admin/dashboard?tab=create" 
                    className={getLinkClass(isAdminCreateClubActive)}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Create Club</span>
                  </Link>

                  {/* Option 3: Verify Tickets */}
                  <Link 
                    to="/scanner" 
                    className={getLinkClass(isScannerActive)}
                  >
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <span>Verify Tickets</span>
                  </Link>
                </>
              ) : (
                /* ================= STUDENT NAV OPTIONS ================= */
                <>
                  <Link 
                    to="/dashboard?tab=all" 
                    className={getLinkClass(isAllEventsActive)}
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>All Events</span>
                  </Link>

                  <Link 
                    to="/dashboard?tab=booked" 
                    className={getLinkClass(isBookedEventsActive)}
                  >
                    <BookmarkCheck className="w-4 h-4 text-secondary" />
                    <span>Booked Events</span>
                  </Link>
                </>
              )}
            </div>

            {/* Desktop User Profile & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-white max-w-[130px] truncate">
                  {user.role === 'club' ? (user.clubName || user.name) : user.name}
                </span>
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  {user.role}
                </span>
              </div>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 text-sm font-medium transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-surface/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 text-xs text-gray-400">
            <span>Signed in as <strong className="text-white">{user.role === 'club' ? (user.clubName || user.name) : user.name}</strong></span>
            <span className="uppercase px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
              {user.role}
            </span>
          </div>

          {user.role === 'club' ? (
            <>
              {/* Option 1: Current Events */}
              <Link 
                to="/dashboard" 
                onClick={closeMenu}
                className={`${getLinkClass(isClubCurrentEventsActive && !isCreateEventActive && !isScannerActive)} w-full`}
              >
                <Layers className="w-4 h-4 text-primary" />
                <span>Current Events</span>
              </Link>

              {/* Option 2: Create Event */}
              <Link 
                to="/create-event" 
                onClick={closeMenu}
                className={`${getLinkClass(isCreateEventActive)} w-full`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Create Event</span>
              </Link>

              {/* Option 3: Verify Tickets */}
              <Link 
                to="/scanner" 
                onClick={closeMenu}
                className={`${getLinkClass(isScannerActive)} w-full`}
              >
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Verify Tickets</span>
              </Link>
            </>
          ) : user.role === 'admin' ? (
            <>
              {/* Option 1: Current Clubs (default) */}
              <Link 
                to="/admin/dashboard" 
                onClick={closeMenu}
                className={`${getLinkClass(isAdminCurrentClubsActive)} w-full`}
              >
                <Layers className="w-4 h-4 text-primary" />
                <span>Current Clubs</span>
              </Link>

              {/* Option 2: Create Club */}
              <Link 
                to="/admin/dashboard?tab=create" 
                onClick={closeMenu}
                className={`${getLinkClass(isAdminCreateClubActive)} w-full`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Create Club</span>
              </Link>

              {/* Option 3: Verify Tickets */}
              <Link 
                to="/scanner" 
                onClick={closeMenu}
                className={`${getLinkClass(isScannerActive)} w-full`}
              >
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Verify Tickets</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/dashboard?tab=all" 
                onClick={closeMenu}
                className={`${getLinkClass(isAllEventsActive)} w-full`}
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>All Events</span>
              </Link>

              <Link 
                to="/dashboard?tab=booked" 
                onClick={closeMenu}
                className={`${getLinkClass(isBookedEventsActive)} w-full`}
              >
                <BookmarkCheck className="w-4 h-4 text-secondary" />
                <span>Booked Events</span>
              </Link>
            </>
          )}

          <div className="pt-2">
            <button 
              onClick={() => { closeMenu(); handleLogout(); }} 
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
