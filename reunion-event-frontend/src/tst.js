  const handleAttendClick = (event) => {
    const isEventRegistered = eventRegistrationStatus[event.ID];

    if (isEventRegistered) {
      // If the event is already registered, remove it from the registration status
      setEventRegistrationStatus((prevStatus) => ({
        ...prevStatus,
        [event.ID]: false,
      }));
      setSelectedEvents((prevSelectedEvents) =>
        prevSelectedEvents.filter((selectedEvent) => selectedEvent.ID !== event.ID)
      );
    } else {
      // If the event is not registered, add it to the registration status and selected events
      setEventRegistrationStatus((prevStatus) => ({
        ...prevStatus,
        [event.ID]: true,
      }));
      setSelectedEvents((prevSelectedEvents) => [...prevSelectedEvents, event]);
    }
  };

  const handleRemoveSelectedEvent = (event) => {
    setEventRegistrationStatus((prevStatus) => ({
      ...prevStatus,
      [event.ID]: false,
    }));
    setSelectedEvents((prevSelectedEvents) =>
      prevSelectedEvents.filter((selectedEvent) => selectedEvent.ID !== event.ID)
    );
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
                    <Button
                      variant={eventRegistrationStatus[event.ID] ? 'success' : 'primary'}
                      onClick={() => handleAttendClick(event)}
                      disabled={event.availability === 0}
                    >
                      {eventRegistrationStatus[event.ID] ? 'Registered' : 'Attend'}
                    </Button>
                  </li>
                ))}
            </ul>
            {visibleEventsPerDate[date] < eventsForDate.length && (
              <button onClick={() => loadMore(date)}>Load More</button>
            )}
          </div>
        ))}
      </ul>

      {/* Display Selected Events */}
      <div>
        <h2>Selected Events</h2>
        <ul>
          {selectedEvents.map((selectedEvent) => (
            <li key={selectedEvent.ID}>
              {selectedEvent.startDate} {selectedEvent.startTime} - {selectedEvent.endTime}: {selectedEvent.event}
              <Button
                variant="danger"
                onClick={() => handleRemoveSelectedEvent(selectedEvent)}
              >
                Close
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

export default App;
