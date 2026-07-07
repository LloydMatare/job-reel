import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Job Reels</h3>
            <p className="text-sm text-gray-400">
              Find your next opportunity. Your dream career starts here.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-sm hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm hover:text-white transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-sm hover:text-white transition-colors">
                  Search by Category
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/company/new" className="text-sm hover:text-white transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/company/new" className="text-sm hover:text-white transition-colors">
                  Create Company Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-500">Job Reels &copy; 2026</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">
                  Built with Next.js, Convex & Clerk
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Job Reels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
