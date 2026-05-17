import { getSupabaseAdmin } from '../../lib/supabase'
import { envoyerEmailEvaluation } from '../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { sous_direction, porte, qualite, commentaire, telephone } = req.body

  // === VALIDATION ===
  const errors = []

  if (!sous_direction || !['Budget', 'Solde'].includes(sous_direction)) {
    errors.push('Veuillez sélectionner une sous-direction valide.')
  }
  if (!porte) {
    errors.push('Veuillez sélectionner un lieu de réception.')
  }
  if (!qualite || !['Très bonne', 'Bonne', 'Pas du tout bonne'].includes(qualite)) {
    errors.push('Veuillez évaluer la qualité du service.')
  }
  if (!telephone || !/^[0-9]{10}$/.test(telephone)) {
    errors.push('Veuillez entrer un numéro de téléphone valide (10 chiffres).')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  // === ENREGISTREMENT EN BASE DE DONNÉES (Supabase) ===
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
    console.error('Erreur Supabase:', dbError)
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'enregistrement.',
      detail: dbError.message,
      code: dbError.code,
      hint: dbError.hint
    })
  }

  // === ENVOI EMAIL (Resend remplace PHPMailer) ===
  const now = new Date()
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace(',', ' à')

  const emailData = {
    sous_direction,
    porte,
    qualite,
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
}
