import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { MdConstruction } from 'react-icons/md';
import logo from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src={logo} alt="Mana Local Logo" className="footer-logo-img" />
          </Link>
          <p>Your trusted platform for booking verified local professionals. Plumbers, Electricians, and more — instantly.</p>
          <p className="footer-contact"><strong>Phone:</strong> +91 98486 15849</p>
          <p className="footer-contact"><strong>Email:</strong> info@ourlocal.in</p>
          <p className="footer-contact"><strong>Address:</strong> Chimakurty</p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/jobs">Careers</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-col">
          <h4>For Customers</h4>
          <Link to="/browse">Browse Services</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">My Cart</Link>
        </div>

        <div className="footer-col">
          <h4>For Professionals</h4>
          <Link to="/login">Register as Professional</Link>
          <Link to="/jobs">Find Local Jobs</Link>
          <Link to="/contact">Partner with Us</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>* As on December 31, 2026</p>
        <p>© Copyright 2026 Mana Local Technologies India Limited. All rights reserved.</p>
      </div>
    </footer>
  );
}
