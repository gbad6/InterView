import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [events, setEvents] = useState([]);

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
          if (Array.isArray(data)) {
            // Group events by start date, start time, end time, and event name
            const groupedEvents = groupEvents(data);
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
    // Group events by start date, start time, end time, and event name
    const groupedEvents = {};
    events.forEach((event) => {
      const key = `${event.start_date}-${event.start_time}-${event.end_time}-${event.event_name}`;
      if (!groupedEvents[key]) {
        groupedEvents[key] = [];
      }
      groupedEvents[key].push(event);
    });

    // Convert the grouped object back to an array
    const result = Object.values(groupedEvents).flat();

    return result;
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">University Reunion Event</h1>
      <ul className="list-group">
        {events.map((event) => (
          <li key={event.ID} className="list-group-item">
            <strong>{event.event_name}</strong> - {event.start_date} {event.start_time} - {event.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
