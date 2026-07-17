import { UtensilsCrossed } from "lucide-react";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 text-white font-extrabold text-lg mb-3">
          <UtensilsCrossed className="text-primary-500" /> FoodHub AI
        </div>
        <p className="text-sm text-gray-400">
          Smart, personalized food delivery — powered by AI recommendations.
        </p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>About</li>
          <li>Careers</li>
          <li>Blog</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">For Restaurants</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Partner with us</li>
          <li>Owner dashboard</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Support</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Help Center</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-800">
      © {new Date().getFullYear()} FoodHub AI. All rights reserved.
    </div>
  </footer>
);

export default Footer;
