import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, FormControl, Button } from 'react-bootstrap';
import './index.css'; // Import the index.css file

function App() {
  const [events, setEvents] = useState([]);
  const [visibleEventsPerDate, setVisibleEventsPerDate] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = "https://v1.slashapi.com/events/google-sheets/FyqwlUzRL2/reunionevent";
      const apiKey = "OB8Pbh3aEK3sGUoFayUrzYnV0wMP13fO7kMQQzMV";

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-API-KEY': apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Log the data structure
          console.log('API Data:', data);

          // Ensure that the data has the expected structure
          if (data && Array.isArray(data.data)) {
            // Group events by date
            const groupedEvents = groupEvents(data.data);
            setEvents(groupedEvents);
          } else {
            console.error('Error: Unexpected data structure from API');
          }
        } else {
          console.error(`Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const groupEvents = (events) => {
    // Group events by date
    const groupedEvents = {};
    events.forEach((event) => {
      const date = event.startDate;
      if (!groupedEvents[date]) {
        groupedEvents[date] = [];
      }
      groupedEvents[date].push(event);
    });

    return groupedEvents;
  };

  const loadMore = (date) => {
    // Increase the number of visible events for a specific date by 5
    setVisibleEventsPerDate((prevVisibleEvents) => ({
      ...prevVisibleEvents,
      [date]: (prevVisibleEvents[date] || 0) + 5,
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filteredSuggestions = events
      .filter((event) =>
        event.event.toLowerCase().includes(query.toLowerCase()) ||
        event.category.toLowerCase().includes(query.toLowerCase())
      )
      .map((event) => event.event);
    setAutoCompleteSuggestions(filteredSuggestions);
  };

  return (
    <div id="container">
      <h1 id="title">University Reunion Event</h1>

      {/* Search Input with Auto-complete */}
      <Form>
        <FormControl
          id="searchInput"
          type="text"
          placeholder="Search events by name or category"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {autoCompleteSuggestions.length > 0 && (
          <ul>
            {autoCompleteSuggestions.map((suggestion, index) => (
              <li key={index} onClick={() => setSelectedEvent(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </Form>

      {/* Display Events based on Search and Selected Event */}
      <ul id="eventList">
        {Object.entries(events).map(([date, eventsForDate]) => (
          <div key={date}>
            <h2>{date}</h2>
            <ul>
              {eventsForDate
                .filter(
                  (event) =>
                    event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    event.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, visibleEventsPerDate[date] || 5)
                .map((event) => (
                  <li id="eventItem" key={event.ID}>
                    {event.startDate} {event.startTime} - {event.endTime}: {event.event}
                  </li>
                ))}
            </ul>
            {visibleEventsPerDate[date] < eventsForDate.length && (
              <button onClick={() => loadMore(date)}>Load More</button>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
}

export default App;
