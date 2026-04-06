import { useState, useEffect, useRef } from 'react';
import { RiSearchLine, RiMapPinLine } from 'react-icons/ri';
import api from '../services/api';
import './CollegeSearch.css';

const CollegeSearch = ({ value, onChange, selectedCollege, onSelect }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchColleges = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/colleges?q=${encodeURIComponent(q)}`);
      setResults(res.data);
      setIsOpen(true);
    } catch (err) {
      console.error('College search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);

    // Debounce search
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchColleges(val), 300);
  };

  const handleSelect = (college) => {
    setQuery(college.name);
    onChange?.(college.name);
    onSelect?.(college);
    setIsOpen(false);
  };

  // Load initial colleges on focus if empty
  const handleFocus = async () => {
    if (results.length === 0 && !query.trim()) {
      setLoading(true);
      try {
        const res = await api.get('/colleges');
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="college-search" ref={wrapperRef}>
      <div className="college-search-input-wrap">
        <RiSearchLine className="college-search-icon" />
        <input
          type="text"
          className="form-input college-search-input"
          placeholder="Search your college..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          id="college-search-input"
        />
        {loading && <div className="college-search-spinner" />}
      </div>

      {selectedCollege && (
        <div className="college-search-selected">
          <RiMapPinLine />
          <span>{selectedCollege.name}</span>
          <span className="college-search-domain">@{selectedCollege.domain}</span>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="college-search-dropdown animate-slide-down" id="college-dropdown">
          {results.map((college) => (
            <button
              key={college._id}
              className="college-search-item"
              onClick={() => handleSelect(college)}
              type="button"
            >
              <div className="college-search-item-info">
                <span className="college-search-item-name">{college.name}</span>
                <span className="college-search-item-location">
                  {college.location?.city}, {college.location?.state}
                </span>
              </div>
              <span className="college-search-item-domain">@{college.domain}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.trim() && !loading && (
        <div className="college-search-dropdown">
          <div className="college-search-empty">No colleges found</div>
        </div>
      )}
    </div>
  );
};

export default CollegeSearch;
