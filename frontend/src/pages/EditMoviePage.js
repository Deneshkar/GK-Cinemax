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
      formData.append('isShowing',   isShowing);

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

          {/* Toggle whether movie is currently showing */}
          <label>Status</label>
          <select
            className="input-field"
            value={isShowing}
            onChange={(e) => setIsShowing(e.target.value === 'true')}
          >
            <option value="true">Now Showing</option>
            <option value="false">Not Showing</option>
          </select>

          <label>Replace Poster Image (optional)</label>
          <input
            type="file"
            className="file-input"
            accept="image/*"
            onChange={(e) => setNewPosterFile(e.target.files[0])}
          />

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