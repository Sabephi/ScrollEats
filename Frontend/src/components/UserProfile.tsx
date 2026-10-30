import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Edit3, 
  Share2, 
  Plus, 
  Globe, 
  Lock, 
  Compass, 
  Bookmark, 
  ChefHat,
  Clock, 
  Flame,
  Grid,
  Heart,
  History,
  MapPin,
  Star
} from 'lucide-react';
import { fetchFavorites, toggleFavorite, type Recipe } from '../api';
import './UserProfile.css';

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  country: string;
  city: string;
  avatar: string | null;
  recipes_count: number;
  saved_count: number;
}

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'collections' | 'history'>('favorites');
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Brak dostępu. Zaloguj się, aby zobaczyć profil.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Nie udało się pobrać profilu.');
        const data = await response.json();
        setProfile(data);

        setLoadingFavorites(true);
        const favData = await fetchFavorites(1);
        setFavoriteRecipes(favData.results || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingFavorites(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        country: profile.country || ''
      });
      setAvatarFile(null);
      setIsEditing(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    const formData = new FormData();
    formData.append('first_name', editForm.first_name);
    formData.append('last_name', editForm.last_name);
    formData.append('bio', editForm.bio);
    formData.append('city', editForm.city);
    formData.append('country', editForm.country);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    try {
      const response = await fetch('/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Błąd podczas zapisywania profilu');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleRemoveFavorite = async (recipeId?: number) => {
    if (!recipeId) return;
    
    const previousFavorites = [...favoriteRecipes];
    setFavoriteRecipes((prev) => prev.filter((r) => r.id !== recipeId));

    try {
      await toggleFavorite(recipeId);
    } catch (err) {
      setFavoriteRecipes(previousFavorites);
      console.error("Błąd podczas usuwania polubienia:", err);
    }
  };

  const collections = [
    {
      id: 1,
      title: 'Vegan Dinners',
      recipeCount: 15,
      isPublic: true,
      images: [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&q=80'
      ],
      remainingCount: 12
    },
    {
      id: 2,
      title: 'Cheat Day',
      recipeCount: 8,
      isPublic: false,
      images: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80'
      ],
      remainingCount: 5
    }
  ];

  const myRecipes = [
    {
      id: 101,
      title: 'Spicy Tuna Tartare',
      cuisine: 'ITALIAN',
      time: '15 MIN',
      difficulty: 'EASY',
      rating: 4.8,
      description: 'Fresh tuna cubes marinated in soy sauce, sesame oil, and sriracha.',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80'
    }
  ];

  if (loading) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Wczytywanie profilu...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: '3rem', textAlign: 'center' }}>{error}</div>;
  if (!profile) return null;

  const displayName = profile.first_name || profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.username;
    
  const locationInfo = [profile.city, profile.country].filter(Boolean).join(', ');
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  
  const avatarUrl = profile.avatar 
    ? profile.avatar 
    : 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-main-info">
          <div className="avatar-container">
            <img src={avatarUrl} alt={displayName} className="profile-avatar" />
            <span className="verified-badge">
              <Check size={12} strokeWidth={3} />
            </span>
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{displayName}</h1>
            
            {locationInfo && (
              <p className="profile-meta">
                <span className="location-tag">
                    <MapPin size={14} className="location-icon" /> {locationInfo}
                </span>
              </p>
            )}
            
            <p className="profile-bio">
              {profile.bio || 'Witaj na moim profilu! Szukam nowych smaków.'}
            </p>

            <div className="profile-actions">
              <button className="btn-edit-profile" onClick={handleEditClick}>
                <Edit3 size={15} /> Edit Profile
              </button>
              <button className="btn-icon-action" aria-label="Share profile">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="stat-card">
            <span className="stat-label">COOKED</span>
            <div className="stat-value-row">
              <span className="stat-number">{profile.recipes_count}</span>
              <ChefHat size={22} className="stat-icon-green" />
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-label">SAVED</span>
            <div className="stat-value-row">
              <span className="stat-number">{favoriteRecipes.length}</span>
              <Bookmark size={20} className="stat-icon-green" />
            </div>
          </div>
        </div>
      </header>

      <nav className="profile-tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Heart size={16} /> Favorites
        </button>
        <button 
          className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          <Bookmark size={16} /> My Collections
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} /> Cooked History
        </button>
      </nav>

      {activeTab === 'favorites' && (
        <section className="profile-section">
          <div className="section-header">
            <h2>Favorite Recipes</h2>
          </div>
          
          {loadingFavorites ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Wczytywanie ulubionych...</p>
          ) : favoriteRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
              <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>Brak ulubionych</h3>
              <p style={{ marginTop: '0.5rem' }}>Nie polubiłeś jeszcze żadnych przepisów.</p>
            </div>
          ) : (
            <div className="recent-saves-grid">
              {favoriteRecipes.map((recipe) => (
                <div key={recipe.id} className="save-recipe-card">
                  <div className="card-image-wrapper">
                    <img src={recipe.image_url || fallbackImage} alt={recipe.title} />
                    
                    <button 
                      className="heart-btn" 
                      aria-label="Remove Favorite"
                      onClick={() => handleRemoveFavorite(recipe.id)}
                    >
                      <Heart size={16} fill="#ef4444" color="#ef4444" className="heart-icon" />
                    </button>
                    
                    <div className="recipe-badges">
                      <span className="badge-translucent">
                        <Clock size={12} /> {recipe.prep_time} MIN
                      </span>
                      <span className="badge-translucent">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="rating-row">
                      <span className="rating-val">
                        <Star size={14} fill="#eab308" color="#eab308" /> 5.0
                      </span>
                      <span className="cuisine-tag">RECIPE</span>
                    </div>
                    <h3 className="recipe-card-title">{recipe.title}</h3>
                    <p className="recipe-card-desc">{recipe.description || 'Brak opisu dla tego przepisu.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'collections' && (
        <section className="profile-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2>Your Collections</h2>
              <span className="count-badge">12</span>
            </div>
            <button className="btn-view-all">View All →</button>
          </div>

          <div className="collections-grid">
            {collections.map((col) => (
              <div key={col.id} className="collection-card">
                <div className="collection-collage">
                  <div className="collage-grid">
                    <img src={col.images[0]} alt="Recipe 1" />
                    <img src={col.images[1]} alt="Recipe 2" />
                    <img src={col.images[2]} alt="Recipe 3" />
                    <div className="remaining-tile">
                      +{col.remainingCount}
                    </div>
                  </div>
                </div>
                <div className="collection-meta">
                  <h3>{col.title}</h3>
                  <p>
                    {col.recipeCount} RECIPES • {col.isPublic ? 'PUBLIC' : 'PRIVATE'}
                  </p>
                </div>
              </div>
            ))}

            <div className="add-collection-card">
              <div className="add-icon-circle">
                <Plus size={24} />
              </div>
              <h3>New Collection</h3>
              <p>Organize your saves</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="profile-section">
          <div className="section-header">
            <h2>Cooked History</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
            <History size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No Cooking History Yet</h3>
            <p style={{ marginTop: '0.5rem' }}>Recipes you start cooking will appear here.</p>
          </div>
        </section>
      )}

      <section className="profile-section" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <h2>My Recipes</h2>
        </div>
        <div className="recent-saves-grid">
          {myRecipes.map((recipe) => (
            <div key={recipe.id} className="save-recipe-card">
              <div className="card-image-wrapper">
                <img src={recipe.image} alt={recipe.title} />
                <div className="recipe-badges">
                  <span className="badge-translucent">
                    <Clock size={12} /> {recipe.time}
                  </span>
                  <span className="badge-translucent">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="rating-row">
                  <span className="rating-val">
                    <Star size={14} fill="#eab308" color="#eab308" /> {recipe.rating}
                  </span>
                  <span className="cuisine-tag">{recipe.cuisine}</span>
                </div>
                <h3 className="recipe-card-title">{recipe.title}</h3>
                <p className="recipe-card-desc">{recipe.description}</p>
                
                <div className="card-footer">
                  <div className="author-mini">
                    <img src={avatarUrl} alt="Author" />
                    <span>{displayName}</span>
                  </div>
                  <button className="btn-add-mini">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="edit-profile-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" value={editForm.first_name} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" value={editForm.last_name} onChange={handleEditChange} />
                </div>
              </div>
              
              <div className="form-group-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={editForm.city} onChange={handleEditChange} placeholder="e.g. Milan" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" value={editForm.country} onChange={handleEditChange} placeholder="e.g. Italy" />
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows={3} placeholder="Tell us about your culinary journey..." />
              </div>
              
              <div className="form-group">
                <label>Profile Picture</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                  style={{ 
                    padding: '8px', 
                    cursor: 'pointer', 
                    backgroundColor: '#242a27', 
                    color: '#fff', 
                    border: '1px solid #37413b', 
                    borderRadius: '8px' 
                  }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;