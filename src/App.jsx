import React, { useState, useMemo, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [likedCats, setLikedCats] = useState([]);
  const [db, setDb] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [isFinished, setIsFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const currentIndexRef = useRef(currentIndex);

  const fetchCats = async () => {
    setIsLoading(true);
    const catPromises = Array.from({ length: 15 }).map((_, index) => {
      // Use a random query parameter to prevent browser caching the same image
      const uniqueUrl = `https://cataas.com/cat?width=350&height=500&id=${Date.now() + index}`;
      return {
        id: index,
        name: `Cat #${index + 1}`,
        url: uniqueUrl
      };
    });

    setDb(catPromises.reverse()); // Reverse for stack order
    
    const initialIndex = catPromises.length - 1;
    setCurrentIndex(initialIndex);
    currentIndexRef.current = initialIndex;
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCats();
  }, []); 
  
  // --- SWIPE LOGIC (Similar to examples by the library)---
  const childRefs = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    [db.length]
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const swiped = (direction, catToDelete, index) => {
    console.log('removing: ' + catToDelete.name + ' to the ' + direction);
    
    if (direction === 'right') {
      //Trigger Vibration for enabled device
      if ("vibrate" in navigator) {
      navigator.vibrate(50); 
      console.log('Vibration triggered for LIKE.');
    }
      setLikedCats((prev) => [...prev, catToDelete]);
    }

    updateCurrentIndex(currentIndexRef.current - 1);
  };


    // NEW
  const outOfFrame = (name, index) => {
    if (currentIndexRef.current === -1) {
      setIsFinished(true); 
      
      setTimeout(() => {
          setCurrentScreen('summary');
          setIsFinished(false); 
      }, 1500); 
    }
  };

  const swipe = async (dir) => {
    if (currentIndexRef.current < 0) return;

    const cardRef = childRefs[currentIndexRef.current].current;
    
    if (cardRef) {
        await cardRef.swipe(dir); 
    }
  };

  const swipeLeft = () => swipe('left');
  const swipeRight = () => swipe('right');
  
  // RENDER: Loading Screen
  if (isLoading) {
    return (
      <div className="screen loading-container">
        <h2>Preparing the Purrfect Matches...</h2>
        <div className="spinner"></div> 
        <p className="loading-text">Fetching 15 felines from Cataas.com</p>
        <p style={{color: 'var(--color-primary)'}}>
            This may take a moment.
        </p>
      </div>
    );
  }

  // RENDER: Intro Screen 
  if (currentScreen === 'intro') {
    return (
      <div className="screen intro-screen">
        <div className="card intro-card"> 
          <h1>😻</h1>
          <h1>Paws & Preferences</h1>
          <h2>Find Your Favourite Kitty</h2>
          <p style={{marginTop: '20px'}}>Swipe <strong>Right</strong> (Like ❤️)</p>
          <p>Swipe <strong>Left</strong> (Nope ❌)</p>
          <button className="btn-primary" onClick={() => setCurrentScreen('game')}>
            Start Swiping
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Loading to Summary
  if (isFinished) {
      return (
          <div className="screen loading-container">
              <h2>All done!</h2>
              <p style={{fontSize: '1.2rem', color: 'var(--color-text-light)', marginTop: '10px'}}>
                  Calculating your Purrfect Match score...
              </p>
              <div className="spinner" style={{marginTop: '20px'}}></div>
          </div>
      );
  }

  // RENDER: Summary Screen 
  if (currentScreen === 'summary') {
    return (
      <div className="screen">
        <h1>Summary</h1>
        <h2>You liked <strong>{likedCats.length}</strong> cats!</h2>
        
        <div className="summary-grid">
          {likedCats.map((cat) => (
            <img key={cat.id} src={cat.url} alt={cat.name} className="liked-thumb" />
          ))}
        </div>

        <button 
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Pick Meows Again
        </button>
      </div>
    );
  }

  // RENDER: Game Screen (The Card Pile)
  if (currentScreen === 'game' && !isLoading) {
    return (
      <div className="screen">
        <h1>😻 Paw-some!!</h1>
        <div className="card-container">
          {db.map((character, index) => (
            <TinderCard
              ref={childRefs[index]}
              className='swipe'
              key={character.id}
              onSwipe={(dir) => swiped(dir, character, index)}
              onCardLeftScreen={() => outOfFrame(character.name, index)}
              preventSwipe={['up', 'down']}
            >
              <div
                style={{ backgroundImage: `url(${character.url})` }}
                className='card'
              >
                <h3>{character.name}</h3>
                
              </div>
            </TinderCard>
          ))}
        </div>
        
        <div className="action-buttons">

          <button className="icon-btn nope-btn" onClick={swipeLeft}>
            <span role="img" aria-label="Pass">❌</span>
          </button>

          <button className="icon-btn like-btn" onClick={swipeRight}>
            <span role="img" aria-label="Like">❤️</span>
          </button>

        </div>
        
        <p style={{marginTop: '20px'}}>Swipe Right (Like) / Left (Pass)</p>
      </div>
    );
  }
}

export default App;