import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Import the CSS for styling

// Main functional component for the music player
const MusicPlayer = () => {
  // State variables
  const [songs, setSongs] = useState([]); // Holds the list of songs fetched from an external source
  const [currentSong, setCurrentSong] = useState(null); // Keeps track of the currently selected song
  const [isPlaying, setIsPlaying] = useState(false); // Boolean to track if a song is currently playing
  const [progress, setProgress] = useState(0); // Stores the progress of the song (in percentage)
  const [volume, setVolume] = useState(1); // Stores the volume level (default is 1, max volume)

  // useRef hook to manage the audio element, allowing direct access to it
  const audioRef = useRef(null);

  // useEffect to load the list of songs from a local JSON file when the component mounts
  useEffect(() => {
    fetch("/songs.json")
      .then((response) => response.json()) // Parse the response as JSON
      .then((data) => setSongs(data)); // Store the songs in the 'songs' state
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Function to handle selecting and playing a song
  const playSong = (song) => {
    setCurrentSong(song); // Set the clicked song as the current song
    setIsPlaying(true); // Set the playing state to true
  };

  // Function to toggle between playing and pausing the audio
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause(); // Pause the audio if it's currently playing
    } else {
      audioRef.current.play(); // Play the audio if it's currently paused
    }
    setIsPlaying(!isPlaying); // Toggle the playing state
  };

  // Function to update progress as the song plays
  const handleProgress = () => {
    const duration = audioRef.current.duration; // Total duration of the audio
    const currentTime = audioRef.current.currentTime; // Current playback time
    setProgress((currentTime / duration) * 100); // Update progress as a percentage
  };

  // Function to handle changes in volume using a range input
  const handleVolumeChange = (e) => {
    const volumeValue = e.target.value; // Get the new volume value from the input
    setVolume(volumeValue); // Update the volume state
    audioRef.current.volume = volumeValue; // Apply the new volume to the audio element
  };

  // Function to handle seeking (jumping to a different part of the song)
  const handleSeek = (e) => {
    const progressBar = e.currentTarget; // The progress bar element
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left; // Position of the click relative to the progress bar
    const newProgress = (clickPosition / progressBar.clientWidth) * 100; // Calculate the new progress percentage
    setProgress(newProgress); // Update the progress state
    
    // Calculate the new time to seek to based on the new progress
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (newProgress / 100) * duration;

    // If the audio was playing before seeking, make sure it continues playing after seeking
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  // Return the JSX to render the music player UI
  return (
    <div className="spotify-container">
      {/* Sidebar to display the list of songs */}
      <div className="spotify-sidebar">
        <h2 className="spotify-logo">My Top Spotify Playlist</h2>
        <ul className="spotify-playlist">
          {songs.map((song) => (
            <li
              key={song.id} // Unique key for each song in the list
              onClick={() => playSong(song)} // Play the song when it's clicked
              className={currentSong?.id === song.id ? "active" : ""} // Add 'active' class to the currently selected song
            >
              {song.title} <br />
              <span className="artist">{song.artist}</span> {/* Display the song title and artist */}
            </li>
          ))}
        </ul>
      </div>

      {/* Main content area for the currently playing song */}
      <div className="spotify-main">
        {currentSong ? (
          <>
            <div className="now-playing-section">
              <div className="album-artwork">
                <img src={currentSong.artwork || "/default-album-art.jpg"} alt="Album artwork" /> {/* Display album artwork */}
              </div>
              <div className="song-info">
                <h3 className="now-playing">Now Playing</h3>
                <h2 className="song-title">{currentSong.title}</h2> {/* Display the current song's title */}
                <h4 className="artist-name">{currentSong.artist}</h4> {/* Display the current song's artist */}

                {/* Custom Audio Player Controls */}
                <div className="audio-controls">
                  <audio
                    ref={audioRef} // Attach the audio element to the ref for control
                    src={currentSong.file} // Set the audio source file
                    onTimeUpdate={handleProgress} // Update progress bar as the song plays
                    onEnded={() => setIsPlaying(false)} // Stop playing when the song ends
                    autoPlay // Automatically start playing when a new song is selected
                  />

                  <button className="play-btn" onClick={togglePlay}>
                    {isPlaying ? "Pause" : "Play"} {/* Display Play or Pause button based on current state */}
                  </button>

                  {/* Progress Bar */}
                  <div className="progress-container" onClick={handleSeek}> {/* Handle seeking by clicking on the progress bar */}
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }} // Adjust the width of the progress bar based on current progress
                    ></div>
                  </div>

                  {/* Volume Control */}
                  <input
                    type="range" // Range input for volume control
                    min="0" // Minimum volume
                    max="1" // Maximum volume
                    step="0.01" // Small step size for fine control
                    value={volume} // Set the current volume level
                    className="volume-bar"
                    onChange={handleVolumeChange} // Handle changes in volume
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <h3 className="no-song">Select a song from the playlist</h3> // Display message when no song is selected
        )}
      </div>
    </div>
  );
};

export default MusicPlayer; // Export the component for use in the app
