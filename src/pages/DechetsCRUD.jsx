import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  Table, Button, Modal, Form, Alert, 
  Pagination, Card, Row, Col, Badge,
  InputGroup, FormControl, Dropdown
} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Base from "./Base";

// Charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "http://127.0.0.1:5000";

function DechetsCRUD() {
  // États principaux
  const [dechets, setDechets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [currentDechet, setCurrentDechet] = useState({});
  const [mode, setMode] = useState("add");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");

  // États pour les fonctionnalités avancées
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Toast notification
  const showToast = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Fetch des données
  const fetchDechets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/dechets/list`);
      setDechets(res.data.results?.bindings || []);
     } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Erreur lors du chargement des déchets");
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDechets();
  }, []);

  // Opérations CRUD
  const handleAddEdit = async () => {
    if (!currentDechet.nom?.trim() || !currentDechet.type?.trim()) {
      setError("Le nom et le type sont obligatoires");
      showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    try {
      if (mode === "add") {
        await axios.post(`${API_BASE}/dechets/add`, {
          nom: currentDechet.nom.trim(),
          type: currentDechet.type.trim(),
        });
        showToast('Déchet ajouté avec succès');
      } else if (mode === "edit") {
        await axios.post(`${API_BASE}/dechets/edit`, {
          uri: currentDechet.uri,
          nom: currentDechet.nom.trim(),
          type: currentDechet.type.trim(),
        });
        showToast('Déchet modifié avec succès');
      }
      setModalShow(false);
      setCurrentDechet({});
      setSelectedFile(null);
      setError("");
      fetchDechets();
    } catch (err) {
      console.error("Erreur lors de l'opération:", err);
      setError("Erreur lors de l'opération");
      showToast('Erreur lors de l\'opération', 'error');
    }
  };

  const handleDelete = async (uri, nom) => {
    if (!window.confirm(`Supprimer le déchet "${nom}" ?`)) return;
    try {
      await axios.post(`${API_BASE}/dechets/delete`, { uri });
      showToast('Déchet supprimé avec succès');
      fetchDechets();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression");
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleImagePredict = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner une image !");
      showToast('Veuillez sélectionner une image', 'warning');
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError("Veuillez sélectionner un fichier image valide");
      showToast('Fichier image invalide', 'error');
      return;
    }

    setImageLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${API_BASE}/classify-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (res.data && res.data.type_detected) {
        const nomPrediction = await predictDechetName(selectedFile);
        
        setCurrentDechet({
          nom: nomPrediction || "Déchet identifié",
          type: res.data.type_detected,
        });
        
        setMode("add");
        setModalShow(true);
        showToast('Image analysée avec succès');
      } else {
        setError("Type de déchet non détecté dans l'image");
        showToast('Aucun déchet détecté dans l\'image', 'warning');
      }
    } catch (err) {
      console.error("Erreur lors de l'analyse:", err);
      setError("Erreur lors de l'analyse de l'image");
      showToast('Erreur lors de l\'analyse de l\'image', 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const predictDechetName = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_BASE}/predict-dechet-name`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.nom_predicted;
    } catch (err) {
      console.error("Erreur prédiction nom:", err);
      return null;
    }
  };

  // Fonctionnalités avancées
  const filteredDechets = useMemo(() => {
    let filtered = dechets.filter(dechet => {
      const matchesSearch = dechet.nom?.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dechet.type?.value.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || dechet.type?.value === typeFilter;
      return matchesSearch && matchesType;
    });

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]?.value || '';
        const bValue = b[sortConfig.key]?.value || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [dechets, searchTerm, typeFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredDechets.length / itemsPerPage);
  const paginatedDechets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDechets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDechets, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Statistiques pour les charts
  const typeStats = useMemo(() => {
    const stats = {};
    dechets.forEach(dechet => {
      const type = dechet.type?.value || 'Non classé';
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  }, [dechets]);

  // Données pour les charts
  const chartData = {
    bar: {
      labels: Object.keys(typeStats),
      datasets: [
        {
          label: 'Nombre de déchets par type',
          data: Object.values(typeStats),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    doughnut: {
      labels: Object.keys(typeStats),
      datasets: [
        {
          data: Object.values(typeStats),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Types uniques pour le filtre
  const uniqueTypes = useMemo(() => {
    const types = [...new Set(dechets.map(d => d.type?.value).filter(Boolean))];
    return types;
  }, [dechets]);

  // Reset form
  const resetForm = () => {
    setCurrentDechet({});
    setSelectedFile(null);
    setError("");
  };

  const openAddModal = () => {
    setMode("add");
    resetForm();
    setModalShow(true);
  };

  const openEditModal = (dechet) => {
    setMode("edit");
    setCurrentDechet({
      uri: dechet.dechet.value,
      nom: dechet.nom.value,
      type: dechet.type.value,
    });
    setModalShow(true);
  };

  const getTypeBadgeVariant = (type) => {
    const variants = {
      'Recyclable': 'success',
      'Compostable': 'warning',
      'Dangereux': 'danger',
      'Autre': 'secondary'
    };
    return variants[type] || 'primary';
  };

  return (
    <Base title="Gestion de Déchets - Tableau de Bord">
      <div className="container-fluid mt-4">
        <ToastContainer />
        
        {/* En-tête avec statistiques */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-dark mb-1">Gestion des Déchets</h2>
                <p className="text-muted mb-0">
                  {dechets.length} déchets au total • {uniqueTypes.length} types différents
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={openAddModal}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajouter Manuellement
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Total Déchets</h6>
                    <h3 className="text-primary">{dechets.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-trash text-primary fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Types Différents</h6>
                    <h3 className="text-success">{uniqueTypes.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-tags text-success fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Recyclables</h6>
                    <h3 className="text-info">{typeStats['Recyclable'] || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-recycle text-info fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Dangereux</h6>
                    <h3 className="text-danger">{typeStats['Dangereux'] || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-exclamation-triangle text-danger fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Répartition par Type</h5>
              </Card.Header>
              <Card.Body>
                <Bar data={chartData.bar} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Distribution des Types</h5>
              </Card.Header>
              <Card.Body>
                <Doughnut data={chartData.doughnut} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Outils de gestion */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white">
            <Row className="align-items-center">
              <Col md={6}>
                <h5 className="mb-0">Gestion des Déchets</h5>
              </Col>
              <Col md={6}>
                <div className="d-flex gap-2 justify-content-end">
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setSelectedFile(e.target.files[0]);
                        setError("");
                      }}
                      className="form-control form-control-sm"
                      style={{width: '200px'}}
                    />
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleImagePredict}
                      disabled={imageLoading || !selectedFile}
                      className="ms-2"
                    >
                      {imageLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Analyse...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-camera me-2"></i>
                          Identifier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            {/* Filtres et recherche */}
            <Row className="mb-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Rechercher par nom ou type..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tous les types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 par page</option>
                  <option value={10}>10 par page</option>
                  <option value={20}>20 par page</option>
                  <option value={50}>50 par page</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Tableau */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2 text-muted">Chargement des déchets...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th 
                          style={{cursor: 'pointer'}}
                          onClick={() => handleSort('nom')}
                        >
                          Nom 
                          {sortConfig.key === 'nom' && (
                            <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th 
                          style={{cursor: 'pointer'}}
                          onClick={() => handleSort('type')}
                        >
                          Type
                          {sortConfig.key === 'type' && (
                            <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th>URI</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDechets.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            <i className="bi bi-inbox display-4 text-muted"></i>
                            <p className="mt-2 text-muted">Aucun déchet trouvé</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedDechets.map((d, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold">{d.nom?.value}</td>
                            <td>
                              <Badge bg={getTypeBadgeVariant(d.type?.value)}>
                                {d.type?.value}
                              </Badge>
                            </td>
                            <td>
                              <small className="text-muted font-monospace">
                                {d.dechet?.value}
                              </small>
                            </td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-1"
                                onClick={() => openEditModal(d)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(d.dechet.value, d.nom?.value)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted">
                      Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredDechets.length)} sur {filteredDechets.length} déchets
                    </div>
                    <Pagination>
                      <Pagination.Prev 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Modal */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>
              <i className={`bi bi-${mode === 'add' ? 'plus-circle' : 'pencil'} me-2`}></i>
              {mode === "add" ? "Ajouter un Déchet" : "Modifier le Déchet"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nom du Déchet *</Form.Label>
                <Form.Control
                  type="text"
                  value={currentDechet.nom || ""}
                  onChange={(e) =>
                    setCurrentDechet({ ...currentDechet, nom: e.target.value })
                  }
                  placeholder="Ex: Bouteille en plastique, Canette, etc."
                />
                {mode === "add" && (
                  <Form.Text className="text-muted">
                    <i className="bi bi-robot me-1"></i>
                    Le nom a été prédit automatiquement depuis l'image
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Type de Déchet *</Form.Label>
                <Form.Control
                  as="select"
                  value={currentDechet.type || ""}
                  onChange={(e) =>
                    setCurrentDechet({ ...currentDechet, type: e.target.value })
                  }
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Compostable">Compostable</option>
                  <option value="Dangereux">Dangereux</option>
                  <option value="Autre">Autre</option>
                </Form.Control>
                {mode === "add" && (
                  <Form.Text className="text-muted">
                    <i className="bi bi-robot me-1"></i>
                    Le type a été détecté automatiquement depuis l'image
                  </Form.Text>
                )}
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setModalShow(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleAddEdit}
                  disabled={!currentDechet.nom?.trim() || !currentDechet.type?.trim()}
                >
                  <i className={`bi bi-${mode === 'add' ? 'check-lg' : 'pencil'} me-1`}></i>
                  {mode === "add" ? "Ajouter" : "Modifier"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>

      {/* Styles additionnels */}
      <style jsx>{`
        .card {
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
        }
        .badge {
          font-size: 0.75em;
        }
      `}</style>
    </Base>
  );
}

export default DechetsCRUD;