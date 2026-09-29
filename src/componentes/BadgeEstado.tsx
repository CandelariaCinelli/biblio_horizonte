import React from 'react';
import { EstadoReserva, EstadoEquipo, TipoEquipo } from '../tipos';

interface PropsBadgeEstadoReserva {
  estado: EstadoReserva;
  tamano?: 'sm' | 'md';
}

export const BadgeEstadoReserva: React.FC<PropsBadgeEstadoReserva> = ({
  estado,
  tamano = 'md',
}) => {
  const clasesTamano =
    tamano === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide font-medium';

  switch (estado) {
    case 'PENDIENTE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA] ${clasesTamano}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-pulse" />
          PENDIENTE
        </span>
      );
    case 'CONFIRMADA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] ${clasesTamano}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          CONFIRMADA
        </span>
      );
    case 'RECHAZADA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] ${clasesTamano}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          RECHAZADA
        </span>
      );
    default:
      return null;
  }
};

interface PropsBadgeEquipo {
  estado: EstadoEquipo;
}

export const BadgeEstadoEquipo: React.FC<PropsBadgeEquipo> = ({ estado }) => {
  if (estado === 'DISPONIBLE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F4F9F4] text-[#1B5E20] border border-[#C8E6C9] px-2 py-0.5 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
        DISPONIBLE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF8E1] text-[#B78103] border border-[#FFE082] px-2 py-0.5 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      EN MANTENIMIENTO
    </span>
  );
};

interface PropsBadgeTipo {
  tipo: TipoEquipo;
}

export const BadgeTipoEquipo: React.FC<PropsBadgeTipo> = ({ tipo }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EFE8DD] text-[#5A4D41]">
      {tipo === 'PROYECTOR' ? 'Proyector' : 'Notebook'}
    </span>
  );
};
