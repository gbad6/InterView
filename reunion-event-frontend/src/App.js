import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, FormControl, Button, Table } from 'react-bootstrap';
import './index.css'; // Import the index.css file

function App() {
  const [events, setEvents] = useState([]);
  const [visibleEventsPerDate, setVisibleEventsPerDate] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [eventRegistrationStatus, setEventRegistrationStatus] = useState({});
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

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

          if (data && Array.isArray(data.data)) {
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

  useEffect(() => {
    const initialVisibleEvents = {};
    Object.keys(events).forEach((date) => {
      initialVisibleEvents[date] = 5;
    });
    setVisibleEventsPerDate(initialVisibleEvents);
  }, [events]);

  const groupEvents = (events) => {
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
    setVisibleEventsPerDate((prevVisibleEvents) => ({
      ...prevVisibleEvents,
      [date]: (prevVisibleEvents[date] || 0) + 5,
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query === '') {
      setAutoCompleteSuggestions([]);
    } else {
      const filteredSuggestions = Object.values(events)
        .flat()
        .filter((event) =>
          event.event.toLowerCase().includes(query.toLowerCase()) ||
          event.category.toLowerCase().includes(query.toLowerCase())
        )
        .map((event) => event.event);

      setAutoCompleteSuggestions(filteredSuggestions);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAutoCompleteSuggestions([]);
    setSearchQuery(suggestion);
  };

  const handleAttendClick = (event) => {
    const eventKey = `${event.ID}-${event.startDate}`;
    const isEventRegistered = eventRegistrationStatus[eventKey];

    if (isEventRegistered) {
      setSelectedEvents((prevSelectedEvents) =>
        prevSelectedEvents.filter((selectedEvent) => `${selectedEvent.ID}-${selectedEvent.startDate}` !== eventKey)
      );
    } else {
      setSelectedEvents((prevSelectedEvents) => [...prevSelectedEvents, event]);
    }

    setEventRegistrationStatus((prevStatus) => ({
      ...prevStatus,
      [eventKey]: !isEventRegistered,
    }));
  };

  const handleCancelEvent = (event) => {
    const eventKey = `${event.ID}-${event.startDate}`;

    setSelectedEvents((prevSelectedEvents) =>
      prevSelectedEvents.filter((selectedEvent) => `${selectedEvent.ID}-${selectedEvent.startDate}` !== eventKey)
    );

    setEventRegistrationStatus((prevStatus) => {
      const updatedStatus = { ...prevStatus };
      delete updatedStatus[eventKey];
      return updatedStatus;
    });
  };

  return (
    <div id="container">
      <h1 id="title">University Reunion Event</h1>

      {/* Search Input with Auto-complete */}
      <h2>Search events: </h2>
      <Form>
        <FormControl
          id="searchInput"
          type="text"
          placeholder="Search events by name or category"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search events by name or category"
        />
        {autoCompleteSuggestions.length > 0 && (
          <ul
            role="listbox"
            aria-label="Auto-complete suggestions"
          >
            {autoCompleteSuggestions.map((suggestion, index) => (
              <li
                key={index}
                role="option"
                tabIndex="0"
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSuggestionClick(suggestion);
                  }
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </Form>

      {/* Display Selected Events */}
      <div>
        <h2>Selected Events: </h2>
        <ul
          role="list"
          aria-label="Selected Events"
        >
          {selectedEvents.map((selectedEvent) => (
            <li key={selectedEvent.ID}>
              {selectedEvent.startDate} {selectedEvent.startTime} - {selectedEvent.endTime}: {selectedEvent.event}
              <Button
                variant="danger"
                onClick={() => handleCancelEvent(selectedEvent)}
              >
                Close
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Display Events list by date */}
      {Object.entries(events).map(([date, eventsForDate]) => (
        <div key={date}>
          <h3>{date}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Category</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsForDate
                .filter(
                  (event) =>
                    event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    event.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, visibleEventsPerDate[date] || 5)
                .map((event, index, array) => {
                  const eventKey = `${event.ID}-${event.startDate}`;
                  return (
                    <React.Fragment key={eventKey}>
                      <tr>
                        <td>{`${event.startTime} - ${event.endTime}`}</td>
                        <td>{event.event}</td>
                        <td>{event.category}</td>
                        <td>{event.availability}</td>
                        <td>
                          <Button
                            id="Button"
                            variant={eventRegistrationStatus[eventKey] ? 'success' : 'primary'}
                            onClick={() => handleAttendClick(event)}
                            disabled={event.availability === 0}
                            aria-label={`${
                              eventRegistrationStatus[eventKey] ? 'Registered' : 'Attend'
                            } for ${event.event}`}
                          >
                            {eventRegistrationStatus[eventKey] ? 'Registered' : 'Attend'}
                          </Button>
                        </td>
                      </tr>
                      {index === array.length - 1 && visibleEventsPerDate[date] < eventsForDate.length && (
                        <tr key="loadMore">
                          <td colSpan="5">
                            <button
                              id="Button2"
                              variant="outline-primary"
                              onClick={() => loadMore(date)}
                              aria-label="Load more events"
                            >
                              Load More
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  );
}

export default App;
