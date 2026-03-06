import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, LogOut, Star, Edit3, X } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export default function Dashboard({ onLogout }) {
  const [albums, setAlbums] = useState([]); // New albums staged for upload
  const [savedAlbums, setSavedAlbums] = useState([]); // Albums fetched from DB
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedAlbums = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedAlbums(fetchedAlbums);
    } catch (error) {
      console.error("Error fetching albums: ", error);
    }
  };


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    // Limit to 10 files per album
    const fileArray = Array.from(files).slice(0, 10);
    const newImages = fileArray.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const newAlbum = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nova Coleção',
      tag: '', // none, 'Novidade', 'Promoção', 'Esgotado'
      isVisible: true,
      files: fileArray, // keep reference to actual files for upload
      images: newImages // visual preview
    };

    setAlbums((prev) => [newAlbum, ...prev]);
  };

  const updateAlbumTitle = (id, newTitle) => {
    setAlbums((prev) => prev.map(album => album.id === id ? { ...album, title: newTitle } : album));
  };

  const updateAlbumTag = (id, newTag) => {
    setAlbums((prev) => prev.map(album => album.id === id ? { ...album, tag: newTag } : album));
  };

  const toggleAlbumVisibility = (id) => {
    setAlbums((prev) => prev.map(album => album.id === id ? { ...album, isVisible: !album.isVisible } : album));
  };

  const removeAlbum = (id) => {
    setAlbums((prev) => prev.filter((album) => album.id !== id));
  };

  const removeSavedAlbum = async (id, images) => {
    if (!window.confirm("Certeza que deseja excluir esta coleção permanentemente?")) return;
    try {
      // 1. Delete images from Storage
      for (const img of images) {
        // img url is a download URL. We need to create a reference from it or just store the paths in DB.
        // Easiest is to store the full path in DB or create ref from URL.
        try {
          const imgRef = ref(storage, img);
          await deleteObject(imgRef);
        } catch (e) { console.error("Could not delete image", e) }
      }

      // 2. Delete document from Firestore
      await deleteDoc(doc(db, "albums", id));

      // Update state
      setSavedAlbums((prev) => prev.filter((album) => album.id !== id));
    } catch (error) {
      console.error("Error removing album:", error);
      alert("Erro ao excluir a coleção.");
    }
  };

  const updateSavedAlbumTitle = async (id, newTitle) => {
    try {
      await updateDoc(doc(db, "albums", id), { title: newTitle });
      setSavedAlbums((prev) => prev.map(album => album.id === id ? { ...album, title: newTitle } : album));
    } catch (e) {
      console.error("Error updating title:", e);
      alert("Erro ao atualizar título");
    }
  };

  const updateSavedAlbumTag = async (id, newTag) => {
    try {
      await updateDoc(doc(db, "albums", id), { tag: newTag });
      setSavedAlbums((prev) => prev.map(album => album.id === id ? { ...album, tag: newTag } : album));
    } catch (e) {
      console.error("Error updating tag:", e);
    }
  };

  const toggleSavedAlbumVisibility = async (id, currentVisibility) => {
    try {
      const newVisibility = currentVisibility === undefined ? false : !currentVisibility;
      await updateDoc(doc(db, "albums", id), { isVisible: newVisibility });
      setSavedAlbums((prev) => prev.map(album => album.id === id ? { ...album, isVisible: newVisibility } : album));
    } catch (e) {
      console.error("Error updating visibility:", e);
    }
  };

  const publishAlbums = async () => {
    if (albums.length === 0) return;
    setUploading(true);

    try {
      const uploadPromises = albums.map(async (album) => {
        // 1. Upload all images in the album to Storage
        const fileUploadPromises = album.files.map(async (file, index) => {
          const fileRef = ref(storage, `albums/${Date.now()}_${index}_${file.name}`);
          const snapshot = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          return downloadURL;
        });

        const uploadedImageUrls = await Promise.all(fileUploadPromises);

        // 2. Save album metadata to Firestore
        const docRef = await addDoc(collection(db, "albums"), {
          title: album.title,
          tag: album.tag,
          isVisible: album.isVisible,
          images: uploadedImageUrls,
          createdAt: serverTimestamp()
        });

        return { id: docRef.id, title: album.title, images: uploadedImageUrls };
      });

      await Promise.all(uploadPromises);
      alert('Coleções publicadas com sucesso!');

      // Clear staged albums and refresh the list
      setAlbums([]);
      fetchAlbums();
    } catch (error) {
      console.error("Error publishing albums: ", error);
      alert('Erro ao publicar as coleções.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gold-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2rem' }}>
            <Star color="var(--accent-gold)" fill="var(--accent-gold)" size={28} />
            Star Bella Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Gerencie o seu catálogo premium com facilidade.</p>
        </div>
        <button onClick={onLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={18} />
          Sair
        </button>
      </header>

      <div className="glass fade-in" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Adicionar Novas Peças</h2>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-gold)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            backgroundColor: dragActive ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Upload size={32} color="var(--accent-gold)" />
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Arraste suas fotos ou <span className="text-gold">clique para buscar</span>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Pode selecionar até 10 fotos de uma vez para formar a coleção
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fade-in" style={{ animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Coleções a serem Publicadas ({albums.length})</h2>
          {albums.length > 0 && (
            <button className="btn-gold" onClick={publishAlbums} disabled={uploading} style={{ opacity: uploading ? 0.7 : 1 }}>
              {uploading ? 'Publicando...' : 'Publicar Alterações'}
            </button>
          )}
        </div>

        {albums.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {albums.map((album) => (
              <div key={album.id} className="glass" style={{
                borderRadius: '12px', overflow: 'hidden', position: 'relative', group: 'true'
              }}>
                <img
                  src={album.images[0].url}
                  alt={album.title}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                />

                {album.images.length > 1 && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    padding: '4px 8px', borderRadius: '12px',
                    fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {album.images.length} fotos
                  </div>
                )}

                <div style={{ padding: '8px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Edit3 size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    value={album.title}
                    onChange={(e) => updateAlbumTitle(album.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: '500', color: 'var(--text-main)' }}
                  />
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-card)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <select
                    value={album.tag}
                    onChange={(e) => updateAlbumTag(album.id, e.target.value)}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', fontSize: '0.8rem', color: 'var(--text-main)', width: '60%' }}
                  >
                    <option value="">Sem Tag</option>
                    <option value="Novidade">Novidade</option>
                    <option value="Promoção">Promoção</option>
                    <option value="Esgotado">Esgotado</option>
                  </select>

                  <button
                    onClick={() => toggleAlbumVisibility(album.id)}
                    style={{ background: album.isVisible ? 'var(--accent-gold)' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}
                  >
                    {album.isVisible ? 'Visível' : 'Oculto'}
                  </button>

                  {/* Delete button always visible in footer - no hover overlay needed */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAlbum(album.id); }}
                    title="Excluir esta coleção"
                    style={{
                      background: '#ef4444', color: 'white', border: 'none',
                      padding: '6px', borderRadius: '4px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Coleções Publicadas ({savedAlbums.length})</h2>
        </div>

        {savedAlbums.length === 0 ? (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
            <ImageIcon title="ImageIcon" size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>Nenhuma coleção enviada ainda.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {savedAlbums.map((album) => (
              <div key={album.id} className="glass" style={{
                borderRadius: '12px', overflow: 'hidden', position: 'relative', group: 'true'
              }}>
                <img
                  src={album.images[0]}
                  alt={album.title}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                />

                {album.images.length > 1 && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    padding: '4px 8px', borderRadius: '12px',
                    fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {album.images.length} fotos
                  </div>
                )}

                <div style={{ padding: '8px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Edit3 size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    value={album.title}
                    onChange={(e) => updateSavedAlbumTitle(album.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: '500', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ padding: '8px', background: 'var(--bg-card)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <select
                    value={album.tag || ''}
                    onChange={(e) => updateSavedAlbumTag(album.id, e.target.value)}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', fontSize: '0.8rem', color: 'var(--text-main)', width: '60%' }}
                  >
                    <option value="">Sem Tag</option>
                    <option value="Novidade">Novidade</option>
                    <option value="Promoção">Promoção</option>
                    <option value="Esgotado">Esgotado</option>
                  </select>

                  <button
                    onClick={() => toggleSavedAlbumVisibility(album.id, album.isVisible)}
                    style={{ background: album.isVisible !== false ? 'var(--accent-gold)' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}
                  >
                    {album.isVisible !== false ? 'Visível' : 'Oculto'}
                  </button>
                </div>

                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: '80px',
                  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease',
                  cursor: 'pointer'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSavedAlbum(album.id, album.images); }}
                    style={{
                      background: '#ef4444', color: 'white', border: 'none',
                      padding: '8px', borderRadius: '50%', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
