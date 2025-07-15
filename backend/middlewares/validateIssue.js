const validateIssue = (req, res, next) => {
  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
  }

  const { title, description, specialization, location } = req.body;

  // Validate required fields
  if (!title || !description || !specialization || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const locationData = typeof location === 'string' ? JSON.parse(location) : location;

    if (
      !locationData.type ||
      locationData.type !== 'Point' ||
      !Array.isArray(locationData.coordinates) ||
      locationData.coordinates.length !== 2
    ) {
      return res.status(400).json({
        message: 'Invalid location format. Must be a GeoJSON Point',
      });
    }

    const [lng, lat] = locationData.coordinates;
    if (
      typeof lng !== 'number' ||
      typeof lat !== 'number' ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      return res.status(400).json({
        message:
          'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90',
      });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Invalid location data format' });
  }

  next();
};

export default validateIssue;