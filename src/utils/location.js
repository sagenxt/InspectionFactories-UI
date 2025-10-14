export const getCurrentLocation = (retryCount = 0) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Geolocation is not supported by this browser. Please enable location services."
        )
      );
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased to 30 seconds
      maximumAge: 0, // Don't use cached location, get fresh one
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("Location captured:", coordinates);
        resolve(coordinates);
      },
      async (error) => {
        let errorMessage = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions in your browser settings to submit inspections.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please check your device's location settings.";
            break;
          case error.TIMEOUT:
            // Retry once if timeout
            if (retryCount < 2) {
              console.log(
                `Location request timed out. Retrying... (Attempt ${
                  retryCount + 1
                })`
              );
              try {
                const coordinates = await getCurrentLocation(retryCount + 1);
                resolve(coordinates);
                return;
              } catch (retryError) {
                errorMessage =
                  "Location request timed out after multiple attempts. Please check your device's GPS signal.";
              }
            } else {
              errorMessage =
                "Location request timed out. Please ensure GPS is enabled and try again.";
            }
            break;
          default:
            errorMessage =
              "An unknown error occurred while retrieving location.";
            break;
        }

        reject(new Error(errorMessage));
      },
      options
    );
  });
};

export const requestLocationPermission = async () => {
  try {
    const coordinates = await getCurrentLocation();
    return coordinates;
  } catch (error) {
    throw error;
  }
};
