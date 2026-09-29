import React, { useState } from 'react';
import { Equipo, EstadoEquipo, TipoEquipo } from '../tipos';
import { BadgeEstadoEquipo, BadgeTipoEquipo } from './BadgeEstado';
import notebookImg from '../assets/images/notebook.svg';
import proyectorImg from '../assets/images/proyector.svg';

interface PropsInventarioEquipos {
  equipos: Equipo[];
  alCrearEquipo: (datos: Omit<Equipo, 'id' | 'creadoEn'>) => Promise<void>;
  alActualizarEquipo: (id: number, datos: Partial<Equipo>) => Promise<void>;
  alAlternarMantenimiento: (id: number) => Promise<void>;
  alEliminarEquipo: (id: number) => Promise<void>;
}

export const InventarioEquipos: React.FC<PropsInventarioEquipos> = ({
  equipos,
  alCrearEquipo,
  alActualizarEquipo,
  alAlternarMantenimiento,
  alEliminarEquipo,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoEnEdicion, setEquipoEnEdicion] = useState<Equipo | null>(null);

  // Campos formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoEquipo>('PROYECTOR');
  const [estado, setEstado] = useState<EstadoEquipo>('DISPONIBLE');
  const [descripcion, setDescripcion] = useState('');
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const abrirCrear = () => {
    setEquipoEnEdicion(null);
    setNombre('');
    setTipo('PROYECTOR');
    setEstado('DISPONIBLE');
    setDescripcion('');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirEditar = (eq: Equipo) => {
    setEquipoEnEdicion(eq);
    setNombre(eq.nombre);
    setTipo(eq.tipo);
    setEstado(eq.estado);
    setDescripcion(eq.descripcion || '');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorForm('El nombre del equipo es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      if (equipoEnEdicion) {
        await alActualizarEquipo(equipoEnEdicion.id, {
          nombre: nombre.trim(),
          tipo,
          estado,
          descripcion: descripcion.trim(),
        });
      } else {
        await alCrearEquipo({
          nombre: nombre.trim(),
          tipo,
          estado,
          descripcion: descripcion.trim(),
        });
      }
      setModalAbierto(false);
    } catch (err: any) {
      setErrorForm(err.message || 'Error guardando equipo');
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = async (id: number, nombreEq: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el equipo "${nombreEq}" del inventario escolar?`)) {
      try {
        await alEliminarEquipo(id);
      } catch (err: any) {
        alert(err.message || 'No se pudo eliminar el equipo');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y botón de alta */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C85A32]">
            Gestión de Inventario Escolar
          </span>
          <h2 className="text-xl font-bold text-[#2D231E] mt-0.5">
            Recursos Tecnológicos Escolares
          </h2>
          <p className="text-xs text-[#76685E] mt-1">
            Administra el inventario de proyectores y notebooks disponibles para docentes y estudiantes.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#A33E1A] rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          + Agregar Nuevo Equipo
        </button>
      </div>

      {/* Grid de Equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipos.map((equipo) => (
          <div
            key={equipo.id}
            className="bg-white rounded-xl border border-[#E8E0D5] p-5 shadow-xs hover:border-[#D9CEBE] transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <img
                src={equipo.tipo === 'NOTEBOOK' ? notebookImg : proyectorImg}
                alt={equipo.tipo === 'NOTEBOOK' ? 'Notebook' : 'Proyector'}
                className="w-full h-32 object-contain rounded-lg bg-[#F7F4EE] mb-4"
              />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#2D231E]">
                    {equipo.nombre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <BadgeTipoEquipo tipo={equipo.tipo} />
                    <span className="text-[11px] font-mono text-[#76685E]">
                      ID #{equipo.id}
                    </span>
                  </div>
                </div>
                <BadgeEstadoEquipo estado={equipo.estado} />
              </div>

              <p className="text-xs text-[#76685E] mt-3">
                {equipo.descripcion || 'Sin descripción técnica adicional.'}
              </p>
            </div>

            {/* Acciones del ABM */}
            <div className="pt-3 border-t border-[#E8E0D5]/70 flex items-center justify-between text-xs">
              <button
                onClick={() => alAlternarMantenimiento(equipo.id)}
                className={`text-[11px] font-medium hover:underline ${
                  equipo.estado === 'DISPONIBLE'
                    ? 'text-[#B45309]'
                    : 'text-[#166534]'
                }`}
              >
                {equipo.estado === 'DISPONIBLE'
                  ? '🔧 Enviar a Mantenimiento'
                  : '✓ Habilitar a Disponible'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirEditar(equipo)}
                  className="px-2.5 py-1 rounded text-xs font-medium text-[#5A4D41] hover:bg-[#EFE8DD] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => manejarEliminar(equipo.id, equipo.nombre)}
                  className="px-2 py-1 rounded text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
                >
                  Baja
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal ABM Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-xl border border-[#E8E0D5] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E0D5] flex items-center justify-between bg-[#F4EFE6]">
              <h3 className="text-sm font-bold text-[#2D231E]">
                {equipoEnEdicion ? 'Editar Recurso Tecnológico' : 'Alta de Nuevo Equipo Tecnológico'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-[#76685E] hover:text-[#2D231E] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={manejarGuardar} className="p-6 space-y-4 text-xs">
              {errorForm && (
                <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-3 text-[#991B1B]">
                  {errorForm}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#4A3E35] mb-1">
                  Nombre del Equipo (ej: "Proyector 4", "Notebook 6"):
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre identificador único"
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D9CEBE] rounded-lg text-sm text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3E35] mb-1">
                    Tipo de Recurso:
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoEquipo)}
                    className="w-full px-3 py-2 bg-white border border-[#D9CEBE] rounded-lg text-sm text-[#2D231E] focus:outline-none"
                  >
                    <option value="PROYECTOR">PROYECTOR</option>
                    <option value="NOTEBOOK">NOTEBOOK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E35] mb-1">
                    Estado Operativo:
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoEquipo)}
                    className="w-full px-3 py-2 bg-white border border-[#D9CEBE] rounded-lg text-sm text-[#2D231E] focus:outline-none"
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3E35] mb-1">
                  Especificaciones Técnicas / Ubicación:
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles de hardware, puertos, ubicación o notas de revisión."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#D9CEBE] rounded-lg text-sm text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E0D5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 font-medium text-[#5A4D41] hover:bg-[#EFE8DD] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 font-semibold text-white bg-[#C85A32] hover:bg-[#A33E1A] rounded-lg transition-colors shadow-xs"
                >
                  {guardando ? 'Guardando...' : equipoEnEdicion ? 'Guardar Cambios' : 'Registrar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
