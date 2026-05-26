import React from "react";
import { ChefHat } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8 text-sm mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-lg mb-3">
              <ChefHat size={20} />
              <span>Eatify</span>
            </div>
            <p className="text-gray-500 leading-relaxed max-w-xs">
              Experience the best culinary selections right at your doorstep. A final-year college database project.
            </p>
          </div>

          <div>
            <h4 className="text-gray-800 font-bold mb-3 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="list-none flex flex-col gap-2 p-0">
              <li>
                <a href="/restaurants" className="text-gray-600 hover:text-orange-600 no-underline">
                  Browse Restaurants
                </a>
              </li>
              <li>
                <a href="/search" className="text-gray-600 hover:text-orange-600 no-underline">
                  Search Dishes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-800 font-bold mb-3 uppercase tracking-wider text-xs">
              Support
            </h4>
            <ul className="list-none flex flex-col gap-2 p-0">
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-600 no-underline">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-600 no-underline">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Eatify. All rights reserved. Built as a MERN student portfolio project.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
