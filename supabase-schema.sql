-- =====================================================
-- SCRIPT SQL POUR SUPABASE (PostgreSQL)
-- Direction Régionale du Budget et des Finances - Gbêkê
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Supabase → SQL Editor → New query → Collez ce script → Run
-- =====================================================

-- TABLE: evaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id BIGSERIAL PRIMARY KEY,
    sous_direction VARCHAR(50) NOT NULL,
    porte VARCHAR(20) NOT NULL,
    qualite_service VARCHAR(50) NOT NULL,
    commentaire TEXT,
    telephone VARCHAR(20) NOT NULL,
    date_evaluation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sous_direction ON evaluations(sous_direction);
CREATE INDEX IF NOT EXISTS idx_date_evaluation ON evaluations(date_evaluation DESC);
CREATE INDEX IF NOT EXISTS idx_qualite_service ON evaluations(qualite_service);

-- =====================================================
-- POLITIQUE DE SÉCURITÉ (Row Level Security)
-- =====================================================

-- Activer RLS sur la table
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Autoriser l'insertion publique (pour le formulaire)
CREATE POLICY "Insertion publique" ON evaluations
    FOR INSERT
    WITH CHECK (true);

-- Autoriser la lecture uniquement via service_role (pour l'admin)
-- Le frontend admin utilise SUPABASE_SERVICE_ROLE_KEY → accès total
-- La clé anon ne peut pas lire les données

-- =====================================================
-- DONNÉES DE TEST (à supprimer en production)
-- =====================================================

INSERT INTO evaluations (sous_direction, porte, qualite_service, commentaire, telephone, date_evaluation)
VALUES
    ('Budget', '8', 'Très bonne', 'Excellent service, personnel très accueillant.', '0707070701', NOW() - INTERVAL '2 days'),
    ('Budget', 'Secrétariat', 'Bonne', 'Service correct, quelques améliorations possibles.', '0707070702', NOW() - INTERVAL '1 day'),
    ('Solde', '18', 'Très bonne', 'Rapidité et efficacité au rendez-vous.', '0707070703', NOW() - INTERVAL '3 hours'),
    ('Solde', '20', 'Pas du tout bonne', 'Attente trop longue, manque d''information.', '0707070704', NOW() - INTERVAL '1 hour'),
    ('Budget', '12', 'Bonne', 'Personnel compétent.', '0707070705', NOW());

-- Pour supprimer les données de test plus tard:
-- DELETE FROM evaluations WHERE telephone LIKE '070707070%';

-- Pour vérifier:
-- SELECT * FROM evaluations ORDER BY date_evaluation DESC;
