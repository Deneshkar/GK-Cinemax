import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AdminDashboard.css';

// The admin dashboard — only accessible by admin users
function AdminDashboard() {

  // activeTab controls which section is shown
  const [activeTab, setActiveTab] = useState('addMovie');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect away if the user is not an admin
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/');
    }
  }, [currentUser]);

  const tabs = [
    { id: 'addMovie',    label: 'Add Movie',    icon: '＋' },
    { id: 'addShowtime', label: 'Showtimes',    icon: '◷' },
    { id: 'allBookings', label: 'All Bookings', icon: '≡'  },
  ];

  return (
    <div className="admin-page-container">

      {/* Header */}
      <div className="admin-header">
        <h2 className="admin-title">
          <span className="admin-title-main">
            <span className="logo-gk">GK</span> Cinemax
          </span>
          <span className="admin-title-badge">Control Panel</span>
        </h2>
      </div>

      {/* Tab buttons */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="admin-tab-content" key={activeTab}>
        {activeTab === 'addMovie'    && <AddMovieForm />}
        {activeTab === 'addShowtime' && <AddShowtimeForm />}
        {activeTab === 'allBookings' && <AllBookingsTable />}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────
// ADD MOVIE FORM
// ─────────────────────────────────────────

function AddMovieForm() {

  const [movieTitle, setMovieTitle]             = useState('');
  const [movieLanguage, setMovieLanguage]       = useState('');
  const [movieDuration, setMovieDuration]       = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [posterFile, setPosterFile]             = useState(null);
  const [posterFileName, setPosterFileName]     = useState('');

  // NEW
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [releaseDate, setReleaseDate]   = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  async function handleAddMovie(event) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!posterFile) {
      setErrorMessage('Please select a poster image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('gkToken');

      const formData = new FormData();

      formData.append('title', movieTitle);
      formData.append('language', movieLanguage);
      formData.append('duration', movieDuration);
      formData.append('description', movieDescription);
      formData.append('poster', posterFile);

      // NEW
      formData.append('comingSoon', isComingSoon);
      formData.append('releaseDate', releaseDate);

      await axios.post(
        'http://localhost:5000/api/movies',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setSuccessMessage(
        `"${movieTitle}" has been added to the lineup.`
      );

      // reset fields
      setMovieTitle('');
      setMovieLanguage('');
      setMovieDuration('');
      setMovieDescription('');

      setPosterFile(null);
      setPosterFileName('');

      setIsComingSoon(false);
      setReleaseDate('');

    } catch (error) {

      setErrorMessage(
        error.response?.data?.message ||
        'Failed to add movie.'
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];

    if (file) {
      setPosterFile(file);
      setPosterFileName(file.name);
    }
  }

  return (
    <div className="admin-form-card">
      <div className="admin-section-label">
        New Entry
      </div>

      <h3>Add Movie</h3>

      <p className="form-subtitle">
        Fill in the details to add a film to the schedule.
      </p>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="admin-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleAddMovie}>

        <label>Movie Title</label>

        <input
          type="text"
          className="input-field"
          placeholder="e.g. Vettaiyan"
          value={movieTitle}
          onChange={(e)=>setMovieTitle(e.target.value)}
          required
        />

        <label>Language</label>

        <input
          type="text"
          className="input-field"
          placeholder="Tamil / Sinhala / English"
          value={movieLanguage}
          onChange={(e)=>setMovieLanguage(e.target.value)}
          required
        />

        <label>Duration (minutes)</label>

        <input
          type="number"
          className="input-field"
          placeholder="150"
          value={movieDuration}
          onChange={(e)=>setMovieDuration(e.target.value)}
          required
        />

        <label>Description</label>

        <textarea
          className="input-field"
          rows={4}
          placeholder="Movie description..."
          value={movieDescription}
          onChange={(e)=>setMovieDescription(e.target.value)}
          required
        />

        <label>Poster Image</label>

        <input
          type="file"
          id="posterFileInput"
          accept="image/*"
          onChange={handleFileChange}
          style={{display:'none'}}
        />

        <label
          htmlFor="posterFileInput"
          className="file-input"
          style={{
            cursor:'pointer',
            display:'block',
            textAlign:'center'
          }}
        >
          {posterFileName
            ? `✓ ${posterFileName}`
            : '↑ Click to upload poster'}
        </label>

        {/* NEW */}

        <label>Movie Status</label>

        <select
          className="input-field"
          value={
            isComingSoon
              ? 'comingSoon'
              : 'nowShowing'
          }
          onChange={(e)=>
            setIsComingSoon(
              e.target.value === 'comingSoon'
            )
          }
        >
          <option value="nowShowing">
            Now Showing
          </option>

          <option value="comingSoon">
            Coming Soon
          </option>
        </select>

        {isComingSoon && (
          <>
            <label>
              Expected Release Date
            </label>

            <input
              type="date"
              className="input-field"
              value={releaseDate}
              onChange={(e)=>
                setReleaseDate(
                  e.target.value
                )
              }
            />
          </>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{
            width:'100%',
            marginTop:'8px'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Uploading...'
            : 'Add to Lineup'}
        </button>

      </form>
    </div>
  );
}

// ─────────────────────────────────────────
// ADD SHOWTIME FORM
// ─────────────────────────────────────────

function AddShowtimeForm() {

  const [movieList, setMovieList]             = useState([]);
  const [allShowtimes, setAllShowtimes]       = useState([]);

  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedScreens, setSelectedScreens] = useState(['1']);
  const [showDate, setShowDate]               = useState('');
  const [showTime, setShowTime]               = useState('');
  const [ticketPrice, setTicketPrice]         = useState('600');
  const [editingShowtimeId, setEditingShowtimeId] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  useEffect(() => {
    fetchMovies();
    fetchAllShowtimes();
  }, []);

  async function fetchMovies() {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovieList(response.data);
    } catch (error) {
      setErrorMessage('Failed to load movies.');
    }
  }

  async function fetchAllShowtimes() {
    try {
      const response = await axios.get('http://localhost:5000/api/showtimes');
      setAllShowtimes(response.data);
    } catch (error) {
      console.error('Failed to load showtimes.', error);
    }
  }

  function handleEditClick(showtime) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingShowtimeId(showtime._id);
    setSelectedMovieId(showtime.movieId?._id || showtime.movieId);
    setSelectedScreens([String(showtime.screen)]);
    setShowDate(showtime.date);
    setShowTime(showtime.time);
    setTicketPrice(String(showtime.price));
    setSuccessMessage('');
    setErrorMessage('');
  }

  async function handleDeleteShowtime(id) {
    if (!window.confirm('Delete this showtime?')) return;
    try {
      const token = localStorage.getItem('gkToken');
      await axios.delete(`http://localhost:5000/api/showtimes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllShowtimes(allShowtimes.filter((s) => s._id !== id));
      setSuccessMessage('Showtime removed.');
      if (editingShowtimeId === id) resetForm();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete showtime.');
    }
  }

  function resetForm() {
    setEditingShowtimeId(null);
    setSelectedMovieId('');
    setSelectedScreens(['1']);
    setShowDate('');
    setShowTime('');
    setTicketPrice('600');
  }

  async function handleAddOrUpdateShowtime(event) {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (selectedScreens.length === 0) {
      setErrorMessage('Please select at least one screen.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('gkToken');

      if (editingShowtimeId) {
        await axios.put(
          `http://localhost:5000/api/showtimes/${editingShowtimeId}`,
          {
            screen: Number(selectedScreens[0]),
            date:   showDate,
            time:   showTime,
            price:  Number(ticketPrice),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('Showtime updated.');
      } else {
        const promises = selectedScreens.map(scr =>
          axios.post(
            'http://localhost:5000/api/showtimes',
            {
              movieId: selectedMovieId,
              screen:  Number(scr),
              date:    showDate,
              time:    showTime,
              price:   Number(ticketPrice),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );
        await Promise.all(promises);
        setSuccessMessage('Showtime(s) added.');
      }

      await fetchAllShowtimes();
      resetForm();

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save showtime.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleScreen(val) {
    if (editingShowtimeId) {
      setSelectedScreens([val]);
    } else {
      setSelectedScreens(prev =>
        prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
      );
    }
  }

  return (
    <div className="showtime-layout">

      {/* Left: Form */}
      <div className="admin-form-card" style={{ position: 'sticky', top: '20px' }}>
        <div className="admin-section-label">
          {editingShowtimeId ? 'Editing' : 'New Entry'}
        </div>
        <h3>{editingShowtimeId ? 'Edit Showtime' : 'Add Showtime'}</h3>
        <p className="form-subtitle">
          {editingShowtimeId
            ? 'Update the details for this screening.'
            : 'Schedule a new screening across one or more screens.'}
        </p>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage   && <div className="admin-error">{errorMessage}</div>}

        <form onSubmit={handleAddOrUpdateShowtime}>

          <label>Movie</label>
          <select
            className="input-field"
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            disabled={!!editingShowtimeId}
            required
          >
            <option value="">— Select a film —</option>
            {movieList.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title} ({movie.language})
              </option>
            ))}
          </select>

          <label>Screens</label>
          <div className="screen-checks">
            {['1', '2'].map(val => (
              <label
                key={val}
                className={`screen-check-label ${selectedScreens.includes(val) ? 'is-checked' : ''}`}
              >
                <input
                  type="checkbox"
                  value={val}
                  checked={selectedScreens.includes(val)}
                  onChange={() => toggleScreen(val)}
                />
                Screen {val}
              </label>
            ))}
          </div>

          <label>Date</label>
          <input
            type="date"
            className="input-field"
            value={showDate}
            onChange={(e) => setShowDate(e.target.value)}
            required
          />

          <label>Time</label>
          <input
            type="time"
            className="input-field"
            value={showTime}
            onChange={(e) => setShowTime(e.target.value)}
            required
          />

          <label>Ticket Price (LKR)</label>
          <input
            type="number"
            className="input-field"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            required
          />

          <div className="btn-row">
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving…'
                : editingShowtimeId ? 'Update Showtime' : 'Add Showtime'}
            </button>

            {editingShowtimeId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Right: Showtimes Table */}
      <div className="showtime-table-panel">
        <div className="showtime-table-panel-header">
          <h3>Scheduled Screenings</h3>
          <span className="showtime-count">{allShowtimes.length} total</span>
        </div>

        {allShowtimes.length === 0 ? (
          <p className="no-bookings-admin">No showtimes scheduled yet.</p>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Film</th>
                <th>Screen</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allShowtimes.map(st => (
                <tr key={st._id} style={editingShowtimeId === st._id ? { background: 'rgba(212,170,95,0.05)' } : {}}>
                  <td>{st.movieId?.title || 'Unknown'}</td>
                  <td>
                    <span className="badge paid" style={{ padding: '3px 8px' }}>
                      S{st.screen}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                    {new Date(st.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>{st.time}</td>
                  <td className="table-price">Rs {st.price}</td>
                  <td>
                    <div className="btn-row">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditClick(st)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteShowtime(st._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────
// ALL BOOKINGS TABLE
// ─────────────────────────────────────────

function AllBookingsTable() {

  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchAllBookings();
  }, []);

  async function fetchAllBookings() {
    try {
      const token = localStorage.getItem('gkToken');
      const response = await axios.get('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllBookings(response.data);
    } catch (error) {
      setErrorMessage('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  }

  function calculateTotalRevenue() {
    return allBookings
      .filter(b => b.cancelStatus !== 'refunded')
      .reduce((total, booking) => total + booking.totalPrice, 0);
  }

  async function handleCancelRequest(bookingId, action) {
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this cancellation request?`)) return;
    try {
      const token = localStorage.getItem('gkToken');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/handle-cancel`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllBookings();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} cancellation.`);
    }
  }

  if (isLoading) return <div className="loading">Loading bookings…</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;

  const totalRevenue = calculateTotalRevenue();
  const cancelRequests = allBookings.filter(b => b.cancelStatus === 'requested').length;

  return (
    <div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">LKR {totalRevenue.toLocaleString()}</div>
          <div className="stat-sub">excl. refunded</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{allBookings.length}</div>
          <div className="stat-sub">all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Cancellations</div>
          <div className="stat-value" style={{ color: cancelRequests > 0 ? 'var(--amber)' : 'var(--text-3)' }}>
            {cancelRequests}
          </div>
          <div className="stat-sub">awaiting action</div>
        </div>
      </div>

      {/* Empty state */}
      {allBookings.length === 0 && (
        <div className="no-bookings-admin">No bookings have been made yet.</div>
      )}

      {/* Bookings table */}
      {allBookings.length > 0 && (
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Film</th>
                <th>Date &amp; Time</th>
                <th>Screen</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.map((booking) => (
                <tr key={booking._id}>

                  <td>
                    <div>{booking.userId?.name}</div>
                    <div className="table-sub">{booking.userId?.email}</div>
                  </td>

                  <td>{booking.showtimeId?.movieId?.title}</td>

                  <td>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                      {booking.showtimeId?.date}
                    </div>
                    <div className="table-sub">{booking.showtimeId?.time}</div>
                  </td>

                  <td style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                    S{booking.showtimeId?.screen}
                  </td>

                  <td style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                    {booking.seats.join(', ')}
                  </td>

                  <td className="table-price">
                    LKR {booking.totalPrice.toLocaleString()}
                  </td>

                  <td>
                    <div style={{ marginBottom: booking.cancelStatus === 'requested' ? '8px' : '0' }}>
                      {booking.paymentStatus === 'paid' && booking.cancelStatus === 'none' && (
                        <span className="badge paid">Paid</span>
                      )}
                      {booking.cancelStatus === 'requested' && (
                        <span className="badge requested">Cancel Requested</span>
                      )}
                      {booking.cancelStatus === 'refunded' && (
                        <span className="badge refunded">Refunded</span>
                      )}
                      {booking.cancelStatus === 'rejected' && (
                        <span className="badge rejected">Rejected</span>
                      )}
                    </div>

                    {booking.cancelStatus === 'requested' && (
                      <div className="btn-row">
                        <button
                          className="action-btn approve"
                          onClick={() => handleCancelRequest(booking._id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleCancelRequest(booking._id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;