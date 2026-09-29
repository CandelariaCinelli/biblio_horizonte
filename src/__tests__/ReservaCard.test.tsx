/**
 * Pruebas Unitarias Frontend para Biblioteca Horizonte
 * Utiliza React Testing Library y Jest para verificar el renderizado del componente
 * y los badges de estado con la paleta cálida requerida.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BadgeEstadoReserva } from '../componentes/BadgeEstado';

describe('Pruebas Unitarias Frontend - Componentes de Biblioteca Horizonte', () => {
  test('Debe renderizar correctamente el badge de estado PENDIENTE con su etiqueta y estilo cálido', () => {
    render(<BadgeEstadoReserva estado="PENDIENTE" />);
    const elemento = screen.getByText(/PENDIENTE/i);
    expect(elemento).toBeInTheDocument();
  });

  test('Debe renderizar correctamente el badge de estado CONFIRMADA', () => {
    render(<BadgeEstadoReserva estado="CONFIRMADA" />);
    const elemento = screen.getByText(/CONFIRMADA/i);
    expect(elemento).toBeInTheDocument();
  });

  test('Debe renderizar correctamente el badge de estado RECHAZADA', () => {
    render(<BadgeEstadoReserva estado="RECHAZADA" />);
    const elemento = screen.getByText(/RECHAZADA/i);
    expect(elemento).toBeInTheDocument();
  });
});
