;
import { Mail } from "lucide-react";
import { ROUTES } from "../../config/routes";

export default function Footer() {

  return (
    <footer
      id="footer"
      className="border-t border-(--bg-light) text-(--text-white)"
    >
      <div className="max-w-6xl mx-auto px-6 py-10 text-center">

        {/* Contacto */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail size={16} className="text-(--color-primary)" />
          <p className="text-sm">
            Contact:
            <a
              href="mailto:soporte@tusitio.com"
              className="ml-1 text-(--color-primary) hover:underline"
            >
              support@yoursite.com
            </a>
          </p>
        </div>

        {/* Redes Sociales */}
        <div className="flex justify-center gap-5 mb-8">
          {[
            { label: "YouTube", icon: "youtube.svg" },
            { label: "TikTok", icon: "tiktok.svg" },
            { label: "Instagram", icon: "instagram.svg" },
            { label: "X", icon: "x.svg" },
          ].map(({ label, icon }) => (
            <a
              key={label}
              href="https://youtu.be/dQw4w9WgXcQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="opacity-80 hover:opacity-100 transition"
            >
              <img
                src={`https://cdnjs.cloudflare.com/ajax/libs/simple-icons/11.14.0/${icon}`}
                alt={label}
                className={`w-5 h-5 invert`}
              />
            </a>
          ))}
        </div>

        {/* Legal */}
        <div className="text-xs text-(--text-white-50) space-y-3">
          <p>
            © 2025 Kinesis. All rights reserved.
          </p>

          <p>
            <a
              href={ROUTES.terms}
              className="underline text-(--text-white-50) hover:text-(--text-white-90)"
            >
              Términos y Condiciones
            </a>{" "}
            {" | "}
            <a
              href={ROUTES.privacy}
              className="underline text-(--text-white-50) hover:text-(--text-white-90)"
            >
              Políticas de Privacidad
            </a>
            {" | "}
             <a
              href={ROUTES.cookies}
              className="underline text-(--text-white-50) hover:text-(--text-white-90)"
            >
              Políticas de Cookies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

