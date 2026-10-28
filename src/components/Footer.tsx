import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="rounded-t-3xl bg-[#1F2937]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Footer Content */}
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#7960D7] rounded-lg flex items-center justify-center">
                  <Image
                    src="/logo-togather.png"
                    alt="Togather"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold">Togather</span>
              </div>
              <p className="text-sm text-gray-400">
                The people platform — where communities meet and events come alive.
              </p>
            </div>

            {/* Your account */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Your account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Sign up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Log in
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Become an organizer
                  </a>
                </li>
              </ul>
            </div>

            {/* Discover */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Discover</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/komunitas" className="hover:text-white transition-colors">
                    Groups
                  </Link>
                </li>
                <li>
                  <Link href="/event" className="hover:text-white transition-colors">
                    Events
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Topics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cities
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Online events
                  </a>
                </li>
              </ul>
            </div>

            {/* Togather */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Togather</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Apps
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section with Social & Legal */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                © 2024 Togather. All rights reserved. Made with ❤ for communities everywhere.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Terms of service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                License attribution
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
