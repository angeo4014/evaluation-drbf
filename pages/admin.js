import { useState, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import adminStyles from '../styles/Admin.module.css'

function calculerPourcentage(valeur, total) {
  if (!total) return 0
  return Math.round((valeur / total) * 100 * 10) / 10
}

function Badge({ valeur }) {
  let cls = adminStyles.badgeWarning
  if (valeur >= 75) cls = adminStyles.badgeSuccess
  else if (valeur < 50) cls = adminStyles.badgeDanger
  return <span className={`${adminStyles.badge} ${cls}`}>{valeur.toFixed(1)}%</span>
}

export default function Admin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Erreur serveur')
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
    } catch (err) {
      setError('Impossible de charger les statistiques.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  function formatDate(isoStr) {
    if (!isoStr) return '-'
    return new Date(isoStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function qualiteBadge(q) {
    if (q === 'Très bonne') return <span className={`${adminStyles.badge} ${adminStyles.badgeSuccess}`}>😊 {q}</span>
    if (q === 'Bonne') return <span className={`${adminStyles.badge} ${adminStyles.badgeWarning}`}>🙂 {q}</span>
    return <span className={`${adminStyles.badge} ${adminStyles.badgeDanger}`}>😞 {q}</span>
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', padding: '20px' }}>
      <Head><title>Tableau de Bord - Évaluations DRBF</title></Head>
      <div className={adminStyles.dashboard}>

        {/* Header */}
        <div className={adminStyles.dashboardHeader}>
          <h1>📊 Tableau de Bord des Évaluations</h1>
          <p>Direction Régionale du Budget et des Finances - Gbêkê</p>
          {lastUpdate && (
            <p style={{ fontSize: 14, opacity: 0.9, marginTop: 10 }}>
              Dernière mise à jour : {formatDate(lastUpdate.toISOString())}
            </p>
          )}
          <button className={adminStyles.refreshBtn} onClick={fetchStats} disabled={loading}>
            {loading ? '⏳ Chargement...' : '🔄 Actualiser'}
          </button>
        </div>

        {error && <div style={{ background: '#F8D7DA', color: '#721C24', padding: 20, borderRadius: 10, marginBottom: 20 }}>{error}</div>}

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: 60, color: '#FF8C00', fontSize: 20 }}>⏳ Chargement des statistiques...</div>
        )}

        {data && (
          <>
            {/* Statistiques globales */}
            <h2 className={adminStyles.sectionTitle}>📈 Statistiques Globales</h2>
            <div className={adminStyles.statsGrid}>
              {data.stats_globales.map(stat => (
                <div key={stat.sous_direction} className={adminStyles.statCard}>
                  <h3>Sous-Direction {stat.sous_direction === 'Budget' ? 'du' : 'de la'} {stat.sous_direction}</h3>

                  <div className={adminStyles.statRow}>
                    <span className={adminStyles.statLabel}>Total évaluations</span>
                    <span className={adminStyles.statValue}>{stat.total}</span>
                  </div>

                  {[
                    { label: '😊 Très bonne', key: 'tres_bonne', color: '#28a745' },
                    { label: '🙂 Bonne', key: 'bonne', color: '#ffc107' },
                    { label: '😞 Pas du tout bonne', key: 'pas_bonne', color: '#dc3545' },
                  ].map(item => (
                    <div key={item.key}>
                      <div className={adminStyles.statRow}>
                        <span className={adminStyles.statLabel}>{item.label}</span>
                        <span className={adminStyles.statValue}>
                          {stat[item.key]} ({calculerPourcentage(stat[item.key], stat.total)}%)
                        </span>
                      </div>
                      <div className={adminStyles.progressBar}>
                        <div className={adminStyles.progressFill} style={{
                          width: `${calculerPourcentage(stat[item.key], stat.total)}%`,
                          background: item.color
                        }} />
                      </div>
                    </div>
                  ))}

                  <div className={`${adminStyles.statRow} ${adminStyles.satisfactionRow}`}>
                    <span className={adminStyles.statLabel}>Taux de satisfaction</span>
                    <span className={adminStyles.satisfactionValue}>{stat.pourcentage_satisfaction.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats par porte */}
            <h2 className={adminStyles.sectionTitle} style={{ marginTop: 40 }}>🚪 Statistiques par Porte</h2>
            <div className={adminStyles.tableWrapper}>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>Sous-Direction</th>
                    <th>Porte</th>
                    <th>Total</th>
                    <th>Très bonne</th>
                    <th>Bonne</th>
                    <th>Pas bonne</th>
                    <th>Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stats_portes.map((p, i) => (
                    <tr key={i}>
                      <td>{p.sous_direction}</td>
                      <td><strong>{p.porte === 'Secrétariat' ? 'Secrétariat' : `Porte ${p.porte}`}</strong></td>
                      <td>{p.total}</td>
                      <td>{p.tres_bonne}</td>
                      <td>{p.bonne}</td>
                      <td>{p.pas_bonne}</td>
                      <td><Badge valeur={p.pourcentage_satisfaction} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dernières évaluations */}
            <h2 className={adminStyles.sectionTitle} style={{ marginTop: 40 }}>📝 Dernières Évaluations</h2>
            <div className={adminStyles.tableWrapper}>
              <button className={adminStyles.exportBtn} onClick={() => window.print()}>🖨️ Imprimer ce rapport</button>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sous-Direction</th>
                    <th>Porte</th>
                    <th>Qualité</th>
                    <th>Commentaire</th>
                    <th>Téléphone</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dernieres_evaluations.map((ev, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(ev.date_evaluation)}</td>
                      <td>{ev.sous_direction}</td>
                      <td>{ev.porte === 'Secrétariat' ? 'Secrétariat' : `Porte ${ev.porte}`}</td>
                      <td>{qualiteBadge(ev.qualite_service)}</td>
                      <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.commentaire || '-'}
                      </td>
                      <td>{ev.telephone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 40, padding: 20 }}>
          <a href="/" style={{ color: '#FF8C00', textDecoration: 'none', fontWeight: 600 }}>
            ← Retour au formulaire d'évaluation
          </a>
        </div>
      </div>
    </div>
  )
}
