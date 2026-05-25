import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/EditMoviePage.css';

// This page lets the admin edit or delete a movie
function EditMoviePage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Form field values — pre-filled with existing movie data
  const [movieTitle, setMovieTitle]             = useState('');
  const [movieLanguage, setMovieLanguage]       = useState('');
  const [movieDuration, setMovieDuration]       = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [existingPosterUrl, setExistingPosterUrl] = useState('');
  const [newPosterFile, setNewPosterFile]       = useState(null);
  const [isShowing, setIsShowing]               = useState(true);
  const [isComingSoon, setIsComingSoon]         = useState(false);
  const [isAdvanceBookingEnabled, setIsAdvanceBookingEnabled] = useState(false);
  const [releaseDate, setReleaseDate]           = useState('');

  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');

  // Redirect away if not admin
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/');
    }
  }, [currentUser]);

  // Load the existing movie data when the page opens
  useEffect(() => {
    fetchMovie();
  }, [id]);

  // Fetches the movie from the backend and fills the form fields
  async function fetchMovie() {
    try {
      const response = await axios.get(`http://localhost:5000/api/movies/${id}`);
      const movie = response.data;
      setMovieTitle(movie.title);
      setMovieLanguage(movie.language);
      setMovieDuration(movie.duration);
      setMovieDescription(movie.description);
      setExistingPosterUrl(movie.posterUrl);
      setIsShowing(movie.isShowing);
      setIsComingSoon(movie.comingSoon || false);
      setIsAdvanceBookingEnabled(movie.advanceBookingEnabled || false);
      setReleaseDate(movie.releaseDate || '');
    } catch (error) {
      setErrorMessage('Failed to load movie.');
    } finally {
      setIsLoading(false);
    }
  }

  // Saves the updated movie details to the backend
  async function handleUpdateMovie(event) {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('gkToken');

      // Use FormData because we might be sending a new poster image
      const formData = new FormData();
      formData.append('title',       movieTitle);
      formData.append('language',    movieLanguage);
      formData.append('duration',    movieDuration);
      formData.append('description', movieDescription);
      formData.append('isShowing',   !isComingSoon);
      formData.append('comingSoon', isComingSoon);
      formData.append('advanceBookingEnabled', isAdvanceBookingEnabled);
      formData.append('releaseDate', releaseDate);

      // Only attach a new poster if the admin chose one
      if (newPosterFile) {
        formData.append('poster', newPosterFile);
      }

      await axios.put(`http://localhost:5000/api/movies/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Movie updated successfully!');

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update movie.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Deletes the movie after admin confirms
  async function handleDeleteMovie() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movieTitle}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('gkToken');
      await axios.delete(`http://localhost:5000/api/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Movie deleted successfully.');
      navigate('/admin');

    } catch (error) {
      setErrorMessage('Failed to delete movie.');
      setIsDeleting(false);
    }
  }

  if (isLoading) return <div className="loading">Loading movie...</div>;

  return (
    <div className="edit-movie-container">

      {/* Back button */}
      <button className="btn-secondary" onClick={() => navigate('/admin')}
        style={{ marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <h2 className="edit-movie-title">Edit Movie</h2>

      {/* Current poster preview */}
      <div className="poster-preview">
        <img src={existingPosterUrl} alt="Current poster" />
        <p>Current Poster</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage   && <div className="admin-error">{errorMessage}</div>}

      {/* Edit form */}
      <div className="edit-form-card">
        <form onSubmit={handleUpdateMovie}>

          <label>Movie Title</label>
          <input
            type="text"
            className="input-field"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            required
          />

          <label>Language</label>
          <input
            type="text"
            className="input-field"
            value={movieLanguage}
            onChange={(e) => setMovieLanguage(e.target.value)}
            required
          />

          <label>Duration (minutes)</label>
          <input
            type="number"
            className="input-field"
            value={movieDuration}
            onChange={(e) => setMovieDuration(e.target.value)}
            required
          />

          <label>Description</label>
          <textarea
            className="input-field"
            value={movieDescription}
            onChange={(e) => setMovieDescription(e.target.value)}
            rows={4}
            required
          />

          <label>Replace Poster Image (optional)</label>
          <input
            type="file"
            className="file-input"
            accept="image/*"
            onChange={(e) => setNewPosterFile(e.target.files[0])}
          />

          {/* Movie status — replaces the old isShowing-only select */}
          <label>Movie Status</label>
          <select
            className="input-field"
            value={isComingSoon ? 'comingSoon' : 'nowShowing'}
            onChange={(e) => {
              const comingSoonSelected = e.target.value === 'comingSoon';
              setIsComingSoon(comingSoonSelected);
              if (!comingSoonSelected) {
                setIsAdvanceBookingEnabled(false);
              }
            }}
          >
            <option value="nowShowing">Now Showing</option>
            <option value="comingSoon">Coming Soon</option>
          </select>

          {/* Only show release date field when Coming Soon is selected */}
          {isComingSoon && (
            <>
              <div className="field-label">Advance Booking</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#aaa', textTransform: 'none', letterSpacing: '0' }}>
                <input
                  type="checkbox"
                  checked={isAdvanceBookingEnabled}
                  onChange={(e) => setIsAdvanceBookingEnabled(e.target.checked)}
                />
                Allow users to pre-book this upcoming movie
              </label>

              <label>Expected Release Date</label>
              <input
                type="date"
                className="input-field"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </>
          )}

          {/* Update and Delete buttons side by side */}
          <div className="edit-btn-row">
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              className="btn-delete"
              style={{ flex: 1 }}
              onClick={handleDeleteMovie}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Movie'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditMoviePage;