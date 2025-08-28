import React, { useState, useEffect } from 'react'

interface MealPlan {
  id: number
  name: string
  description: string
  pricePerDay: number
  includedMeals: string[]
  isActive: boolean
}

const MealPlans: React.FC = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/v1/meal-plans')
      if (!response.ok) throw new Error('Error al cargar planes de comida')
      const data = await response.json()
      setMealPlans(data)
    } catch (err) {
      setError('Error al cargar los planes de comida')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (meal: string) => {
    switch (meal.toLowerCase()) {
      case 'desayuno': return '🥐'
      case 'almuerzo': return '🍽️'
      case 'cena': return '🍷'
      case 'snacks': return '🥨'
      default: return '🍴'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando planes de comida...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={fetchMealPlans} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold text-gray-800">Planes de Comida</h1>
        <button className="btn btn-primary">
          ➕ Nuevo Plan
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Todos
        </button>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Activos
        </button>
        <button className="btn btn-secondary">
          Inactivos
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar planes de comida..."
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {mealPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-gray-600">No se encontraron planes de comida</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem'
          }}>
            {mealPlans.map((plan) => (
              <div key={plan.id} className="card" style={{ margin: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 className="font-medium text-gray-800" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      {plan.name}
                    </h3>
                    <p className="text-gray-600" style={{ marginBottom: '1rem' }}>
                      {plan.description}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: plan.isActive ? '#10b981' : '#6b7280',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {plan.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="text-gray-600">
                      <strong>Precio por día:</strong>
                    </span>
                    <span className="text-gray-800 font-medium" style={{ fontSize: '1.125rem' }}>
                      ${plan.pricePerDay.toLocaleString()}
                    </span>
                  </div>
                </div>

                {plan.includedMeals && plan.includedMeals.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="font-medium text-gray-800" style={{ marginBottom: '0.5rem' }}>
                      Comidas incluidas:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {plan.includedMeals.map((meal, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <span>{getMealIcon(meal)}</span>
                          {meal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: '1', fontSize: '0.875rem' }}>
                    Editar
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: '1', fontSize: '0.875rem' }}
                    disabled={!plan.isActive}
                  >
                    Asignar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MealPlans
