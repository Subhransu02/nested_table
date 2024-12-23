import { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = "https://jsonplaceholder.typicode.com/posts";

const fetchData = async () => {
  try {
    const response = await axios.get(apiUrl);
    return response.data; // Return a set of posts (you can change this to fit your needs)
  } catch (error) {
    console.error("Error fetching data", error);
    throw new Error("Error fetching data");
  }
};

// TableRow Component - handles expanding and rendering repeated data
const TableRow = ({ data, level, expandedRows, toggleRow, fetchDataForRow }) => {
  const key = `${data.id}-${level}`; // Unique key for the row based on ID and level

  return (
    <>
      <tr>
        <td>{data.id}</td>
        <td>
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => toggleRow(data.id, level, fetchDataForRow)}
          >
            {data.title}
          </span>
        </td>
        <td>{data.body}</td>
      </tr>
      {expandedRows.has(key) && (
        <tr>
          <td colSpan="3">
            <NestedTable
              data={[data]}  // Wrap data in an array to avoid the error
              level={level + 1}  // Increment level
              expandedRows={expandedRows}
              toggleRow={toggleRow}
              fetchDataForRow={fetchDataForRow}
            />
          </td>
        </tr>
      )}
    </>
  );
};

// NestedTable Component - for rendering repeated data at different levels
const NestedTable = ({ data, level, expandedRows, toggleRow, fetchDataForRow }) => {
  if (level >= 5) return null; // Limit depth to 5
  
  // Ensure data is an array before calling .map()
  if (!Array.isArray(data)) {
    console.error("Expected 'data' to be an array, but received:", data);
    return null;  // Or render something else (like an error message)
  }

  return (
    <table border="1" style={{ marginLeft: level * 20 }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Body</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            data={item}
            level={level}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            fetchDataForRow={fetchDataForRow}
          />
        ))}
      </tbody>
    </table>
  );
};

const MainTable = () => {
  const [data, setData] = useState([]);  // Store data fetched from the API
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data fetching when the component loads
  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchData(); // Fetch the initial data
        setData(result);  // Store the data
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  // Handle row expansion and data fetching
  const toggleRow = async (id, level, fetchDataForRow) => {
    const key = `${id}-${level}`;
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(key)) {
        newExpandedRows.delete(key); // Collapse the row
      } else {
        newExpandedRows.add(key); // Expand the row
        fetchDataForRow(id, level); // Fetch data when expanding a row
      }
      return newExpandedRows;
    });
  };

  // Fetch data for a specific row when it is expanded
  const fetchDataForRow = async (parentId, level) => {
    try {
      const newData = await fetchData(parentId); // Fetch nested data for the row
      setData((prevData) => [...prevData, ...newData]); // Append the fetched data
    } catch (err) {
      console.error("Error fetching nested data", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Data Table with Nested Rows</h1>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Body</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              data={item}
              level={0} // Top-level rows
              expandedRows={expandedRows}
              toggleRow={toggleRow}
              fetchDataForRow={fetchDataForRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainTable;
