import Link from "next/link";
import { ModeToggle } from "./modeToggle";

export default function Navbar() {
  return (
    <nav className="w-full h-[8vh] fixed top-0 left-0 right-0 bg-black flex items-center justify-between text-white px-2 z-50 capitalize">
      <div className="flex item-center text-white p-3">
        <Link href="/">
          <h1 className="font-bold">Blog</h1>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <ModeToggle />
      </div>
    </nav>
  );
}
