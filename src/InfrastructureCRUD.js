import React, { useState, useEffect } from 'react';
import './InfrastructureCRUD.css';

const API_URL = 'http://localhost:5000/api';

function InfrastructureCRUD() {
  const [infrastructures, setInfrastructures] = useState([]);
  const [formData, setFormData] = useState({ nom: '', adresse: '', capacite: '' });
  const [editingId, setEditingId] = useState(null);

  // États pour la fonctionnalité de recommandation
  const [recommendationPrompt, setRecommendationPrompt] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInfrastructures = async () => {
    try {
      const response = await fetch(`${API_URL}/infrastructures`);
      const data = await response.json();
      setInfrastructures(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des infrastructures:", error);
    }
  };

  useEffect(() => {
    fetchInfrastructures();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.adresse || !formData.capacite) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/infrastructures/${editingId}` : `${API_URL}/infrastructures`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ nom: '', adresse: '', capacite: '' });
        setEditingId(null);
        fetchInfrastructures();
      } else {
        console.error("Erreur lors de la sauvegarde de l'infrastructure");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (infra) => {
    setEditingId(infra.id);
    setFormData({ nom: infra.nom, adresse: infra.adresse, capacite: infra.capacite });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette infrastructure ?")) {
      try {
        const response = await fetch(`${API_URL}/infrastructures/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchInfrastructures();
        } else {
          console.error("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: '', adresse: '', capacite: '' });
  }

  // --- Logique de Recommandation ---
  const handleRecommendation = async () => {
    if (!recommendationPrompt) {
        alert("Veuillez décrire le type d'infrastructure que vous souhaitez.");
        return;
    }
    setIsLoading(true);
    setError('');
    setRecommendation(null);
    try {
        const response = await fetch(`${API_URL}/recommendation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: recommendationPrompt }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Une erreur est survenue.");
        }
        setRecommendation(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const applyRecommendation = () => {
      if (!recommendation) return;
      setFormData({
          nom: recommendation.nom || '',
          adresse: recommendation.adresse || '',
          capacite: recommendation.capacite || ''
      });
      alert(`Formulaire pré-rempli. N'oubliez pas d'associer manuellement le processus recommandé (ID: ${recommendation.processus_id}) à cette infrastructure après sa création.`);
      setRecommendation(null); // Nettoyer la recommandation après application
  }

  return (
    <div className="crud-container">
      {/* Section de Recommandation */}
      <div className="recommendation-section">
        <h2>Générer une Recommandation d'Infrastructure</h2>
        <textarea 
            placeholder="Décrivez votre besoin (ex: un centre de recyclage de plastique près de Sfax pour 5000 tonnes/an)"
            value={recommendationPrompt}
            onChange={(e) => setRecommendationPrompt(e.target.value)}
        />
        <button onClick={handleRecommendation} disabled={isLoading}>
            {isLoading ? 'Génération en cours...' : 'Obtenir une recommandation IA'}
        </button>
        {error && <p className="error-message">Erreur: {error}</p>}
        {recommendation && (
            <div className="recommendation-result">
                <h3>Recommandation de l'IA</h3>
                <p><strong>Nom:</strong> {recommendation.nom}</p>
                <p><strong>Adresse:</strong> {recommendation.adresse}</p>
                <p><strong>Capacité:</strong> {recommendation.capacite} tonnes/an</p>
                <p><strong>Processus à lier:</strong> {recommendation.processus_id}</p>
                <p><strong>Justification:</strong> {recommendation.raison}</p>
                <button onClick={applyRecommendation}>Appliquer cette recommandation</button>
            </div>
        )}
      </div>

      <main className="crud-main">
        <div className="form-container">
          <h2>{editingId ? 'Modifier l\'infrastructure' : 'Ajouter une infrastructure'}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="nom" placeholder="Nom de l\'infrastructure" value={formData.nom} onChange={handleInputChange} required />
            <input type="text" name="adresse" placeholder="Adresse" value={formData.adresse} onChange={handleInputChange} required />
            <input type="number" name="capacite" placeholder="Capacité (en tonnes)" value={formData.capacite} onChange={handleInputChange} required />
            <div className="form-buttons">
              <button type="submit">{editingId ? 'Mettre à jour' : 'Créer'}</button>
              {editingId && <button type="button" className="cancel-btn" onClick={cancelEdit}>Annuler</button>}
            </div>
          </form>
        </div>

        <div className="list-container">
          <h2>Liste des Infrastructures</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Capacité (t)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {infrastructures.map((infra) => (
                <tr key={infra.id}>
                  <td>{infra.nom}</td>
                  <td>{infra.adresse}</td>
                  <td>{infra.capacite}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(infra)}>Modifier</button>
                    <button className="delete-btn" onClick={() => handleDelete(infra.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default InfrastructureCRUD;