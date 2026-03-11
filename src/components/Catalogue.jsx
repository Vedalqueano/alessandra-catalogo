import React, { useState, useEffect } from 'react';
import { MessageCircle, Instagram, ShoppingBag, X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// Sub-component for auto-fading image slider on collection covers
const CollectionCoverSlider = ({ images, title }) => {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;

        // Change image every 3 seconds
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            {images.map((img, idx) => (
                <img
                    key={idx}
                    src={img.url || img}
                    alt={`${title} - foto ${idx + 1}`}
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%', objectFit: 'cover',
                        opacity: idx === currentImage ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out', // Smooth slow fade
                    }}
                />
            ))}
        </div>
    );
};

export default function Catalogue() {
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedAlbums = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAlbums(fetchedAlbums);
            } catch (error) {
                console.error("Error fetching albums: ", error);
            }
        };
        fetchAlbums();
    }, []);

    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const visibleAlbums = albums.filter(album => album.isVisible !== false);

    // Handle closing lightbox on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAlbum, currentIndex]);

    const openLightbox = (album) => {
        setSelectedAlbum(album);
        setCurrentIndex(0);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setSelectedAlbum(null);
        document.body.style.overflow = 'auto';
    };

    const nextImage = () => {
        if (!selectedAlbum) return;
        setCurrentIndex((prev) => (prev === selectedAlbum.images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (!selectedAlbum) return;
        setCurrentIndex((prev) => (prev === 0 ? selectedAlbum.images.length - 1 : prev - 1));
    };



    const handleWhatsApp = () => {
        window.open('https://wa.me/5511976901716?text=Ol%C3%A1!%20Vi%20o%20cat%C3%A1logo%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.', '_blank');
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '100px' }}>

            {/* Hero Section */}
            <div className="hero-container" style={{
                padding: '4rem 0',
                minHeight: '350px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {/* Abstract Background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(228, 218, 205, 0.6) 0%, transparent 100%)',
                    zIndex: -1
                }} />

                <div className="fade-in" style={{ textAlign: 'center', padding: '0 20px', width: '100%' }}>
                    <div className="logo-wrapper" style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '150px', height: 'auto',
                        marginBottom: '1.5rem'
                    }}>
                        <img src="/logo.png" alt="Star Bella Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    </div>
                    <h1 className="gold-gradient hero-title" translate="no" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                        STAR BELLA
                    </h1>
                    <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                        O seu estilo brilha aqui. Confira nossa coleção exclusiva e premium.
                    </p>

                    <div className="hero-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <a
                            href="https://www.instagram.com/star_bella_11?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', background: 'white', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem' }}
                        >
                            <Instagram size={18} />
                            Instagram
                        </a>
                        <button className="btn-gold" onClick={handleWhatsApp} style={{ background: '#25D366', color: 'white', border: 'none', justifyContent: 'center', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem' }}>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Catalogue Grid */}
            <div style={{ maxWidth: '1400px', margin: '30px auto 0', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
                <div className="catalogue-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '2rem',
                    justifyContent: 'center'
                }}>
                    {visibleAlbums.length === 0 ? (
                        <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>Nenhuma coleção encontrada no catálogo.</p>
                    ) : (
                        visibleAlbums.map((album, index) => (
                            <div
                                key={album.id}
                                className="glass fade-in"
                                onClick={() => openLightbox(album)}
                                style={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
                                    opacity: 0,
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transform: 'translateY(20px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
                                }}
                            >
                                <div className="card-image-container">
                                    <CollectionCoverSlider images={album.images} title={album.title} />

                                    {/* Multiple images indicator */}
                                    {album.images.length > 1 && (
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: 'rgba(0,0,0,0.4)', color: 'white',
                                            padding: '4px 8px', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            fontSize: '0.8rem', backdropFilter: 'blur(4px)', zIndex: 5
                                        }}>
                                            <Layers size={14} />
                                            1/{album.images.length}
                                        </div>
                                    )}

                                    <div className="card-content" style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'linear-gradient(to top, rgba(15,15,17,0.9) 0%, transparent 60%)',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                        zIndex: 4
                                    }}>
                                        <div className="card-tags-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            <span className="card-tag" style={{
                                                background: 'var(--accent-gold)', color: '#000',
                                                borderRadius: '20px', fontWeight: 'bold'
                                            }}>
                                                Coleção
                                            </span>
                                            {album.tag && (
                                                <span className="card-tag" style={{
                                                    background: album.tag === 'Promoção' ? '#ef4444' : album.tag === 'Novidade' ? '#10b981' : '#6b7280',
                                                    color: '#fff',
                                                    borderRadius: '20px', fontWeight: 'bold'
                                                }}>
                                                    {album.tag}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '4px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                                                <h3 className="card-title" style={{ fontWeight: '500', color: 'white', margin: 0 }}>{album.title}</h3>
                                                {album.price && (
                                                    <span className="card-price" style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>R$ {album.price}</span>
                                                )}
                                            </div>
                                            <button
                                                className="card-action-btn"
                                                onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.2)', border: 'none',
                                                    color: 'white', borderRadius: '50%',
                                                    cursor: 'pointer', backdropFilter: 'blur(4px)',
                                                    transition: 'background 0.2s', flexShrink: 0
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-gold)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                            >
                                                <ShoppingBag size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            </div>



            {/* Lightbox / Popup Album */}
            <AnimatePresence>
                {selectedAlbum && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {/* Title and Price Info */}
                        <div style={{
                            position: 'absolute', top: '20px', left: '20px',
                            zIndex: 10001, textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            <h2 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>{selectedAlbum.title}</h2>
                            {selectedAlbum.price && (
                                <p style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 'bold', margin: '4px 0 0 0' }}>R$ {selectedAlbum.price}</p>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="lightbox-close-btn"
                            style={{
                                position: 'absolute', top: '20px', right: '20px',
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: 'white', padding: '12px', borderRadius: '50%',
                                cursor: 'pointer', zIndex: 10001
                            }}
                        >
                            <X size={24} />
                        </button>

                        {/* Navigation Arrows */}
                        {selectedAlbum.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="lightbox-nav-btn"
                                    style={{
                                        position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                        color: 'white', padding: '12px', borderRadius: '50%',
                                        cursor: 'pointer', zIndex: 10001
                                    }}
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="lightbox-nav-btn"
                                    style={{
                                        position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                        color: 'white', padding: '12px', borderRadius: '50%',
                                        cursor: 'pointer', zIndex: 10001
                                    }}
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {/* Image Carousel Slider */}
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentIndex}
                                    src={selectedAlbum.images[currentIndex]}
                                    initial={{ opacity: 0, scale: 0.9, x: 100 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={1}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = Math.abs(offset.x) * velocity.x;
                                        if (swipe < -1000) {
                                            nextImage();
                                        } else if (swipe > 1000) {
                                            prevImage();
                                        }
                                    }}
                                    className="lightbox-image"
                                    style={{
                                        maxWidth: '90%', maxHeight: '85vh',
                                        objectFit: 'contain', borderRadius: '12px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        cursor: 'grab'
                                    }}
                                />
                            </AnimatePresence>
                        </div>

                        {/* Dots Indicator */}
                        {selectedAlbum.images.length > 1 && (
                            <div style={{
                                position: 'absolute', bottom: '40px', left: '0', right: '0',
                                display: 'flex', justifyContent: 'center', gap: '8px'
                            }}>
                                {selectedAlbum.images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            width: idx === currentIndex ? '24px' : '8px',
                                            height: '8px',
                                            borderRadius: '4px',
                                            background: idx === currentIndex ? 'var(--accent-gold)' : 'rgba(255,255,255,0.4)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer style={{
                marginTop: '6rem',
                padding: '2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
            }}>
                <p><span translate="no">© 2026 Star Bella.</span> Todos os direitos reservados.</p>
                <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>Desenvolvido com excelência.</p>
            </footer>
        </div>
    );
}
