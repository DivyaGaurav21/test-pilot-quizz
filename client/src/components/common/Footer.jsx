import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => (
  <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
      <div>
        <Link to="/" className="inline-flex text-white"><Logo /></Link>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
          A better way to discover practice tests, measure progress, and help learning communities grow.
        </p>
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">Explore</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <Link to="/exams" className="hover:text-white">Browse tests</Link>
          <Link to="/institutes" className="hover:text-white">For institutes</Link>
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">Learn more</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <Link to="/blog" className="hover:text-white">Blog</Link>
          <Link to="/about" className="hover:text-white">About us</Link>
          <Link to="/login" className="hover:text-white">Your account</Link>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>© {new Date().getFullYear()} Test Pilot. All rights reserved.</span>
        <span>Practice with purpose. Learn at your pace.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
