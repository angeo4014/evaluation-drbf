import { useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [section, setSection] = useState('choix') // 'choix' | 'budget' | 'solde'
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // null | { success, message, emailEnvoye }

  const [form, setForm] = useState({
    sous_direction: '',
    porte: '',
    qualite: '',
    commentaire: '',
    telephone: '',
  })

  function goToSection2() {
    if (!form.sous_direction) {
      alert('Veuillez sélectionner une sous-direction avant de continuer.')
      return
    }
    setSection(form.sous_direction.toLowerCase())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setSection('choix')
    setForm(f => ({ ...f, porte: '', qualite: '', commentaire: '', telephone: '' }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!/^[0-9]{10}$/.test(form.telephone)) {
      alert('Veuillez entrer un numéro de téléphone valide (10 chiffres).')
      return
    }

    const ok = confirm('Êtes-vous sûr de vouloir envoyer cette évaluation ?')
    if (!ok) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sous_direction: form.sous_direction,
          porte: form.porte,
          qualite: form.qualite,
          commentaire: form.commentaire || 'Aucun commentaire',
          telephone: form.telephone,
        }),
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ success: false, message: 'Erreur réseau. Veuillez réessayer.' })
    } finally {
      setSubmitting(false)
    }
  }

  // === PAGE DE CONFIRMATION (remplace merci.php) ===
  if (result) {
    return (
      <div className={styles.body}>
        <Head><title>Merci - DRBF Gbêkê</title></Head>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1>Direction Régionale du Budget et des Finances</h1>
            <h2>Région de Gbêkê</h2>
          </header>
          <div className={styles.thankYou}>
            {result.success ? (
              <>
                <div className={styles.successIcon}>✅</div>
                <h2 className={styles.thankTitle}>Merci pour votre évaluation !</h2>
                <p className={styles.thankMessage}>
                  Votre avis est précieux et nous aidera à améliorer continuellement la qualité de nos services.
                  Les responsables concernés ont été informés de votre retour.
                </p>
                <div className={styles.infoBox}>
                  <h4>📊 Ce qui se passe maintenant :</h4>
                  <p>
                    ✓ Votre évaluation a été enregistrée dans notre système<br />
                    {result.emailEnvoye && <>✓ Un email de notification a été envoyé aux responsables<br /></>}
                    ✓ Votre retour sera analysé pour améliorer nos services<br />
                    ✓ Les équipes prendront les mesures appropriées si nécessaire
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.successIcon}>❌</div>
                <h2 className={styles.thankTitle} style={{ color: '#dc3545' }}>Une erreur est survenue</h2>
                <p className={styles.thankMessage}>{result.message}</p>
              </>
            )}
            <button className={styles.backButton} onClick={() => { setResult(null); setSection('choix'); setForm({ sous_direction: '', porte: '', qualite: '', commentaire: '', telephone: '' }) }}>
              ← Retour au formulaire
            </button>
            <p className={styles.footer}>
              Direction Régionale du Budget et des Finances - Région de Gbêkê<br />
              Pour toute question, contactez-nous au secrétariat.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // === FORMULAIRE ===
  const portesBudget = ['Secrétariat', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17']
  const portesSolde = ['Secrétariat', '18', '19', '20', '21', '22', '23', '24']

  return (
    <div className={styles.body}>
      <Head>
        <title>Formulaire d'Évaluation - DRBF Gbêkê</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Direction Régionale du Budget et des Finances</h1>
          <h2>Région de Gbêkê</h2>
          <p className={styles.subtitle}>Formulaire d'Évaluation de la Qualité de Service</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>

          {/* SECTION 1 : Choix de la sous-direction */}
          {section === 'choix' && (
            <div className={styles.formSection}>
              <h3>Quelle sous-direction souhaitez-vous évaluer ?</h3>
              <div className={styles.radioGroup}>
                {['Budget', 'Solde'].map(sd => (
                  <label key={sd} className={`${styles.radioCard} ${form.sous_direction === sd ? styles.radioCardChecked : ''}`}>
                    <input
                      type="radio"
                      name="sous_direction"
                      value={sd}
                      checked={form.sous_direction === sd}
                      onChange={e => setForm(f => ({ ...f, sous_direction: e.target.value }))}
                      style={{ position: 'absolute', opacity: 0 }}
                    />
                    <span className={styles.radioContent}>
                      <strong>Sous-Direction {sd === 'Budget' ? 'du Budget' : 'de la Solde'}</strong>
                    </span>
                  </label>
                ))}
              </div>
              <button type="button" className={styles.btnNext} onClick={goToSection2}>Suivant</button>
            </div>
          )}

          {/* SECTION 2 : Questions Budget ou Solde */}
          {(section === 'budget' || section === 'solde') && (
            <div className={styles.formSection}>
              <h3>Évaluation - Sous-Direction {section === 'budget' ? 'du Budget' : 'de la Solde'}</h3>

              {/* Porte */}
              <div className={styles.questionBlock}>
                <label className={styles.questionLabel}>Avez-vous été reçu(e) au secrétariat ou à une porte ?</label>
                <select
                  className={styles.formSelect}
                  value={form.porte}
                  onChange={e => setForm(f => ({ ...f, porte: e.target.value }))}
                  required
                >
                  <option value="">-- Sélectionnez --</option>
                  {(section === 'budget' ? portesBudget : portesSolde).map(p => (
                    <option key={p} value={p}>{p === 'Secrétariat' ? 'Secrétariat' : `Porte ${p}`}</option>
                  ))}
                </select>
              </div>

              {/* Qualité */}
              <div className={styles.questionBlock}>
                <label className={styles.questionLabel}>Comment jugez-vous la qualité du service reçu ?</label>
                <div className={styles.radioGroupVertical}>
                  {[
                    { value: 'Très bonne', label: '😊 Très bonne' },
                    { value: 'Bonne', label: '🙂 Bonne' },
                    { value: 'Pas du tout bonne', label: '😞 Pas du tout bonne' },
                  ].map(opt => (
                    <label key={opt.value} className={`${styles.radioOption} ${form.qualite === opt.value ? styles.radioOptionChecked : ''}`}>
                      <input
                        type="radio"
                        name="qualite"
                        value={opt.value}
                        checked={form.qualite === opt.value}
                        onChange={e => setForm(f => ({ ...f, qualite: e.target.value }))}
                        required
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div className={styles.questionBlock}>
                <label className={styles.questionLabel}>Avez-vous un commentaire ou une suggestion ?</label>
                <textarea
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="Votre commentaire ici..."
                  value={form.commentaire}
                  onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))}
                />
              </div>

              {/* Téléphone */}
              <div className={styles.questionBlock}>
                <label className={styles.questionLabel}>Veuillez entrer votre numéro de téléphone</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="Ex: 0707070707"
                  pattern="[0-9]{10}"
                  value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  required
                />
                <small className={styles.helpText}>Format: 10 chiffres</small>
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.btnBack} onClick={goBack}>Retour</button>
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                  {submitting ? 'Envoi en cours...' : "Envoyer l'évaluation"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
