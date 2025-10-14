const API_BASE_URL =
  "https://inspectionfactories-production.up.railway.app/api";

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
};

export const inspectionAPI = {
  startInspection: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inspection-reports/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Start inspection error:", error);
      throw error;
    }
  },

  getSections: async (formType = "A", token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sections?formType=${formType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get sections error:", error);
      throw error;
    }
  },

  getQuestions: async (sectionId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/questions?sectionId=${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get questions error:", error);
      throw error;
    }
  },

  submitAnswers: async (inspectionReportId, answers, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/section`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionReportId,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Submit answers error:", error);
      throw error;
    }
  },

  getActiveInspectionReports: async (token, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/inspection-reports/active?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get active inspection reports error:", error);
      throw error;
    }
  },

  getInspectionReport: async (inspectionReportId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/inspection-reports/${inspectionReportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get inspection report error:", error);
      throw error;
    }
  },

  getAnswers: async (inspectionReportId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/answers?inspectionReportId=${inspectionReportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get answers error:", error);
      throw error;
    }
  },

  submitInspectionReport: async (inspectionReportId, coordinates, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/inspection-reports/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inspectionReportId,
            coordinates,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Submit inspection report error:", error);
      throw error;
    }
  },

  getStatusSummary: async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/inspection-reports/status-summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get status summary error:", error);
      throw error;
    }
  },

  getApplicationsStatusSummary: async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applications/status-summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get applications status summary error:", error);
      throw error;
    }
  },

  getApplications: async (token, page = 1, limit = 10, status = null) => {
    try {
      let url = `${API_BASE_URL}/applications?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get applications error:", error);
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId, status, comment, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update application status error:", error);
      throw error;
    }
  },
};

export default authAPI;
