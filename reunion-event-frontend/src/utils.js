// Fetches event data from the API and organizes it into groups based on start date
export async function fetchData(setEvents) {
    const apiUrl = "https://v1.slashapi.com/events/google-sheets/FyqwlUzRL2/reunionevent";
    const apiKey = "OB8Pbh3aEK3sGUoFayUrzYnV0wMP13fO7kMQQzMV";

    try {
        // Make a GET request to the API with the provided API key
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
            },
        });

        if (response.ok) {
            // If the response is successful, parse the JSON data
            const data = await response.json();

            if (data && data.data) {
                // Ensure the data has the expected structure and convert it to an array if needed
                const eventsArray = Array.isArray(data.data) ? data.data : Object.values(data.data);

                // Group the events by start date and set the state with the grouped events
                const groupedEvents = groupEvents(eventsArray);
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
}

// Groups events by their start date
export function groupEvents(events) {
    const groupedEvents = {};

    if (Array.isArray(events)) {
        // Iterate through the events and organize them by start date
        events.forEach((event) => {
            const date = event.startDate;
            if (!groupedEvents[date]) {
                groupedEvents[date] = [];
            }
            groupedEvents[date].push(event);
        });
    } else {
        console.error('Error: Events data is not an array.');
    }

    return groupedEvents;
}

// Initializes the number of visible events per date with a default value
export const initializeVisibleEvents = (events, setVisibleEventsPerDate) => {
    const initialVisibleEvents = {};
    Object.keys(events).forEach((date) => {
        initialVisibleEvents[date] = 5;
    });
    setVisibleEventsPerDate(initialVisibleEvents);
};

// Increases the number of visible events for a specific date by 5
export function loadMore(date, setVisibleEventsPerDate) {
    setVisibleEventsPerDate((prevVisibleEvents) => ({
        ...prevVisibleEvents,
        [date]: (prevVisibleEvents[date] || 0) + 5,
    }));
}

// Handles the search functionality and updates autocomplete suggestions
export function handleSearch(query, setSearchQuery, setAutoCompleteSuggestions, events) {
    setSearchQuery(query);

    if (query === '') {
        // If the search query is empty, clear autocomplete suggestions
        setAutoCompleteSuggestions([]);
    } else {
        // Filter events based on the search query and update autocomplete suggestions
        const filteredSuggestions = Object.values(events)
            .flat()
            .filter((event) =>
                event.event.toLowerCase().includes(query.toLowerCase()) ||
                event.category.toLowerCase().includes(query.toLowerCase())
            )
            .map((event) => event.event);

        setAutoCompleteSuggestions(filteredSuggestions);
    }
}

// Handles the click on an autocomplete suggestion
export function handleSuggestionClick(suggestion, setSelectedSuggestion, setAutoCompleteSuggestions, setSearchQuery) {
    // Set the selected suggestion, clear autocomplete suggestions, and update the search query
    setSelectedSuggestion(suggestion);
    setAutoCompleteSuggestions([]);
    setSearchQuery(suggestion);
}

// Handles the click on the "Attend" button for an event
export function handleAttendClick(event, eventKey, eventRegistrationStatus, setSelectedEvents, setEventRegistrationStatus) {
    const isEventRegistered = eventRegistrationStatus[eventKey];

    if (isEventRegistered) {
        // If the event is already registered, remove it from the selected events
        setSelectedEvents((prevSelectedEvents) =>
            prevSelectedEvents.filter((selectedEvent) => `${selectedEvent.ID}-${selectedEvent.startDate}` !== eventKey)
        );
    } else {
        // If the event is not registered, add it to the selected events
        setSelectedEvents((prevSelectedEvents) => [...prevSelectedEvents, event]);
    }

    // Toggle the registration status for the clicked event
    setEventRegistrationStatus((prevStatus) => ({
        ...prevStatus,
        [eventKey]: !isEventRegistered,
    }));
}

// Handles the cancellation of an event registration
export function handleCancelEvent(event, setSelectedEvents, setEventRegistrationStatus) {
    const eventKey = `${event.ID}-${event.startDate}`;

    // Remove the canceled event from the selected events
    setSelectedEvents((prevSelectedEvents) =>
        prevSelectedEvents.filter((selectedEvent) => `${selectedEvent.ID}-${selectedEvent.startDate}` !== eventKey)
    );

    // Reset the registration status for the canceled event
    setEventRegistrationStatus((prevStatus) => {
        const updatedStatus = { ...prevStatus };
        delete updatedStatus[eventKey];
        return updatedStatus;
    });
}
