
import React, { useState, useEffect } from 'react';
import './ProcessusCRUD.css'; // On utilisera un fichier CSS dédié

const API_URL = 'http://localhost:5000/api';

function ProcessusCRUD() {
  const [processusList, setProcessusList] = useState([]);
  const [infrastructures, setInfrastructures] = useState([]); // Nouvel état pour les infrastructures
  const [formData, setFormData] = useState({ label: '', infra_id: '' });
  const [editingId, setEditingId] = useState(null);

  // Fonction pour récupérer tous les processus
  const fetchProcessus = async () => {
    try {
      const response = await fetch(`${API_URL}/processus`);
      const data = await response.json();
      setProcessusList(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des processus:", error);
    }
  };

  // Fonction pour récupérer toutes les infrastructures (pour le menu déroulant)
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
    fetchProcessus();
    fetchInfrastructures(); // Charger les infrastructures au démarrage
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label) {
      alert("Veuillez remplir le nom du processus");
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/processus/${editingId}` : `${API_URL}/processus`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Le backend s'attend à `label` et `infra_id`
      });

      if (response.ok) {
        setFormData({ label: '', infra_id: '' });
        setEditingId(null);
        fetchProcessus(); // Recharger la liste
      } else {
        console.error("Erreur lors de la sauvegarde du processus");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (processus) => {
    setEditingId(processus.id);
    setFormData({ label: processus.label, infra_id: processus.infra_id || '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce processus ?")) {
      try {
        const response = await fetch(`${API_URL}/processus/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchProcessus(); // Recharger la liste
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
    setFormData({ label: '', infra_id: '' });
  }

  return (
    <div className="processus-container">
      <header>
        <h1>Gestion des Processus</h1>
      </header>
      <main className="processus-main">
        <div className="form-container">
          <h2>{editingId ? 'Modifier le processus' : 'Ajouter un processus'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="label"
              placeholder="Nom du processus (ex: Tri, Collecte...)"
              value={formData.label}
              onChange={handleInputChange}
              required
            />
            <select name="infra_id" value={formData.infra_id} onChange={handleInputChange}>
                <option value="">-- Aucune infrastructure --</option>
                {infrastructures.map(infra => (
                    <option key={infra.id} value={infra.id}>{infra.nom}</option>
                ))}
            </select>
            <div className="form-buttons">
              <button type="submit">{editingId ? 'Mettre à jour' : 'Créer'}</button>
              {editingId && <button type="button" className="cancel-btn" onClick={cancelEdit}>Annuler</button>}
            </div>
          </form>
        </div>

        <div className="list-container">
          <h2>Liste des Processus</h2>
          <table>
            <thead>
              <tr>
                <th>Nom (Label)</th>
                <th>Hébergé par</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processusList.map((proc) => (
                <tr key={proc.id}>
                  <td>{proc.label}</td>
                  <td>{proc.infra_label || 'N/A'}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(proc)}>Modifier</button>
                    <button className="delete-btn" onClick={() => handleDelete(proc.id)}>Supprimer</button>
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

export default ProcessusCRUD;
