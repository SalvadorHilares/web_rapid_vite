import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#2A2521] text-white px-8 py-12 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        
        {/* 🍣 Marca */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-[#FF8F1E]">🍣 Maki Lover</h4>
          <p className="text-gray-400 text-sm">
            La comida no solo alimenta el cuerpo, también nutre el alma.  
            En Maki Lover, combinamos sabor, pasión y frescura en cada bocado.
          </p>
        </div>

        {/* 📋 Menú principal */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-[#FF8F1E]">Menú Principal</h4>
          <ul className="text-gray-300 space-y-1">
            <li>
              <Link 
                to="/nosotros"
                className="hover:text-[#FF8F1E] transition cursor-pointer"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link 
                to="/makis"
                className="hover:text-[#FF8F1E] transition cursor-pointer"
              >
                Makis
              </Link>
            </li>
            <li>
              <Link 
                to="/promociones"
                className="hover:text-[#FF8F1E] transition cursor-pointer"
              >
                Promociones
              </Link>
            </li>
            <li>
              <Link 
                to="/contacto"
                className="hover:text-[#FF8F1E] transition cursor-pointer"
              >
                Contáctanos
              </Link>
            </li>
          </ul>
        </div>

        {/* 📞 Contacto */}
        <div>
          <h4 className="text-lg font-semibold mb-2 text-[#FF8F1E]">Contacto</h4>
          <p className="text-gray-300 text-sm">Lima, Perú</p>
          <p className="text-gray-300 text-sm">📞 986 169 527</p>
          <p className="text-gray-300 text-sm">📧 info@makilover.pe</p>

          <div className="flex gap-3 mt-2">
            <a href="#" className="text-[#FF8F1E] hover:text-white transition">IG</a>
            <a href="#" className="text-[#FF8F1E] hover:text-white transition">FB</a>
            <a href="#" className="text-[#FF8F1E] hover:text-white transition">X</a>
          </div>
        </div>
      </div>

      {/* 🧾 Pie de página */}
      <p className="text-center text-gray-500 text-xs mt-8">
        © 2025 Maki Lover. Todos los derechos reservados.
      </p>
    </footer>
  )
}