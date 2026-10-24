import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import './UserProfile.css';

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'history' | 'favorites'>('collections');

  const profile = {
    name: 'Chef Mario',
    location: 'Milan, Italy',
    bio: 'Crafting healthy keto twists on classic Italian favorites. Simple recipes for busy lifestyles.',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    stats: {
      cooked: 142,
      saved: 12,
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

  const recentSaves = [
    {
      id: 101,
      title: 'Spicy Tuna Tartare',
      cuisine: 'ITALIAN',
      time: '15 MIN',
      difficulty: 'EASY',
      rating: 4.8,
      description: 'Fresh tuna cubes marinated in soy sauce, sesame oil, and sriracha.',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 102,
      title: 'Protein Pancakes',
      cuisine: 'BREAKFAST',
      time: '20 MIN',
      difficulty: 'MEDIUM',
      rating: 4.5,
      description: 'High protein breakfast to fuel your morning workout. Gluten-free.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 103,
      title: 'Keto Avocado Toast',
      cuisine: 'KETO',
      time: '10 MIN',
      difficulty: 'EASY',
      rating: 4.9,
      description: 'Low carb bread topped with smashed avocado and a poached egg.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-main-info">
          <div className="avatar-container">
            <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
            <span className="verified-badge">
              <Check size={12} strokeWidth={3} />
            </span>
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-meta">
                <span className="location-tag">
                    <MapPin size={14} className="location-icon" /> {profile.location}
                </span>
            </p>
            <p className="profile-bio">{profile.bio}</p>

            <div className="profile-actions">
              <button className="btn-edit-profile">
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
              <span className="stat-number">{profile.stats.cooked}</span>
              <ChefHat size={22} className="stat-icon-green" />
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-label">SAVED</span>
            <div className="stat-value-row">
              <span className="stat-number">{profile.stats.saved}</span>
              <Bookmark size={20} className="stat-icon-green" />
            </div>
          </div>

          
        </div>
      </header>

      <nav className="profile-tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Grid size={16} /> All Recipes
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
        <button 
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Heart size={16} /> Favorites
        </button>
      </nav>

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

      <section className="profile-section">
        <div className="section-header">
          <h2>Recent Saves</h2>
        </div>

        <div className="recent-saves-grid">
          {recentSaves.map((recipe) => (
            <div key={recipe.id} className="save-recipe-card">
              <div className="card-image-wrapper">
                <img src={recipe.image} alt={recipe.title} />
                <button className="heart-btn" aria-label="Favorite">
                  <Heart size={16} fill="#ffffff" />
                </button>
                <div className="recipe-badges">
                  <span className="badge badge-black">{recipe.time}</span>
                  <span className={`badge ${recipe.difficulty === 'EASY' ? 'badge-green' : 'badge-orange'}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="rating-row">
                  <span className="star">★</span>
                  <span className="rating-val">{recipe.rating}</span>
                  <span className="cuisine-tag">{recipe.cuisine}</span>
                </div>

                <h3 className="recipe-card-title">{recipe.title}</h3>
                <p className="recipe-card-desc">{recipe.description}</p>

                <div className="card-footer">
                  <div className="author-mini">
                    <img src={profile.avatar} alt="Author" />
                    <span>{profile.name}</span>
                  </div>
                  <button className="btn-add-mini">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="discover-more-card">
            <div className="compass-circle">
              <Compass size={24} />
            </div>
            <h3>Discover More</h3>
            <p>Explore trending community recipes</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;