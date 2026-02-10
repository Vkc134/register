// import { createContext, useContext, useState, useEffect } from 'react';

// const DataContext = createContext();

// export const useData = () => useContext(DataContext);

// export const DataProvider = ({ children }) => {
//     const [candidates, setCandidates] = useState([]);
//     const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/candidates`;

//     useEffect(() => {
//         fetchCandidates();
//     }, []);

//     const getAuthHeaders = () => {
//         const token = localStorage.getItem('token');
//         return token ? {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         } : {
//             'Content-Type': 'application/json'
//         };
//     };

//     const fetchCandidates = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

//             const response = await fetch(API_URL, { headers });
//             if (response.ok) {
//                 const data = await response.json();
//                 setCandidates(data);
//             } else {
//                 console.error("Failed to fetch candidates");
//             }
//         } catch (error) {
//             console.error("Error connecting to backend:", error);
//         }
//     };

//     const addCandidate = async (candidateData) => {
//         try {
//             const response = await fetch(API_URL, {
//                 method: "POST",
//                 headers: getAuthHeaders(),
//                 body: JSON.stringify(candidateData),
//             });

//             if (response.ok) {
//                 const newCandidate = await response.json();
//                 setCandidates((prev) => [newCandidate, ...prev]);
//                 return newCandidate.id;
//             } else {
//                 console.error("Failed to add candidate");
//                 return null;
//             }
//         } catch (error) {
//             console.error("Error adding candidate:", error);
//             return null;
//         }
//     };

//     const getCandidate = (id) => {
//         return candidates.find(c => c.id === id);
//     };

//     const markCandidateViewed = async (id) => {
//         try {
//             await fetch(`${API_URL}/${id}/mark-viewed`, {
//                 method: 'PUT',
//                 headers: getAuthHeaders()
//             });

//             // Update local state to reflect the change immediately
//             setCandidates(prev => prev.map(c =>
//                 c.id === id ? { ...c, isViewed: true } : c
//             ));
//         } catch (error) {
//             console.error("Error marking candidate as viewed:", error);
//         }
//     };

//     return (
//         <DataContext.Provider value={{ candidates, addCandidate, getCandidate, markCandidateViewed }}>
//             {children}
//         </DataContext.Provider>
//     );
// };
//testing code by Arun
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // ✅ Added

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [candidates, setCandidates] = useState([]);
    const { user } = useAuth(); // ✅ Added
    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/candidates`;

    useEffect(() => {
        if (user) {              // ✅ Changed
            fetchCandidates();
        }
    }, [user]);                  // ✅ Changed

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        } : {
            'Content-Type': 'application/json'
        };
    };

    const fetchCandidates = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: getAuthHeaders()  // ✅ Slight improvement (consistent)
            });

            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            } else {
                console.error("Failed to fetch candidates");
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
        }
    };

    const addCandidate = async (candidateData) => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(candidateData),
            });

            if (response.ok) {
                const newCandidate = await response.json();
                setCandidates((prev) => [newCandidate, ...prev]);
                return newCandidate.id;
            } else {
                console.error("Failed to add candidate");
                return null;
            }
        } catch (error) {
            console.error("Error adding candidate:", error);
            return null;
        }
    };

    const getCandidate = (id) => {
        return candidates.find(c => c.id === id);
    };

    const markCandidateViewed = async (id) => {
        try {
            await fetch(`${API_URL}/${id}/mark-viewed`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            setCandidates(prev => prev.map(c =>
                c.id === id ? { ...c, isViewed: true } : c
            ));
        } catch (error) {
            console.error("Error marking candidate as viewed:", error);
        }
    };

    const deleteCandidate = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setCandidates(prev => prev.filter(c => c.id !== id));
                return true;
            } else {
                console.error("Failed to delete candidate");
                return false;
            }
        } catch (error) {
            console.error("Error deleting candidate:", error);
            return false;
        }
    };

    return (
        <DataContext.Provider value={{ candidates, addCandidate, getCandidate, markCandidateViewed, deleteCandidate }}>
            {children}
        </DataContext.Provider>
    );
};
