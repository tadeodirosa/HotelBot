import React from 'react'

const ReservationsTest: React.FC = () => {
  console.log('ReservationsTest component mounted')
  
  return (
    <div className="reservations-page">
      <h1>Test de Reservas</h1>
      <p>Si ves esto, el routing funciona correctamente.</p>
      <p>El problema está en el componente ReservationsProfessional.</p>
    </div>
  )
}

export default ReservationsTest
