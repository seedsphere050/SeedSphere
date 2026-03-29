import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-100 mt-24">
      <div className="w-full px-12 xl:px-25 py-56 grid md:grid-cols-4 gap-22">

        {/* Logo & About */}
        <div>
          <h2 className="text-8xl font-black text-white mb-5 tracking-tight">
            SeedSphere
          </h2>
          <p className="text-4xl text-green-300 leading-relaxed">
            Explore nature. Diagnose plants. Build your digital garden.
            SeedSphere helps you grow smarter, every single day.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-6xl font-bold text-white mb-5 uppercase tracking-widest">Navigation</h3>
          <ul className="space-y-3 text-4xl">
            <li><Link to="/" className="hover:text-white transition hover:underline underline-offset-4">Home</Link></li>
            <li><Link to="/encyclopedia" className="hover:text-white transition hover:underline underline-offset-4">Encyclopedia</Link></li>
            <li><Link to="/recommendation" className="hover:text-white transition hover:underline underline-offset-4">Recommendation</Link></li>
            <li><Link to="/disease-detection" className="hover:text-white transition hover:underline underline-offset-4">Disease Detection</Link></li>
            <li><Link to="/digital-twin" className="hover:text-white transition hover:underline underline-offset-4">Digital Twin</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-6xl font-bold text-white mb-5 uppercase tracking-widest">Resources</h3>
          <ul className="space-y-3 text-4xl">
            <li><a href="#" className="hover:text-white transition hover:underline underline-offset-4">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition hover:underline underline-offset-4">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-white transition hover:underline underline-offset-4">Support</a></li>
            <li><a href="#" className="hover:text-white transition hover:underline underline-offset-4">Blog</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-5xl font-bold text-white mb-5 uppercase tracking-widest">Stay Updated</h3>
          <p className="text-4xl text-green-300 mb-5 leading-relaxed">
            Get weekly gardening insights delivered to your inbox.
          </p>
          <div className="flex rounded-xl overflow-hidden shadow-lg">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-4 py-4 bg-white text-black text-4xl outline-none"
            />
            <button className="bg-green-500 px-6 py-4 font-bold text-white hover:bg-green-400 transition whitespace-nowrap text-4xl">
              Join
            </button>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-800 py-7 px-12 xl:px-20 flex flex-col md:flex-row justify-between items-center gap-3 text-4xl text-green-400">
        <span>© {new Date().getFullYear()} SeedSphere. All rights reserved.</span>
        <span className="flex gap-6">
          <a href="#" className="hover:text-white transition">Twitter</a>
          <a href="#" className="hover:text-white transition">Instagram</a>
          <a href="#" className="hover:text-white transition">GitHub</a>
        </span>
      </div>
    </footer>
  );
}
