import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Card, 
  Row, 
  Col, 
  Pagination,
  Badge,
  InputGroup,
  FormControl,
  Dropdown
} from "react-bootstrap";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Download,
  Upload,
  RefreshCw,
  Zap
} from "react-feather";
import "bootstrap/dist/css/bootstrap.min.css";
import Base from "./Base";

const API_BASE = "http://127.0.0.1:5000";

// 🎨 Thème dark personnalisé
const darkTheme = {
  background: "#0f0f23",
  surface: "#1a1b2f",
  primary: "#6366f1",
  secondary: "#8b5cf6",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  border: "#2d3748",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444"
};

function DechetsCRUD() {
  const [dechets, setDechets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [currentDechet, setCurrentDechet] = useState({});
  const [mode, setMode] = useState("add");
  
  // 🔄 États pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 📊 Récupérer les déchets
  const fetchDechets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/dechets/list`);
      setDechets(res.data.results?.bindings || []);
    } catch (err) {
      console.error("Erreur fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDechets();
  }, []);

  // 🎯 Gestion CRUD
  const handleAddEdit = async () => {
    try {
      if (mode === "add") {
        await axios.post(`${API_BASE}/dechets/add`, {
          nom: currentDechet.nom,
          type: currentDechet.type,
        });
      } else {
        await axios.post(`${API_BASE}/dechets/edit`, {
          uri: currentDechet.uri,
          nom: currentDechet.nom,
          type: currentDechet.type,
        });
      }
      setModalShow(false);
      fetchDechets();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  const handleDelete = async (uri, nom) => {
    if (!window.confirm(`Supprimer le déchet "${nom}" ?`)) return;
    try {
      await axios.post(`${API_BASE}/dechets/delete`, { uri });
      fetchDechets();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // 🔄 Filtrage et recherche
  const filteredDechets = dechets.filter(dechet => {
    const matchesSearch = dechet.nom?.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dechet.type?.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || dechet.type?.value === typeFilter;
    return matchesSearch && matchesType;
  });

  // 📄 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDechets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDechets.length / itemsPerPage);

  // 🔄 Tri
  const sortedItems = React.useMemo(() => {
    if (!sortConfig.key) return currentItems;
    
    return [...currentItems].sort((a, b) => {
      const aValue = a[sortConfig.key]?.value || '';
      const bValue = b[sortConfig.key]?.value || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [currentItems, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // 🎨 Types de déchets pour le filtre
  const dechetTypes = [...new Set(dechets.map(d => d.type?.value).filter(Boolean))];

  // 📊 Statistiques
  const stats = {
    total: dechets.length,
    filtered: filteredDechets.length,
    types: dechetTypes.length
  };

  return (
    <Base title="Gestion des Déchets - SPARQL">
      <div style={{ 
        minHeight: '100vh', 
        background: darkTheme.background,
        color: darkTheme.text,
        padding: '20px 0'
      }}>
        <div className="container-fluid">
          {/* 📊 En-tête avec statistiques */}
          <Row className="mb-4">
            <Col>
              <Card style={{ 
                background: `linear-gradient(135deg, ${darkTheme.surface} 0%, ${darkTheme.primary}20 100%)`,
                border: `1px solid ${darkTheme.border}`,
                backdropFilter: 'blur(10px)'
              }}>
                <Card.Body>
                  <Row className="text-center">
                    <Col md={4}>
                      <div className="d-flex align-items-center justify-content-center">
                        <Zap size={24} className="text-warning me-2" />
                        <div>
                          <h4 className="mb-0" style={{ color: darkTheme.text }}>{stats.total}</h4>
                          <small style={{ color: darkTheme.textMuted }}>Total Déchets</small>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center justify-content-center">
                        <Filter size={24} className="text-info me-2" />
                        <div>
                          <h4 className="mb-0" style={{ color: darkTheme.text }}>{stats.filtered}</h4>
                          <small style={{ color: darkTheme.textMuted }}>Filtrés</small>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center justify-content-center">
                        <Download size={24} className="text-success me-2" />
                        <div>
                          <h4 className="mb-0" style={{ color: darkTheme.text }}>{stats.types}</h4>
                          <small style={{ color: darkTheme.textMuted }}>Types</small>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 🎛️ Barre de contrôle */}
          <Card className="mb-4" style={{ 
            background: darkTheme.surface,
            border: `1px solid ${darkTheme.border}`
          }}>
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      background: darkTheme.background, 
                      border: `1px solid ${darkTheme.border}`,
                      color: darkTheme.textMuted
                    }}>
                      <Search size={16} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Rechercher un déchet..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        background: darkTheme.background,
                        border: `1px solid ${darkTheme.border}`,
                        color: darkTheme.text
                      }}
                    />
                  </InputGroup>
                </Col>
                
                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="outline-secondary" 
                      style={{
                        background: darkTheme.background,
                        border: `1px solid ${darkTheme.border}`,
                        color: darkTheme.text,
                        width: '100%'
                      }}
                    >
                      <Filter size={16} className="me-2" />
                      Type: {typeFilter === 'all' ? 'Tous' : typeFilter}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ 
                      background: darkTheme.surface,
                      border: `1px solid ${darkTheme.border}`
                    }}>
                      <Dropdown.Item 
                        onClick={() => setTypeFilter('all')}
                        style={{ color: darkTheme.text }}
                      >
                        Tous les types
                      </Dropdown.Item>
                      {dechetTypes.map(type => (
                        <Dropdown.Item 
                          key={type}
                          onClick={() => {
                            setTypeFilter(type);
                            setCurrentPage(1);
                          }}
                          style={{ color: darkTheme.text }}
                        >
                          {type}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>

                <Col md={5} className="text-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setMode("add");
                      setCurrentDechet({});
                      setModalShow(true);
                    }}
                    className="me-2"
                    style={{
                      background: darkTheme.primary,
                      border: 'none'
                    }}
                  >
                    <Plus size={16} className="me-1" />
                    Nouveau Déchet
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={fetchDechets}
                    style={{
                      border: `1px solid ${darkTheme.border}`,
                      color: darkTheme.text
                    }}
                  >
                    <RefreshCw size={16} />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 📋 Tableau des déchets */}
          <Card style={{ 
            background: darkTheme.surface,
            border: `1px solid ${darkTheme.border}`,
            overflow: 'hidden'
          }}>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <RefreshCw size={32} className="spinner" style={{ color: darkTheme.primary }} />
                  <p className="mt-2" style={{ color: darkTheme.textMuted }}>Chargement des données...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="mb-0" style={{ color: darkTheme.text }}>
                      <thead style={{ 
                        background: `linear-gradient(135deg, ${darkTheme.primary}20 0%, ${darkTheme.secondary}20 100%)` 
                      }}>
                        <tr>
                          <th 
                            style={{ cursor: 'pointer', padding: '12px' }}
                            onClick={() => handleSort('nom')}
                          >
                            Nom {sortConfig.key === 'nom' && (
                              <small>{sortConfig.direction === 'asc' ? '↑' : '↓'}</small>
                            )}
                          </th>
                          <th 
                            style={{ cursor: 'pointer', padding: '12px' }}
                            onClick={() => handleSort('type')}
                          >
                            Type {sortConfig.key === 'type' && (
                              <small>{sortConfig.direction === 'asc' ? '↑' : '↓'}</small>
                            )}
                          </th>
                          <th style={{ padding: '12px' }}>URI</th>
                          <th style={{ padding: '12px', width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedItems.map((d, idx) => (
                          <tr key={idx} style={{ 
                            borderBottom: `1px solid ${darkTheme.border}`,
                            transition: 'all 0.2s ease'
                          }}>
                            <td style={{ padding: '12px' }}>
                              <strong>{d.nom?.value}</strong>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <Badge 
                                style={{ 
                                  background: `linear-gradient(135deg, ${darkTheme.secondary} 0%, ${darkTheme.primary} 100%)`,
                                  fontSize: '0.75em'
                                }}
                              >
                                {d.type?.value}
                              </Badge>
                            </td>
                            <td style={{ 
                              padding: '12px',
                              fontSize: '0.8em',
                              color: darkTheme.textMuted,
                              fontFamily: 'monospace'
                            }}>
                              {d.dechet?.value}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => {
                                  setMode("edit");
                                  setCurrentDechet({
                                    uri: d.dechet.value,
                                    nom: d.nom.value,
                                    type: d.type.value,
                                  });
                                  setModalShow(true);
                                }}
                                className="me-1"
                                style={{
                                  border: `1px solid ${darkTheme.primary}`,
                                  color: darkTheme.primary
                                }}
                              >
                                <Edit size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(d.dechet.value, d.nom.value)}
                                style={{
                                  border: `1px solid ${darkTheme.danger}`,
                                  color: darkTheme.danger
                                }}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* 📄 Pagination */}
                  {filteredDechets.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top" 
                         style={{ borderColor: darkTheme.border }}>
                      <small style={{ color: darkTheme.textMuted }}>
                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredDechets.length)} sur {filteredDechets.length} déchets
                      </small>
                      
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          style={{
                            background: darkTheme.background,
                            border: `1px solid ${darkTheme.border}`,
                            color: darkTheme.text
                          }}
                        />
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={i + 1 === currentPage}
                            onClick={() => setCurrentPage(i + 1)}
                            style={{
                              background: i + 1 === currentPage ? darkTheme.primary : darkTheme.background,
                              border: `1px solid ${darkTheme.border}`,
                              color: i + 1 === currentPage ? '#fff' : darkTheme.text
                            }}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        
                        <Pagination.Next
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          style={{
                            background: darkTheme.background,
                            border: `1px solid ${darkTheme.border}`,
                            color: darkTheme.text
                          }}
                        />
                      </Pagination>
                    </div>
                  )}

                  {filteredDechets.length === 0 && (
                    <div className="text-center py-5">
                      <Search size={48} style={{ color: darkTheme.textMuted, opacity: 0.5 }} />
                      <p className="mt-3" style={{ color: darkTheme.textMuted }}>
                        {dechets.length === 0 ? 'Aucun déchet trouvé' : 'Aucun résultat pour votre recherche'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* 🎯 Modal d'ajout/édition */}
        <Modal 
          show={modalShow} 
          onHide={() => setModalShow(false)}
          centered
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <Modal.Header 
            closeButton
            style={{
              background: darkTheme.surface,
              borderBottom: `1px solid ${darkTheme.border}`,
              color: darkTheme.text
            }}
          >
            <Modal.Title>
              {mode === "add" ? "➕ Ajouter un déchet" : "✏️ Modifier le déchet"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ 
            background: darkTheme.surface,
            color: darkTheme.text
          }}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nom du déchet</Form.Label>
                <Form.Control
                  type="text"
                  value={currentDechet.nom || ""}
                  onChange={(e) =>
                    setCurrentDechet({ ...currentDechet, nom: e.target.value })
                  }
                  style={{
                    background: darkTheme.background,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.text
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Type de déchet</Form.Label>
                <Form.Control
                  type="text"
                  value={currentDechet.type || ""}
                  onChange={(e) =>
                    setCurrentDechet({ ...currentDechet, type: e.target.value })
                  }
                  style={{
                    background: darkTheme.background,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.text
                  }}
                  placeholder="Ex: Plastique, Verre, Métal..."
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button 
                  onClick={handleAddEdit}
                  style={{
                    background: darkTheme.primary,
                    border: 'none',
                    flex: 1
                  }}
                >
                  {mode === "add" ? "Créer" : "Modifier"}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setModalShow(false)}
                  style={{
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.text,
                    flex: 1
                  }}
                >
                  Annuler
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>

      {/* 🎨 Styles inline pour le dark mode */}
      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .table-responsive::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-responsive::-webkit-scrollbar-track {
          background: ${darkTheme.background};
        }
        
        .table-responsive::-webkit-scrollbar-thumb {
          background: ${darkTheme.border};
          border-radius: 4px;
        }
        
        .table tbody tr:hover {
          background: ${darkTheme.primary}15 !important;
          transform: translateX(2px);
        }
      `}</style>
    </Base>
  );
}

export default DechetsCRUD;