import { Separator } from "@/components/ui/separator";
import { Twitter, Linkedin } from "lucide-react";

export const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="text-2xl font-bold mb-2">Pulzio</div>
          <div className="text-gray-400 text-sm">Building AI-powered Customer Success in Public</div>
          <div className="mt-2 text-xs text-gray-300">Status: 🔨 Building (Week 1/8)</div>
          <div className="flex gap-4 mt-4">
            <a href="#" aria-label="Twitter" className="hover:text-blue-400" target="_blank" rel="noopener">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Linkedin" className="hover:text-blue-400" target="_blank" rel="noopener">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        {/* Product */}
        <div>
          <div className="font-semibold mb-4">Product</div>
          <ul className="space-y-2">
            <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
            <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
            <li><a href="#integrations" className="text-gray-400 hover:text-white">Integrations</a></li>
            <li><a href="#changelog" className="text-gray-400 hover:text-white">Changelog</a></li>
          </ul>
        </div>
        {/* Company */}
        <div>
          <div className="font-semibold mb-4">Company</div>
          <ul className="space-y-2">
            <li><a href="#about" className="text-gray-400 hover:text-white">About</a></li>
            <li><a href="#blog" className="text-gray-400 hover:text-white">Blog</a></li>
            <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
            <li><a href="#privacy" className="text-gray-400 hover:text-white">Privacy</a></li>
            <li><a href="#terms" className="text-gray-400 hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>
      <Separator className="my-8 bg-gray-600" />
      <div className="text-center text-gray-400 text-sm">
        © 2025 Pulzio. Built in public.
      </div>
    </div>
  </footer>
);
