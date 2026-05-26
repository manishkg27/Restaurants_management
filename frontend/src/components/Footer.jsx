import React from "react";
import { ChefHat } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand-wrapper">
            <div className="footer__brand">
              <ChefHat size={20} />
              <span>Eatify</span>
            </div>
            <p className="footer__desc">
              Experience the best culinary selections right at your doorstep. A final-year college database project.
            </p>
          </div>

          <div>
            <h4 className="footer__heading">
              Quick Links
            </h4>
            <ul className="footer__list">
              <li>
                <a href="/restaurants" className="footer__link">
                  Browse Restaurants
                </a>
              </li>
              <li>
                <a href="/search" className="footer__link">
                  Search Dishes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">
              Support
            </h4>
            <ul className="footer__list">
              <li>
                <a href="#" className="footer__link">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          &copy; {new Date().getFullYear()} Eatify. All rights reserved. Built as a MERN student portfolio project.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
