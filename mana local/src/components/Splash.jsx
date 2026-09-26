import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiBriefcase, HiUserAdd, HiOfficeBuilding } from 'react-icons/hi';
import logo from '../assets/logo.png';
import './Splash.css';

export default function Splash() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0); // 0: init, 1: logo in, 2: limbs pop, 3: fade out
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we've already shown the splash in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Sequence timing
    // 0ms: init (logo small/invisible)
    // 100ms: logo fades and scales in
    const t1 = setTimeout(() => setPhase(1), 100);
    
    // 1000ms: limbs pop out
    const t2 = setTimeout(() => setPhase(2), 800);
    
    // 4500ms: start fading entire screen out
    const t3 = setTimeout(() => setPhase(3), 4500);

    // 5000ms: unmount splash completely
    const t4 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('hasSeenSplash', 'true');
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!visible) return null;

  const handleLimbClick = (path) => {
    setPhase(3); // start fade out
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('hasSeenSplash', 'true');
      navigate(path);
    }, 400); // Wait for fade out animation before navigating
  };

  return (
    <div className={`splash-overlay ${phase === 3 ? 'fade-out' : ''}`}>
      <div className="splash-center">
        
        {/* Pulsing Circles Behind Logo */}
        <div className={`splash-circle circle-1 ${phase >= 1 ? 'active' : ''}`}></div>
        <div className={`splash-circle circle-2 ${phase >= 1 ? 'active' : ''}`}></div>
        <div className={`splash-circle circle-3 ${phase >= 1 ? 'active' : ''}`}></div>

        {/* The 4 Limbs (Placed first in DOM so logo sits on top visually if they overlap) */}
        <button 
          className={`splash-limb limb-tl ${phase >= 2 ? 'pop' : ''}`}
          onClick={() => handleLimbClick('/browse')}
        >
          <div className="limb-icon"><HiSearch /></div>
          <span>Find Services</span>
        </button>

        <button 
          className={`splash-limb limb-tr ${phase >= 2 ? 'pop' : ''}`}
          onClick={() => handleLimbClick('/realestate')}
        >
          <div className="limb-icon"><HiOfficeBuilding /></div>
          <span>Real Estate</span>
        </button>

        <button 
          className={`splash-limb limb-bl ${phase >= 2 ? 'pop' : ''}`}
          onClick={() => handleLimbClick('/jobs')}
        >
          <div className="limb-icon"><HiBriefcase /></div>
          <span>Find Jobs</span>
        </button>

        <button 
          className={`splash-limb limb-br ${phase >= 2 ? 'pop' : ''}`}
          onClick={() => handleLimbClick('/register')}
        >
          <div className="limb-icon"><HiUserAdd /></div>
          <span>Join as Worker</span>
        </button>

        {/* The Central Logo */}
        <img 
          src={logo} 
          alt="Mana Local Logo" 
          className={`splash-logo ${phase >= 1 ? 'logo-in' : ''}`} 
        />
      </div>
    </div>
  );
}
