import { useState, useEffect } from 'react';
import axios from 'axios';

const useProjectMap = () => {
  const [projectMap, setProjectMap] = useState({});
  const [groupMap, setGroupMap] = useState({});
  const [typeMap, setTypeMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all projects
        const projectRes = await axios.get('https://localhost:7212/api/Project');
        const projectData = projectRes.data;

        const projectMapData = {};
        const groupIds = new Set();
        const typeIds = new Set();

        projectData.forEach(project => {
          projectMapData[project.projectId] = {
            name: project.name,
            groupId: project.groupId,
            typeId: project.typeId
          };
          groupIds.add(project.groupId);
          typeIds.add(project.typeId);
        });

        setProjectMap(projectMapData);

        // 2. Fetch all groups
        const groupRes = await axios.get('https://localhost:7212/api/Groups');
        const groupMapData = {};
        groupRes.data.forEach(group => {
          groupMapData[group.id] = group.name;
        });
        setGroupMap(groupMapData);

        // 3. Fetch all paper types
        const typeRes = await axios.get('https://localhost:7212/api/PaperTypes');
        const typeMapData = {};
        typeRes.data.forEach(type => {
          typeMapData[type.typeId] = type.types;
        });
        setTypeMap(typeMapData);

      } catch (error) {
        console.error('Error fetching project, group, or type data:', error);
      }
    };

    fetchData();
  }, []);

  return { projectMap, groupMap, typeMap };
};

export default useProjectMap;
