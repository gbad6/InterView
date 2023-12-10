// Import necessary dependencies and styles
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, FormControl, Button, Table } from 'react-bootstrap';
import './index.css';
import * as Utils from './utils'; // Import the utils file

function App() {
  // State variables for managing application data
  const [events, setEvents] = useState([]);
  const [visibleEventsPerDate, setVisibleEventsPerDate] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [eventRegistrationStatus, setEventRegistrationStatus] = useState({});
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Fetch event data from the API on component mount
  useEffect(() => {
    Utils.fetchData(setEvents);
  }, []);

  // Initialize the number of visible events per date when events state changes
  useEffect(() => {
    Utils.initializeVisibleEvents(events, setVisibleEventsPerDate);
  }, [events]);

  return (
    <div id="container">
      <h1 id="title">University Reunion Event</h1>

      {/* Search Input with Auto-complete */}
      <h2>Search events: </h2>
      <Form>
        {/* Input for searching events */}
        <FormControl
          id="searchInput"
          type="text"
          placeholder="Search events by name or category"
          value={searchQuery}
          onChange={(e) => Utils.handleSearch(e.target.value, setSearchQuery, setAutoCompleteSuggestions, events)}
          aria-label="Search events by name or category"
        />
        {/* Display auto-complete suggestions when available */}
        {autoCompleteSuggestions.length > 0 && (
          <ul
            role="listbox"
            aria-label="Auto-complete suggestions"
          >
            {autoCompleteSuggestions.map((suggestion, index) => (
              <li
                key={index}
                role="option"
                aria-selected={suggestion === selectedSuggestion} // Reflect the selected state
                tabIndex="0"
                onClick={() => Utils.handleSuggestionClick(suggestion, setSelectedSuggestion, setAutoCompleteSuggestions, setSearchQuery)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    Utils.handleSuggestionClick(suggestion, setSelectedSuggestion, setAutoCompleteSuggestions, setSearchQuery);
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
          {/* Map through selected events and display them */}
          {selectedEvents.map((selectedEvent) => (
            <li key={selectedEvent.ID}>
              {/* Omit the date and time information */}
              {selectedEvent.event}
              <Button
                variant="danger"
                onClick={() => Utils.handleCancelEvent(selectedEvent, setSelectedEvents, setEventRegistrationStatus)}
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
          {/* Display date as a heading */}
          <h3>{date}</h3>
          {/* Table to display events for the current date */}
          <Table striped bordered hover>
            <thead>
              {/* Table header */}
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Category</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through events for the current date and display them */}
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
                      {/* Table row for each event */}
                      <tr>
                        <td>{`${event.startTime} - ${event.endTime}`}</td>
                        <td>{event.event}</td>
                        <td>{event.category}</td>
                        <td>{event.availability}</td>
                        {/* Button to attend or unregister from an event */}
                        <td>
                          <Button
                            id="Button"
                            variant={eventRegistrationStatus[eventKey] ? 'success' : 'primary'}
                            onClick={() => Utils.handleAttendClick(event, eventKey, eventRegistrationStatus, setSelectedEvents, setEventRegistrationStatus)}
                            disabled={event.availability === 0}
                            aria-label={`${
                              eventRegistrationStatus[eventKey] ? 'Registered' : 'Attend'
                            } for ${event.event}`}
                          >
                            {eventRegistrationStatus[eventKey] ? 'Registered' : 'Attend'}
                          </Button>
                        </td>
                      </tr>
                      {/* Display 'Load More' button if there are more events to show */}
                      {index === array.length - 1 && visibleEventsPerDate[date] < eventsForDate.length && (
                        <tr key="loadMore">
                          <td colSpan="5">
                            <Button
                              id="Button2"
                              variant="outline-primary"
                              onClick={() => Utils.loadMore(date, setVisibleEventsPerDate)}
                              aria-label="Load more events"
                            >
                              Load More
                            </Button>
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
