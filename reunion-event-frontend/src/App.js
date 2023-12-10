import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, FormControl, Button, Autocomplete } from 'react-bootstrap';
import './index.css'; // Import the index.css file
import styled from 'styled-components';

function App() {
  const [events, setEvents] = useState([]);
  const [visibleEventsPerDate, setVisibleEventsPerDate] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  // Define state to track registration status for each event
  const [eventRegistrationStatus, setEventRegistrationStatus] = useState({});

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

  useEffect(() => {
    // Initialize visible events per date with a default value greater than 5
    const initialVisibleEvents = {};
    Object.keys(events).forEach((date) => {
      initialVisibleEvents[date] = 5; // Adjust the default value as needed
    });
    setVisibleEventsPerDate(initialVisibleEvents);
  }, [events]);

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
    if (query === '') {
      // If the search query is empty, reset the autocomplete suggestions
      setAutoCompleteSuggestions([]);
    } else {
      // Perform the search and update the autocomplete suggestions
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
    // Set the selected suggestion
    setSelectedSuggestion(suggestion);
    // Reset the suggestions
    setAutoCompleteSuggestions([]);
    // Update the search query with the selected suggestion
    setSearchQuery(suggestion);
  };

  const handleAttendClick = (event) => {
    const eventKey = `${event.ID}-${event.startDate}`;
    const isEventRegistered = eventRegistrationStatus[eventKey];
  
    if (isEventRegistered) {
      // If the event is already registered, remove it from the registration status
      setSelectedEvents((prevSelectedEvents) =>
        prevSelectedEvents.filter((selectedEvent) => `${selectedEvent.ID}-${selectedEvent.startDate}` !== eventKey)
      );
    } else {
      // If the event is not registered, add it to the registration status and selected events
      setSelectedEvents((prevSelectedEvents) => [...prevSelectedEvents, event]);
    }
  
    // Toggle the registration status for the clicked event
    setEventRegistrationStatus((prevStatus) => ({
      ...prevStatus,
      [eventKey]: !isEventRegistered,
    }));
  };

  // Reset state when event status is cancelled
  const handleCancelEvent = (event) => {
    const eventKey = `${event.ID}-${event.startDate}`;
  
    setSelectedEvents((prevSelectedEvents) =>
      prevSelectedEvents.filter((selectedEvent) => `${selectedEvent.ID}-${selectedEvent.startDate}` !== eventKey)
    );
  
    // Reset the registration status for the canceled event
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
        />
        {autoCompleteSuggestions.length > 0 && (
          <ul>
            {autoCompleteSuggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </Form>
      
      {/* Display Selected Events */}
      <div>
        <h2>Selected Events: </h2>
        <ul>
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
  
      {/* Display Events list by date*/}
      <ul id="eventList">
        {Object.entries(events).map(([date, eventsForDate]) => (
          <div key={date}>
            <p id="eventDate"> {date}</p>
            <ul>
              {eventsForDate
                .filter(
                  (event) =>
                    event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    event.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, visibleEventsPerDate[date] || 5)
                .map((event) => {
                  const eventKey = `${event.ID}-${event.startDate}`;
                  return (
                    <li id="eventItem" key={eventKey}>
                      {event.startDate} {event.startTime} - {event.endTime}: {event.event}
                      <Button 
                        id = "Button"
                        variant={eventRegistrationStatus[eventKey] ? 'success' : 'primary'}
                        onClick={() => handleAttendClick(event)}
                        disabled={event.availability === 0}
                        
                      >
                        {eventRegistrationStatus[eventKey] ? 'Registered' : 'Attend'}
                      </Button>
                    </li>
                  );
                })}
            </ul>
            {/* Display load more option */}
            {visibleEventsPerDate[date] < eventsForDate.length && (
              <button 
              id="Button2"
              onClick={() => loadMore(date)}>Load More
              </button>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
}

export default App;
