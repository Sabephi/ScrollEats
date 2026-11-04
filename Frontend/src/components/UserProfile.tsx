import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Edit3, 
  Share2, 
  Plus, 
  Bookmark, 
  ChefHat,
  Clock, 
  Heart,
  History,
  MapPin,
  Star,
  Eye,
  EyeOff,
  Folder,
  ArrowLeft
} from 'lucide-react';
import { fetchFavorites, toggleFavorite, fetchRecipes, type Recipe } from '../api';
import './UserProfile.css';

interface UserProfileData {
  id: number;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  bio: string;
  country: string;
  city: string;
  avatar: string | null;
  recipes_count: number;
  saved_count: number;
  is_favorites_public: boolean;
  is_collections_public: boolean;
  is_history_public: boolean;
  is_my_recipes_public: boolean;
}

interface CustomCollection {
  id: string;
  name: string;
  recipes: Recipe[];
}

export const UserProfile: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'favorites' | 'collections' | 'history' | 'myRecipes'>('favorites');
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false); // NOWY STAN DLA PRZYCISKU "POKAŻ WIĘCEJ"
  
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    country: ''
  });

  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);

  // === STANY DLA SYSTEMU KOLEKCJI (Z tymczasowym localStorage do testów) ===
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isAddingRecipes, setIsAddingRecipes] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);

  // Zapisywanie folderów do localStorage za każdym razem, gdy się zmienią
  useEffect(() => {
    if (profile && collections.length > 0) {
      localStorage.setItem(`mock_collections_${profile.username}`, JSON.stringify(collections));
    }
  }, [collections, profile]);

  const toggleSectionPrivacy = async (dbField: keyof UserProfileData) => {
    if (!profile) return;
    
    const newValue = !profile[dbField];
    setProfile({ ...profile, [dbField]: newValue } as UserProfileData);

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('/api/users/profile/', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ [dbField]: newValue }),
      });

      if (!response.ok) throw new Error('Błąd podczas zapisywania widoczności.');
    } catch (err) {
      console.error(err);
      setProfile({ ...profile, [dbField]: !newValue } as UserProfileData);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      const loggedInUsername = localStorage.getItem('username');

      try {
        let response;
        if (username) {
          response = await fetch(`/api/users/profile/${username}/`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          });

          if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
            window.location.reload(); 
            return;
          }
        } else {
          if (!token) {
            navigate('/auth');
            return;
          }
          response = await fetch('/api/users/profile/', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }

        if (response.status === 401 && !username) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('username');
          navigate('/auth');
          return;
        }

        if (!response.ok) throw new Error('Nie udało się pobrać profilu.');
        const data: UserProfileData = await response.json();
        setProfile(data);

        // Załadowanie mockowanych kolekcji przypisanych do tego konkretnego profilu
        const savedCollections = localStorage.getItem(`mock_collections_${data.username}`);
        if (savedCollections) {
          setCollections(JSON.parse(savedCollections));
        } else {
          setCollections([]);
        }

        let checkOwn = false;
        if (!username && token) {
          checkOwn = true;
          localStorage.setItem('username', data.username);
          navigate(`/profile/${data.username}`, { replace: true });
        } else if (token && loggedInUsername && loggedInUsername.toLowerCase() === data.username.toLowerCase()) {
          checkOwn = true;
        }
        setIsOwnProfile(checkOwn);

        try {
          const allRecipesData = await fetchRecipes(1);
          const recipesArray = Array.isArray(allRecipesData) ? allRecipesData : (allRecipesData.results || []);
          const userRecipes = recipesArray.filter(
            (recipe: any) => recipe.author_username?.toLowerCase() === data.username.toLowerCase()
          );
          setMyRecipes(userRecipes);
        } catch (e) {
          setMyRecipes([]);
        }

        setLoadingFavorites(true);
        if (checkOwn) {
          try {
            const favData = await fetchFavorites(1);
            const favArray = Array.isArray(favData) ? favData : (favData.results || []);
            setFavoriteRecipes(favArray);
          } catch {
            setFavoriteRecipes([]);
          } finally {
            setLoadingFavorites(false);
          }
        } else {
          if (data.is_favorites_public) {
            try {
              const res = await fetch(`/api/users/profile/${data.username}/favorites/`);
              if (res.ok) {
                const favData = await res.json();
                const favArray = Array.isArray(favData) ? favData : (favData.results || []);
                setFavoriteRecipes(favArray); 
              } else {
                setFavoriteRecipes([]);
              }
            } catch {
              setFavoriteRecipes([]);
            } finally {
              setLoadingFavorites(false);
            }
          } else {
            setLoadingFavorites(false);
            setFavoriteRecipes([]); 
          }
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, navigate]);

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
        headers: { 'Authorization': `Bearer ${token}` },
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

  const handleRemoveFavorite = async (e: React.MouseEvent, recipeId?: number) => {
    e.stopPropagation();
    if (!recipeId) return;
    
    const previousFavorites = [...favoriteRecipes];
    setFavoriteRecipes((prev) => prev.filter((r) => r.id !== recipeId));

    try {
      await toggleFavorite(recipeId);
    } catch (err) {
      setFavoriteRecipes(previousFavorites);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    const newCollection: CustomCollection = {
      id: Date.now().toString(),
      name: newFolderName,
      recipes: []
    };
    
    setCollections([...collections, newCollection]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleSaveRecipesToFolder = () => {
    if (!activeCollectionId) return;
    
    const selectedRecipesObjects = favoriteRecipes.filter(r => selectedRecipeIds.includes(r.id));
    
    setCollections(prev => prev.map(col => {
      if (col.id === activeCollectionId) {
        const existingIds = col.recipes.map(r => r.id);
        const newUnique = selectedRecipesObjects.filter(r => !existingIds.includes(r.id));
        return { ...col, recipes: [...col.recipes, ...newUnique] };
      }
      return col;
    }));
    
    setIsAddingRecipes(false);
    setSelectedRecipeIds([]);
  };

  const toggleRecipeSelection = (recipeId: number) => {
    setSelectedRecipeIds(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const activeCollectionObj = collections.find(c => c.id === activeCollectionId);
  
  // LOGIKA "POKAŻ WIĘCEJ" W ULUBIONYCH
  const displayedFavorites = showAllFavorites ? favoriteRecipes : favoriteRecipes.slice(0, 5);
  const hasMoreFavorites = favoriteRecipes.length > 5 && !showAllFavorites;

  if (loading) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Wczytywanie profilu...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: '3rem', textAlign: 'center' }}>{error}</div>;
  if (!profile) return null;

  const displayName = profile.first_name || profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.username;
    
  const locationInfo = [profile.city, profile.country].filter(Boolean).join(', ');
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  const avatarUrl = profile.avatar ? profile.avatar : 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80';

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

            {isOwnProfile && (
              <div className="profile-actions">
                <button className="btn-edit-profile" onClick={handleEditClick}>
                  <Edit3 size={15} /> Edit Profile
                </button>
                <button className="btn-icon-action" aria-label="Share profile">
                  <Share2 size={16} />
                </button>
              </div>
            )}
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
              <span className="stat-number">{profile.saved_count || favoriteRecipes.length}</span>
              <Bookmark size={20} className="stat-icon-green" />
            </div>
          </div>
        </div>
      </header>

      <nav className="profile-tabs-nav">
        {(isOwnProfile || profile.is_favorites_public) && (
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => { setActiveTab('favorites'); setActiveCollectionId(null); setShowAllFavorites(false); }}
          >
            <Heart size={16} /> Favorites
          </button>
        )}
        {(isOwnProfile || profile.is_collections_public) && (
          <button 
            className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => { setActiveTab('collections'); setShowAllFavorites(false); }}
          >
            <Bookmark size={16} /> Collections
          </button>
        )}
        {(isOwnProfile || profile.is_history_public) && (
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setActiveCollectionId(null); setShowAllFavorites(false); }}
          >
            <History size={16} /> Cooked History
          </button>
        )}
        {(isOwnProfile || profile.is_my_recipes_public) && (
          <button 
            className={`tab-btn ${activeTab === 'myRecipes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('myRecipes'); setActiveCollectionId(null); setShowAllFavorites(false); }}
          >
            <ChefHat size={16} /> My Recipes
          </button>
        )}
      </nav>

      {/* SEKCJA: FAVORITES */}
      {activeTab === 'favorites' && (isOwnProfile || profile.is_favorites_public) && (
        <section className="profile-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Favorite Recipes</h2>
            {isOwnProfile && (
              <button 
                onClick={() => toggleSectionPrivacy('is_favorites_public')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: profile.is_favorites_public ? '#10b98120' : '#ef444420',
                  color: profile.is_favorites_public ? '#10b981' : '#ef4444',
                  border: `1px solid ${profile.is_favorites_public ? '#10b98150' : '#ef444450'}`,
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                {profile.is_favorites_public ? <Eye size={16} /> : <EyeOff size={16} />}
                {profile.is_favorites_public ? 'Public for others' : 'Hidden for others'}
              </button>
            )}
          </div>
          
          {loadingFavorites ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Wczytywanie ulubionych...</p>
          ) : favoriteRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
              <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>Brak ulubionych</h3>
              <p style={{ marginTop: '0.5rem' }}>Nie ma jeszcze polubionych przepisów.</p>
            </div>
          ) : (
            <div className="recent-saves-grid">
              {displayedFavorites.map((recipe) => (
                <div key={recipe.id} className="save-recipe-card" onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="card-image-wrapper">
                    <img src={recipe.get_image || recipe.image_url || fallbackImage} alt={recipe.title} />
                    {isOwnProfile && (
                      <button className="heart-btn" onClick={(e) => handleRemoveFavorite(e, recipe.id)}>
                        <Heart size={16} fill="#ef4444" color="#ef4444" className="heart-icon" />
                      </button>
                    )}
                    <div className="recipe-badges">
                      <span className="badge-translucent"><Clock size={12} /> {recipe.prep_time} MIN</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3 className="recipe-card-title">{recipe.title}</h3>
                  </div>
                </div>
              ))}
              
              {/* Przycisk "Odkryj więcej" renderowany jako 6. kafelek */}
              {hasMoreFavorites && (
                <div 
                  className="save-recipe-card" 
                  onClick={() => setShowAllFavorites(true)} 
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '220px', 
                    backgroundColor: '#1a1f1c',
                    border: '2px dashed #37413b'
                  }}
                >
                  <Plus size={40} color="#10b981" style={{ marginBottom: '10px' }} />
                  <h3 style={{ color: '#10b981', margin: 0 }}>Odkryj więcej</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' }}>
                    +{favoriteRecipes.length - 5} przepisów
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* SEKCJA: COLLECTIONS */}
      {activeTab === 'collections' && (isOwnProfile || profile.is_collections_public) && (
        <section className="profile-section">
          {!activeCollectionId ? (
            <>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Collections</h2>
                {isOwnProfile && (
                  <button 
                    onClick={() => toggleSectionPrivacy('is_collections_public')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: profile.is_collections_public ? '#10b98120' : '#ef444420',
                      color: profile.is_collections_public ? '#10b981' : '#ef4444',
                      border: `1px solid ${profile.is_collections_public ? '#10b98150' : '#ef444450'}`,
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    {profile.is_collections_public ? <Eye size={16} /> : <EyeOff size={16} />}
                    {profile.is_collections_public ? 'Public for others' : 'Hidden for others'}
                  </button>
                )}
              </div>
              
              {collections.length === 0 && !isOwnProfile ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
                  <Folder size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3>Brak folderów</h3>
                  <p style={{ marginTop: '0.5rem' }}>Ten użytkownik nie utworzył jeszcze żadnej kolekcji.</p>
                </div>
              ) : (
                <div className="recent-saves-grid">
                  {isOwnProfile && (
                    <div 
                      className="save-recipe-card" 
                      onClick={() => setIsCreatingFolder(true)} 
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', border: '2px dashed #37413b', background: 'transparent' }}
                    >
                      <Plus size={40} color="#10b981" style={{ marginBottom: '10px' }} />
                      <h3 style={{ color: '#10b981', margin: 0 }}>Nowy folder</h3>
                    </div>
                  )}
                  
                  {collections.map(col => (
                    <div 
                      key={col.id} 
                      className="save-recipe-card" 
                      onClick={() => setActiveCollectionId(col.id)} 
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', backgroundColor: '#1a1f1c' }}
                    >
                      <Folder size={48} color="#9ca3af" style={{ marginBottom: '15px' }} />
                      <h3 style={{ color: '#f3f4f6', margin: 0, textAlign: 'center' }}>{col.name}</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' }}>{col.recipes.length} przepisów</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                  onClick={() => setActiveCollectionId(null)}
                  style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>{activeCollectionObj?.name}</h2>
              </div>

              {activeCollectionObj?.recipes.length === 0 && !isOwnProfile ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
                  <p>Ten folder jest jeszcze pusty.</p>
                </div>
              ) : (
                <div className="recent-saves-grid" style={{ marginTop: '20px' }}>
                  {isOwnProfile && (
                    <div 
                      className="save-recipe-card" 
                      onClick={() => setIsAddingRecipes(true)} 
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', border: '2px dashed #37413b', background: 'transparent' }}
                    >
                      <Plus size={40} color="#10b981" style={{ marginBottom: '10px' }} />
                      <h3 style={{ color: '#10b981', margin: 0 }}>Dodaj z polubionych</h3>
                    </div>
                  )}
                  
                  {activeCollectionObj?.recipes.map(recipe => (
                    <div key={recipe.id} className="save-recipe-card" onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ cursor: 'pointer' }}>
                      <div className="card-image-wrapper">
                        <img src={recipe.get_image || recipe.image_url || fallbackImage} alt={recipe.title} />
                        <div className="recipe-badges">
                          <span className="badge-translucent"><Clock size={12} /> {recipe.prep_time} MIN</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <h3 className="recipe-card-title">{recipe.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* SEKCJA: HISTORY */}
      {activeTab === 'history' && (isOwnProfile || profile.is_history_public) && (
        <section className="profile-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Cooked History</h2>
            {isOwnProfile && (
              <button 
                onClick={() => toggleSectionPrivacy('is_history_public')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: profile.is_history_public ? '#10b98120' : '#ef444420',
                  color: profile.is_history_public ? '#10b981' : '#ef4444',
                  border: `1px solid ${profile.is_history_public ? '#10b98150' : '#ef444450'}`,
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                {profile.is_history_public ? <Eye size={16} /> : <EyeOff size={16} />}
                {profile.is_history_public ? 'Public for others' : 'Hidden for others'}
              </button>
            )}
          </div>
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
            <History size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No Cooking History Yet</h3>
          </div>
        </section>
      )}

      {/* SEKCJA: MY RECIPES */}
      {activeTab === 'myRecipes' && (isOwnProfile || profile.is_my_recipes_public) && (
        <section className="profile-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{isOwnProfile ? 'My Recipes' : `Recipes by ${profile.username}`}</h2>
            {isOwnProfile && (
              <button 
                onClick={() => toggleSectionPrivacy('is_my_recipes_public')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: profile.is_my_recipes_public ? '#10b98120' : '#ef444420',
                  color: profile.is_my_recipes_public ? '#10b981' : '#ef4444',
                  border: `1px solid ${profile.is_my_recipes_public ? '#10b98150' : '#ef444450'}`,
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                {profile.is_my_recipes_public ? <Eye size={16} /> : <EyeOff size={16} />}
                {profile.is_my_recipes_public ? 'Public for others' : 'Hidden for others'}
              </button>
            )}
          </div>
          
          {myRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
              <p>Brak stworzonych przepisów.</p>
            </div>
          ) : (
            <div className="recent-saves-grid">
              {myRecipes.map((recipe) => (
                <div key={recipe.id} className="save-recipe-card" onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="card-image-wrapper">
                    <img src={recipe.get_image || recipe.image_url || fallbackImage} alt={recipe.title} />
                  </div>
                  <div className="card-body">
                    <h3 className="recipe-card-title">{recipe.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {isEditing && isOwnProfile && (
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

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreatingFolder && isOwnProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Nowy folder kolekcji</h2>
            <form onSubmit={handleCreateFolder} className="edit-profile-form">
              <div className="form-group">
                <label>Nazwa folderu</label>
                <input 
                  type="text" 
                  value={newFolderName} 
                  onChange={(e) => setNewFolderName(e.target.value)} 
                  placeholder="np. Słodkie wypieki" 
                  autoFocus 
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}>Anuluj</button>
                <button type="submit" className="btn-save">Stwórz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingRecipes && isOwnProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <h2>Wybierz przepisy do dodania</h2>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Kliknij przepisy ze swoich ulubionych, aby dodać je do tego folderu.</p>
            
            {favoriteRecipes.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Nie masz jeszcze żadnych ulubionych przepisów.</p>
            ) : (
              <div className="recent-saves-grid" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }}>
                {favoriteRecipes.map(recipe => {
                  const isSelected = selectedRecipeIds.includes(recipe.id);
                  return (
                    <div 
                      key={recipe.id} 
                      className="save-recipe-card" 
                      onClick={() => toggleRecipeSelection(recipe.id)} 
                      style={{ 
                        cursor: 'pointer', 
                        border: isSelected ? '2px solid #10b981' : '2px solid transparent',
                        opacity: isSelected ? 0.8 : 1
                      }}
                    >
                      <div className="card-image-wrapper">
                        <img src={recipe.get_image || recipe.image_url || fallbackImage} alt={recipe.title} />
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#10b981', borderRadius: '50%', padding: '5px' }}>
                            <Check size={16} color="white" />
                          </div>
                        )}
                      </div>
                      <div className="card-body">
                        <h3 className="recipe-card-title">{recipe.title}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="btn-cancel" onClick={() => { setIsAddingRecipes(false); setSelectedRecipeIds([]); }}>Anuluj</button>
              <button type="button" className="btn-save" onClick={handleSaveRecipesToFolder}>Zapisz w folderze</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;