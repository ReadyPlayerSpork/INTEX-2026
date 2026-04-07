import Link from "next/link"
import { Heart } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ShineForward</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Empowering girls through education, mentorship, and opportunity since 2015.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link href="#" className="hover:text-background transition-colors">Our Mission</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Our Team</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Annual Reports</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold mb-4">Programs</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link href="#" className="hover:text-background transition-colors">Education Fund</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Mentorship</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Career Training</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Safe Housing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link href="#" className="hover:text-background transition-colors">Donate</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Volunteer</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Partner With Us</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/60">
              2024 ShineForward Foundation. All rights reserved. 501(c)(3) nonprofit.
            </p>
            <div className="flex items-center gap-6 text-sm text-background/60">
              <Link href="#" className="hover:text-background transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-background transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-background transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
