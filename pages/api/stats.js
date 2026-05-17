import { getSupabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const supabase = getSupabaseAdmin()

  // Récupérer toutes les évaluations
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('*')
    .order('date_evaluation', { ascending: false })

  if (error) {
    console.error('Erreur Supabase stats:', error)
    return res.status(500).json({ error: 'Erreur lors de la récupération des données.' })
  }

  // === Calcul des statistiques globales par sous-direction ===
  const statsGlobales = {}
  const statsParPorte = {}

  for (const ev of evaluations) {
    const sd = ev.sous_direction

    // Stats globales
    if (!statsGlobales[sd]) {
      statsGlobales[sd] = { sous_direction: sd, total: 0, tres_bonne: 0, bonne: 0, pas_bonne: 0 }
    }
    statsGlobales[sd].total++
    if (ev.qualite_service === 'Très bonne') statsGlobales[sd].tres_bonne++
    else if (ev.qualite_service === 'Bonne') statsGlobales[sd].bonne++
    else if (ev.qualite_service === 'Pas du tout bonne') statsGlobales[sd].pas_bonne++

    // Stats par porte
    const key = `${sd}__${ev.porte}`
    if (!statsParPorte[key]) {
      statsParPorte[key] = { sous_direction: sd, porte: ev.porte, total: 0, tres_bonne: 0, bonne: 0, pas_bonne: 0 }
    }
    statsParPorte[key].total++
    if (ev.qualite_service === 'Très bonne') statsParPorte[key].tres_bonne++
    else if (ev.qualite_service === 'Bonne') statsParPorte[key].bonne++
    else if (ev.qualite_service === 'Pas du tout bonne') statsParPorte[key].pas_bonne++
  }

  // Calculer les pourcentages de satisfaction
  function calculerSatisfaction(stat) {
    if (stat.total === 0) return 0
    const score = (stat.tres_bonne * 3 + stat.bonne * 2 + stat.pas_bonne * 1)
    return Math.round((score / (stat.total * 3)) * 100 * 10) / 10
  }

  const globalesArray = Object.values(statsGlobales).map(s => ({
    ...s,
    pourcentage_satisfaction: calculerSatisfaction(s),
  }))

  const portesArray = Object.values(statsParPorte).map(s => ({
    ...s,
    pourcentage_satisfaction: calculerSatisfaction(s),
  })).sort((a, b) => a.sous_direction.localeCompare(b.sous_direction) || a.porte.localeCompare(b.porte))

  // Dernières 10 évaluations
  const dernieres = evaluations.slice(0, 10)

  return res.status(200).json({
    stats_globales: globalesArray,
    stats_portes: portesArray,
    dernieres_evaluations: dernieres,
    total: evaluations.length,
  })
}
