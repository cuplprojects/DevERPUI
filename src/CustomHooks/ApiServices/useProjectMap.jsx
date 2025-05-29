// src/hooks/useProjectMap.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useProjectMap = () => {
  const [projectMap, setProjectMap] = useState({});

  useEffect(() => {
    axios.get('https://localhost:7212/api/Project')
      .then(res => {
        const map = {};
        res.data.forEach(project => {
          map[project.projectId] = project.name;
        });
        setProjectMap(map);
      })
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  return projectMap;
};

export default useProjectMap;
