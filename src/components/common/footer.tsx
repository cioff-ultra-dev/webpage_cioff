import Image from "next/image";

function Footer() {
  return (
    <footer className="bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-800 text-xs sm:text-sm">info@cioff.org</p>
        <Image
          src="/logo.png"
          width="100"
          height="100"
          alt="CIOFF Logo"
          className="inline-block my-6"
        />
        <p className="text-gray-800 text-xs sm:text-sm">
          © CIOFF 1998 - 2024 | cioff.org
        </p>
      </div>
    </footer>
  );
}

export default Footer;
