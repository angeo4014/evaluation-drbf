import { envoyerEmailEvaluation } from '../../lib/email'

const SUPABASE_URL = 'https://xmavipkfsutnmsnmihvz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtYXZpcGtmc3V0bm1zbm1paHZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAxMTQ4OSwiZXhwIjoyMDk0NTg3NDg5fQ.8mLVE8ZqzrJ2_fnESMRyJ19JBbIIDcmZYBPsFuwwVbo'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { sous_direction, porte, qualite, commentaire, telephone } = req.body

  const errors = []
  if (!sous_direction || !['Budget', 'Solde'].includes(sous_direction)) errors.push('Sous-direction invalide.')
  if (!porte) errors.push('Porte manquante.')
  if (!qualite || !['Très bonne', 'Bonne', 'Pas du tout bonne'].includes(qualite)) errors.push('Qualité invalide.')
  if (!telephone || !/^[0-9]{10}$/.test(telephone)) errors.push('Téléphone invalide.')

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    // Insertion directe via l'API REST Supabase (sans client)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/evaluations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sous_direction,
        porte,
        qualite_service: qualite,
        commentaire: commentaire || 'Aucun commentaire',
        telephone,
        date_evaluation: new Date().toISOString(),
      })
    })

    const text = await response.text()
    console.log('Supabase response:', response.status, text)

    if (!response.ok) {
      return res.status(500).json({ 
        success: false, 
        error: `Erreur DB: ${response.status} - ${text}`
      })
    }

    const inserted = JSON.parse(text)
    const evaluationId = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id

    const now = new Date()
    const dateFormatted = now.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', ' à')

    const emailData = {
      sous_direction, porte, qualite,
      commentaire: commentaire || 'Aucun commentaire',
      telephone,
      date_evaluation: dateFormatted,
      evaluation_id: evaluationId,
    }

    const emailEnvoye = await envoyerEmailEvaluation(emailData)

    return res.status(200).json({
      success: true,
      emailEnvoye,
      message: emailEnvoye
        ? 'Évaluation enregistrée et responsables notifiés.'
        : 'Évaluation enregistrée.',
    })

  } catch (err) {
    console.log('CATCH_ERROR:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}
