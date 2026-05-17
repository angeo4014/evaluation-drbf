import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Construit le HTML de l'email de notification
 */
function construireCorpsEmail(data) {
  const icones = {
    'Très bonne': { emoji: '😊', couleur: '#28a745' },
    'Bonne': { emoji: '🙂', couleur: '#ffc107' },
    'Pas du tout bonne': { emoji: '😞', couleur: '#dc3545' },
  }
  const { emoji, couleur } = icones[data.qualite] || { emoji: '❓', couleur: '#666' }
  const article = data.sous_direction === 'Budget' ? 'du' : 'de la'
  const lieuReception = data.porte === 'Secrétariat' ? 'Secrétariat' : `Porte ${data.porte}`

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF8C00 0%, #E67300 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px; }
    .info-block { background: #f8f9fa; border-left: 4px solid #FF8C00; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
    .info-block h3 { color: #FF8C00; margin-top: 0; }
    .info-row { background: white; padding: 12px 15px; margin: 10px 0; border-radius: 5px; }
    .info-label { font-weight: bold; color: #FF8C00; display: block; margin-bottom: 4px; font-size: 13px; }
    .info-value { color: #333; font-size: 15px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; color: white; background-color: ${couleur}; }
    .commentaire-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
    .footer small { font-size: 11px; color: #999; display: block; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Nouvelle Évaluation de Service</h1>
      <p>Direction Régionale du Budget et des Finances - Gbêkê</p>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Une nouvelle évaluation a été soumise pour la <strong>Sous-Direction ${article} ${data.sous_direction}</strong>.</p>
      <div class="info-block">
        <h3>Détails de l'évaluation</h3>
        <div class="info-row">
          <span class="info-label">📅 Date et heure</span>
          <span class="info-value">${data.date_evaluation}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🏢 Sous-direction</span>
          <span class="info-value">Sous-Direction ${article} ${data.sous_direction}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🚪 Lieu de réception</span>
          <span class="info-value">${lieuReception}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⭐ Qualité du service</span>
          <span class="info-value"><span class="badge">${emoji} ${data.qualite}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">📱 Téléphone du client</span>
          <span class="info-value">${data.telephone}</span>
        </div>
      </div>
      ${data.commentaire && data.commentaire !== 'Aucun commentaire' ? `
      <div class="commentaire-box">
        <strong style="color:#856404;">💬 Commentaire / Suggestion :</strong>
        <p style="margin:10px 0 0;">${data.commentaire.replace(/\n/g, '<br>')}</p>
      </div>` : ''}
      <p style="margin-top:25px;">
        <strong>Action recommandée :</strong> Veuillez prendre connaissance de cette évaluation et, si nécessaire, prendre les mesures appropriées.
      </p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement par le système d'évaluation de la DRBF Gbêkê.</p>
      <small>ID de l'évaluation : #${data.evaluation_id}</small>
    </div>
  </div>
</body>
</html>`
}

/**
 * Envoie l'email de notification aux responsables (remplace PHPMailer)
 */
export async function envoyerEmailEvaluation(data) {
  const destinataires = []

  if (data.sous_direction === 'Budget') {
    destinataires.push(process.env.EMAIL_SOUS_DIR_BUDGET)
  } else {
    destinataires.push(process.env.EMAIL_SOUS_DIR_SOLDE)
  }
  destinataires.push(process.env.EMAIL_CHEF_SERVICE_TECH)

  // Supprimer les doublons
  const destinatairesUniques = [...new Set(destinataires)].filter(Boolean)

  const article = data.sous_direction === 'Budget' ? 'du' : 'de la'
  const sujet = `Nouvelle évaluation - Sous-Direction ${article} ${data.sous_direction}`
  const corpsHtml = construireCorpsEmail(data)

  try {
    const { data: result, error } = await resend.emails.send({
      from: `DRBF Gbêkê - Évaluation <${process.env.EMAIL_EXPEDITEUR || 'onboarding@resend.dev'}>`,
      to: destinatairesUniques,
      subject: sujet,
      html: corpsHtml,
    })

    if (error) {
      console.error('Erreur Resend:', error)
      return false
    }

    console.log('Email envoyé avec succès:', result?.id)
    return true
  } catch (err) {
    console.error('Exception lors de l\'envoi email:', err)
    return false
  }
}
