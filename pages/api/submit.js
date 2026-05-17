import { getSupabaseAdmin } from '../../lib/supabase'
import { envoyerEmailEvaluation } from '../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { sous_direction, porte, qualite, commentaire, telephone } = req.body

  const errors = []
  if (!sous_direction || !['Budget', 'Solde'].includes(sous_direction)) {
    errors.push('Sous-direction invalide.')
  }
  if (!porte) errors.push('Porte manquante.')
  if (!qualite || !['Très bonne', 'Bonne', 'Pas du tout bonne'].includes(qualite)) {
    errors.push('Qualité invalide.')
  }
  if (!telephone || !/^[0-9]{10}$/.test(telephone)) {
    errors.push('Téléphone invalide.')
  }
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: inserted, error: dbError } = await supabase
      .from('evaluations')
      .insert([{
        sous_direction,
        porte,
        qualite_service: qualite,
        commentaire: commentaire || 'Aucun commentaire',
        telephone,
        date_evaluation: new Date().toISOString(),
      }])
      .select()
      .single()

    if (dbError) {
      const errMsg = JSON.stringify(dbError)
      console.log('DB_ERROR_FULL: ' + errMsg)
      return res.status(500).json({ 
        success: false, 
        error: errMsg
      })
    }

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
      evaluation_id: inserted.id,
    }

    const emailEnvoye = await envoyerEmailEvaluation(emailData)

    return res.status(200).json({
      success: true,
      emailEnvoye,
      message: emailEnvoye
        ? 'Évaluation enregistrée et responsables notifiés.'
        : 'Évaluation enregistrée. (Notification email non envoyée)',
    })

  } catch (err) {
    console.log('CATCH_ERROR: ' + err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}
