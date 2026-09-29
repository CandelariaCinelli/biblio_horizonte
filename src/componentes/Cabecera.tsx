import React from 'react';
import { Usuario } from '../tipos';

interface PropsCabecera {
  pestañaActiva: 'docente' | 'bibliotecaria' | 'disponibilidad' | 'inventario';
  alCambiarPestaña: (p: 'docente' | 'bibliotecaria' | 'disponibilidad' | 'inventario') => void;
  usuarioActual: Usuario;
  usuariosDisponibles: Usuario[];
  alCambiarUsuario: (u: Usuario) => void;
  alAbrirNuevaReserva: () => void;
  cantidadPendientes: number;
}

export const Cabecera: React.FC<PropsCabecera> = ({
  pestañaActiva,
  alCambiarPestaña,
  usuarioActual,
  usuariosDisponibles,
  alCambiarUsuario,
  alAbrirNuevaReserva,
  cantidadPendientes,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E0D5] px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* ZONA 1: Marca e Identidad Única */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => alCambiarPestaña('disponibilidad')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-[#FAF7F2] font-bold text-sm shadow-xs group-hover:bg-[#A33E1A] transition-colors">
              BH
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#2D231E]">
              Biblioteca Horizonte
            </span>
          </button>
        </div>

        {/* ZONA 2: Enlaces de Navegación Textuales */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <button
            onClick={() => alCambiarPestaña('disponibilidad')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
              pestañaActiva === 'disponibilidad'
                ? 'bg-[#EFE8DD] text-[#2D231E]'
                : 'text-[#76685E] hover:text-[#2D231E] hover:bg-[#F5EFE6]'
            }`}
          >
            Disponibilidad
          </button>

          <button
            onClick={() => alCambiarPestaña('docente')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
              pestañaActiva === 'docente'
                ? 'bg-[#EFE8DD] text-[#2D231E]'
                : 'text-[#76685E] hover:text-[#2D231E] hover:bg-[#F5EFE6]'
            }`}
          >
           Docente
          </button>

          <button
            onClick={() => alCambiarPestaña('bibliotecaria')}
            className={`relative px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
              pestañaActiva === 'bibliotecaria'
                ? 'bg-[#EFE8DD] text-[#2D231E]'
                : 'text-[#76685E] hover:text-[#2D231E] hover:bg-[#F5EFE6]'
            }`}
          >
            Panel Bibliotecaria
            {cantidadPendientes > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-[#C85A32] text-white">
                {cantidadPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => alCambiarPestaña('inventario')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
              pestañaActiva === 'inventario'
                ? 'bg-[#EFE8DD] text-[#2D231E]'
                : 'text-[#76685E] hover:text-[#2D231E] hover:bg-[#F5EFE6]'
            }`}
          >
            Inventario Equipos
          </button>

        </nav>

        {/* ZONA 3: Selector de Rol y Acción Primaria */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Selector de Usuario / Rol simulado para evaluación instantánea */}
          <div className="flex items-center gap-2 bg-[#EFE8DD] rounded-lg px-2.5 py-1.5 border border-[#E0D7C9]">
            <span className="text-xs text-[#76685E] hidden sm:inline">Usuario:</span>
            <select
              value={usuarioActual.id}
              onChange={(e) => {
                const seleccionado = usuariosDisponibles.find(
                  (u) => u.id === Number(e.target.value)
                );
                if (seleccionado) {
                  alCambiarUsuario(seleccionado);
                  if (seleccionado.rol === 'BIBLIOTECARIA' && pestañaActiva === 'docente') {
                    alCambiarPestaña('bibliotecaria');
                  } else if (seleccionado.rol === 'DOCENTE' && pestañaActiva === 'bibliotecaria') {
                    alCambiarPestaña('docente');
                  }
                }
              }}
              className="bg-transparent text-xs font-semibold text-[#2D231E] focus:outline-none cursor-pointer"
            >
              {usuariosDisponibles.map((usr) => (
                <option key={usr.id} value={usr.id} className="bg-[#FAF7F2] text-[#2D231E]">
                  {usr.nombre} ({usr.rol === 'BIBLIOTECARIA' ? 'Bibliotecaria' : 'Docente'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={alAbrirNuevaReserva}
            className="px-3.5 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#A33E1A] text-white text-xs font-medium tracking-wide transition-colors shadow-xs whitespace-nowrap"
          >
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-[#E8E0D5]/70">
        <button
          onClick={() => alCambiarPestaña('disponibilidad')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            pestañaActiva === 'disponibilidad' ? 'bg-[#EFE8DD] text-[#2D231E]' : 'text-[#76685E]'
          }`}
        >
          Disponibilidad
        </button>
        <button
          onClick={() => alCambiarPestaña('docente')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            pestañaActiva === 'docente' ? 'bg-[#EFE8DD] text-[#2D231E]' : 'text-[#76685E]'
          }`}
        >
          Docente
        </button>
        <button
          onClick={() => alCambiarPestaña('bibliotecaria')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            pestañaActiva === 'bibliotecaria' ? 'bg-[#EFE8DD] text-[#2D231E]' : 'text-[#76685E]'
          }`}
        >
          Bibliotecaria {cantidadPendientes > 0 && `(${cantidadPendientes})`}
        </button>
        <button
          onClick={() => alCambiarPestaña('inventario')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            pestañaActiva === 'inventario' ? 'bg-[#EFE8DD] text-[#2D231E]' : 'text-[#76685E]'
          }`}
        >
          Inventario
        </button>
      </div>
    </header>
  );
};
